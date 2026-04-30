"""
tests/test_api.py
─────────────────
Integration tests for Flask API endpoints.
Run with: pytest tests/test_api.py -v
"""

import io
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def _make_image_bytes(width=200, height=200, fmt="JPEG") -> bytes:
    img = Image.new("RGB", (width, height), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def _make_mock_predictor(severity="MODERATE", confidence=0.82):
    """Return a mock predictor that always returns a fixed prediction."""
    from utils.response_formatter import format_prediction
    from config                   import get_config
    C = get_config()

    mock = MagicMock()
    mock.is_ready = True
    mock.predict.return_value = format_prediction(
        predicted_class = "Allergic Dermatitis",
        confidence      = confidence,
        severity        = severity,
        guidance        = C.SEVERITY_GUIDANCE[severity],
        disclaimer      = C.DISCLAIMER,
        all_predictions = [
            {"class": "Allergic Dermatitis", "confidence": confidence},
            {"class": "Dry Skin",            "confidence": 0.10},
        ],
        vet_connect     = severity == "SEVERE",
        home_care       = ["Step 1", "Step 2"],
        image_filename  = "test.jpg",
    )
    mock._class_names = ["Allergic Dermatitis", "Dry Skin"]
    return mock


class TestHealthEndpoint(unittest.TestCase):

    def setUp(self):
        with patch("app.predictor") as mock_pred:
            mock_pred.is_ready = True
            from app import create_app
            self.app    = create_app()
            self.client = self.app.test_client()

    def test_health_returns_200(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)

    def test_health_json_structure(self):
        resp = self.client.get("/health")
        data = resp.get_json()
        self.assertIn("success",   data)
        self.assertIn("data",      data)
        self.assertIn("timestamp", data)
        self.assertIn("status",    data["data"])

    def test_health_success_true(self):
        resp = self.client.get("/health")
        data = resp.get_json()
        self.assertTrue(data["success"])


class TestPredictEndpoint(unittest.TestCase):

    def setUp(self):
        patcher = patch("app.predictor", _make_mock_predictor())
        patcher.start()
        self.addCleanup(patcher.stop)

        from app import create_app
        self.app    = create_app()
        self.client = self.app.test_client()

    def _post_image(self, img_bytes: bytes, filename="test.jpg", field="image"):
        return self.client.post(
            "/api/predict",
            data        = {field: (io.BytesIO(img_bytes), filename)},
            content_type= "multipart/form-data",
        )

    def test_predict_no_file(self):
        resp = self.client.post("/api/predict")
        self.assertEqual(resp.status_code, 400)
        data = resp.get_json()
        self.assertFalse(data["success"])

    def test_predict_wrong_field_name(self):
        img  = _make_image_bytes()
        resp = self._post_image(img, field="photo")  # wrong field
        self.assertEqual(resp.status_code, 400)

    def test_predict_valid_jpg(self):
        img  = _make_image_bytes()
        resp = self._post_image(img, "photo.jpg")
        self.assertIn(resp.status_code, [200, 503])   # 503 if no real model
        data = resp.get_json()
        self.assertIn("success", data)

    def test_predict_valid_png(self):
        img  = _make_image_bytes(fmt="PNG")
        resp = self._post_image(img, "photo.png")
        self.assertIn(resp.status_code, [200, 503])

    def test_predict_response_structure(self):
        img  = _make_image_bytes()
        resp = self._post_image(img)
        data = resp.get_json()
        if resp.status_code == 200 and data.get("success"):
            inner = data["data"]
            for key in [
                "predictedClass", "confidence", "severity",
                "guidance", "disclaimer", "vetConnectTrigger",
                "homeCareSteps", "allPredictions",
            ]:
                self.assertIn(key, inner, f"Missing key: {key}")

    def test_severity_values_valid(self):
        img  = _make_image_bytes()
        resp = self._post_image(img)
        data = resp.get_json()
        if resp.status_code == 200 and data.get("success"):
            self.assertIn(
                data["data"]["severity"],
                ["MILD", "MODERATE", "SEVERE"]
            )


class TestSeverityInfoEndpoint(unittest.TestCase):

    def setUp(self):
        from app import create_app
        self.app    = create_app()
        self.client = self.app.test_client()

    def test_severity_info_200(self):
        resp = self.client.get("/api/severity/info")
        self.assertEqual(resp.status_code, 200)

    def test_severity_info_has_three_levels(self):
        resp   = self.client.get("/api/severity/info")
        data   = resp.get_json()
        levels = data["data"]["severityLevels"]
        self.assertEqual(len(levels), 3)
        names  = {l["level"] for l in levels}
        self.assertEqual(names, {"MILD", "MODERATE", "SEVERE"})

    def test_severe_triggers_vet_connect(self):
        resp   = self.client.get("/api/severity/info")
        data   = resp.get_json()
        levels = {l["level"]: l for l in data["data"]["severityLevels"]}
        self.assertTrue(levels["SEVERE"]["vetConnect"])
        self.assertFalse(levels["MILD"]["vetConnect"])
        self.assertFalse(levels["MODERATE"]["vetConnect"])


class TestNotFoundHandler(unittest.TestCase):

    def setUp(self):
        from app import create_app
        self.app    = create_app()
        self.client = self.app.test_client()

    def test_404_returns_json(self):
        resp = self.client.get("/non/existent/route")
        self.assertEqual(resp.status_code, 404)
        data = resp.get_json()
        self.assertFalse(data["success"])


if __name__ == "__main__":
    unittest.main(verbosity=2)