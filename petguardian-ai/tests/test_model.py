"""
tests/test_model.py
───────────────────
Unit tests for model loading, preprocessing, prediction logic.
Run with: pytest tests/test_model.py -v
"""

import io
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

import numpy as np
from PIL import Image

# ── Ensure project root is on path ────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from utils.preprocessing      import preprocess_image, decode_predictions, validate_image_file
from utils.response_formatter import format_success, format_error, format_prediction
from config                   import get_config

Config = get_config()


# ── Helpers ───────────────────────────────────────────────────
def _make_file_storage(
    width=300, height=300, mode="RGB",
    filename="test.jpg", fmt="JPEG",
):
    """Create a minimal FileStorage-like object from a PIL image."""
    img = Image.new(mode, (width, height), color=(120, 80, 60))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    buf.seek(0)

    mock_fs = MagicMock()
    mock_fs.filename = filename
    mock_fs.stream   = buf
    return mock_fs


# ═══════════════════════════════════════════════════════════════
class TestPreprocessing(unittest.TestCase):
    """Tests for utils/preprocessing.py"""

    def test_preprocess_rgb_image(self):
        fs  = _make_file_storage(300, 300, "RGB")
        arr = preprocess_image(fs, target_size=(224, 224))
        self.assertEqual(arr.shape, (1, 224, 224, 3))
        self.assertGreaterEqual(arr.min(), 0.0)
        self.assertLessEqual(arr.max(),    1.0)

    def test_preprocess_rgba_image(self):
        """RGBA should be converted to RGB."""
        fs  = _make_file_storage(200, 200, "RGBA", filename="test.png", fmt="PNG")
        arr = preprocess_image(fs, target_size=(224, 224))
        self.assertEqual(arr.shape, (1, 224, 224, 3))

    def test_preprocess_small_image(self):
        """Small images should be upscaled correctly."""
        fs  = _make_file_storage(32, 32, "RGB")
        arr = preprocess_image(fs, target_size=(224, 224))
        self.assertEqual(arr.shape, (1, 224, 224, 3))

    def test_validate_valid_jpg(self):
        fs       = _make_file_storage(filename="photo.jpg")
        ok, msg  = validate_image_file(fs, {"jpg", "jpeg", "png"})
        self.assertTrue(ok)
        self.assertEqual(msg, "")

    def test_validate_invalid_extension(self):
        fs       = _make_file_storage(filename="photo.gif")
        ok, msg  = validate_image_file(fs, {"jpg", "jpeg", "png"})
        self.assertFalse(ok)
        self.assertIn("gif", msg.lower())

    def test_validate_no_file(self):
        mock_fs = MagicMock()
        mock_fs.filename = ""
        ok, msg = validate_image_file(mock_fs, {"jpg"})
        self.assertFalse(ok)

    def test_decode_predictions(self):
        preds      = np.array([[0.1, 0.7, 0.2]])
        classes    = ["Healthy", "Ringworm", "Dandruff"]
        decoded    = decode_predictions(preds, classes)
        self.assertEqual(decoded[0]["class"], "Ringworm")
        self.assertAlmostEqual(decoded[0]["confidence"], 0.7, places=5)
        self.assertEqual(len(decoded), 3)


# ═══════════════════════════════════════════════════════════════
class TestResponseFormatter(unittest.TestCase):
    """Tests for utils/response_formatter.py"""

    def test_format_success(self):
        resp = format_success({"key": "value"}, "All good")
        self.assertTrue(resp["success"])
        self.assertEqual(resp["message"], "All good")
        self.assertEqual(resp["data"]["key"], "value")
        self.assertIn("timestamp", resp)

    def test_format_error(self):
        resp = format_error("Something went wrong", 400, "details here")
        self.assertFalse(resp["success"])
        self.assertEqual(resp["message"], "Something went wrong")
        self.assertEqual(resp["error"]["code"], 400)

    def test_format_prediction_severe(self):
        resp = format_prediction(
            predicted_class = "Ringworm",
            confidence      = 0.92,
            severity        = "SEVERE",
            guidance        = "Go to vet now.",
            disclaimer      = "AI only.",
            all_predictions = [
                {"class": "Ringworm",  "confidence": 0.92},
                {"class": "Dandruff",  "confidence": 0.05},
            ],
            vet_connect     = True,
            home_care       = ["Do not treat at home."],
            image_filename  = "dog.jpg",
        )
        self.assertTrue(resp["success"])
        data = resp["data"]
        self.assertEqual(data["predictedClass"],    "Ringworm")
        self.assertEqual(data["severity"],          "SEVERE")
        self.assertTrue(data["vetConnectTrigger"])
        self.assertEqual(data["imageFilename"],     "dog.jpg")
        self.assertIn("analyzedAt", data)

    def test_format_prediction_mild(self):
        resp = format_prediction(
            predicted_class = "Dandruff",
            confidence      = 0.80,
            severity        = "MILD",
            guidance        = "Monitor at home.",
            disclaimer      = "AI only.",
            all_predictions = [{"class": "Dandruff", "confidence": 0.80}],
            vet_connect     = False,
            home_care       = ["Keep area clean."],
        )
        data = resp["data"]
        self.assertFalse(data["vetConnectTrigger"])
        self.assertEqual(data["severity"], "MILD")


# ═══════════════════════════════════════════════════════════════
class TestPredictor(unittest.TestCase):
    """Tests for predictor.py with mocked model."""

    def _make_predictor_with_mock(self):
        from predictor import Predictor
        p = Predictor()
        mock_model = MagicMock()
        mock_model.predict.return_value = np.array(
            [[0.05] * 22 + [0.90]]   # last class wins
        )
        mock_model.input_shape  = (None, 224, 224, 3)
        mock_model.output_shape = (None, 23)
        p._model       = mock_model
        p._class_names = [f"Disease_{i}" for i in range(22)] + ["Ringworm"]
        return p

    def test_predict_returns_dict(self):
        p   = self._make_predictor_with_mock()
        arr = np.random.rand(1, 224, 224, 3).astype(np.float32)
        res = p.predict(arr, "test.jpg")
        self.assertIsInstance(res, dict)
        self.assertIn("success", res)

    def test_predict_severe_disease(self):
        p = self._make_predictor_with_mock()
        # Ringworm is in SEVERE_DISEASES → should trigger vet connect
        arr = np.random.rand(1, 224, 224, 3).astype(np.float32)
        res = p.predict(arr, "test.jpg")
        if res["success"]:
            data = res["data"]
            self.assertEqual(data["predictedClass"], "Ringworm")
            self.assertEqual(data["severity"],       "SEVERE")
            self.assertTrue(data["vetConnectTrigger"])

    def test_predict_not_ready(self):
        from predictor import Predictor
        p   = Predictor()   # not loaded
        arr = np.zeros((1, 224, 224, 3))
        res = p.predict(arr)
        self.assertFalse(res["success"])

    def test_low_confidence_response(self):
        from predictor import Predictor
        p = Predictor()
        mock_model = MagicMock()
        # All very low confidence
        mock_model.predict.return_value = np.array(
            [[1 / 23] * 23]
        )
        p._model       = mock_model
        p._class_names = [f"Disease_{i}" for i in range(23)]
        arr = np.random.rand(1, 224, 224, 3).astype(np.float32)
        res = p.predict(arr)
        if res["success"]:
            # Low confidence → "Uncertain" with MILD severity
            data = res["data"]
            self.assertEqual(data["predictedClass"], "Uncertain")
            self.assertEqual(data["severity"],       "MILD")
            self.assertFalse(data["vetConnectTrigger"])


# ═══════════════════════════════════════════════════════════════
class TestSeverityClassification(unittest.TestCase):
    """Directly test _classify_severity logic."""

    def setUp(self):
        from predictor import Predictor
        self.p = Predictor()
        self.p._model       = MagicMock()
        self.p._class_names = []

    def test_severe_disease_name(self):
        self.assertEqual(self.p._classify_severity("Ringworm", 0.50), "SEVERE")

    def test_moderate_disease_name(self):
        self.assertEqual(self.p._classify_severity("Allergic Dermatitis", 0.50), "MODERATE")

    def test_mild_disease_name(self):
        self.assertEqual(self.p._classify_severity("Dandruff", 0.50), "MILD")

    def test_high_confidence_unknown(self):
        # Unknown disease + high confidence → SEVERE
        self.assertEqual(self.p._classify_severity("Unknown Disease", 0.90), "SEVERE")

    def test_medium_confidence_unknown(self):
        self.assertEqual(self.p._classify_severity("Unknown Disease", 0.70), "MODERATE")

    def test_low_confidence_unknown(self):
        self.assertEqual(self.p._classify_severity("Unknown Disease", 0.50), "MILD")


if __name__ == "__main__":
    unittest.main(verbosity=2)