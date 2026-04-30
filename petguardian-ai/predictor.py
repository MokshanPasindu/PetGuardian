"""
predictor.py
────────────
Core prediction logic.

FIX: Severity fallback logic corrected.
     High confidence should NOT automatically mean SEVERE.
     Disease name takes priority; confidence is secondary signal
     only when disease is not in any known set.
"""

import logging

import numpy as np
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"]  = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from config              import get_config
from extract_classes     import get_class_names
from model_loader        import load_model
from utils.preprocessing import decode_predictions
from utils.response_formatter import format_prediction, format_error

logger = logging.getLogger(__name__)
Config = get_config()


class Predictor:
    """Singleton-style predictor — model loaded once and reused."""

    def __init__(self):
        self._model       = None
        self._class_names = None

    # ── Initialisation ────────────────────────────────────────
    def load(self, model_path: str | None = None):
        """Load model and class names. Safe to call multiple times."""
        path              = model_path or Config.MODEL_PATH
        self._model       = load_model(path)
        self._class_names = get_class_names(path)
        logger.info(
            "Predictor ready | %d classes | model=%s",
            len(self._class_names), path,
        )

    @property
    def is_ready(self) -> bool:
        return self._model is not None and self._class_names is not None

    # ── Core prediction ───────────────────────────────────────
    def predict(self, image_array: np.ndarray, filename: str = "") -> dict:
        """
        Run inference and return a fully formatted response dict.
        """
        if not self.is_ready:
            return format_error(
                "AI model is not loaded. Please try again later.", code=503
            )

        try:
            # ── Inference ──────────────────────────────────────
            raw_preds = self._model.predict(image_array, verbose=0)


            # Log raw output distribution for debugging
            logger.debug(
                "Raw output | min=%.4f max=%.4f sum=%.4f argmax=%d",
                float(raw_preds.min()),
                float(raw_preds.max()),
                float(raw_preds.sum()),
                int(np.argmax(raw_preds[0])),
            )

            # ── Decode ─────────────────────────────────────────
            all_preds = decode_predictions(raw_preds, self._class_names)
            top       = all_preds[0]
            top_class = top["class"]
            top_conf  = top["confidence"]

            logger.info(
                "Prediction: '%s' conf=%.4f file='%s'",
                top_class, top_conf, filename,
            )

            # Log top-3 for debugging
            logger.debug(
                "Top-3: %s",
                [(p["class"], f"{p['confidence']:.4f}") for p in all_preds[:3]]
            )

            # ── Low-confidence fallback ────────────────────────
            if top_conf < Config.CONFIDENCE_THRESHOLD:
                return self._low_confidence_response(
                    top_conf, all_preds, filename
                )

            # ── Severity ───────────────────────────────────────
            severity    = self._classify_severity(top_class, top_conf)
            guidance    = Config.SEVERITY_GUIDANCE[severity]
            vet_trigger = severity == "SEVERE"
            home_care   = self._get_home_care_steps(severity, top_class)

            logger.info(
                "Result: class='%s' conf=%.4f severity=%s vet_trigger=%s",
                top_class, top_conf, severity, vet_trigger,
            )

            return format_prediction(
                predicted_class = top_class,
                confidence      = top_conf,
                severity        = severity,
                guidance        = guidance,
                disclaimer      = Config.DISCLAIMER,
                all_predictions = all_preds,
                vet_connect     = vet_trigger,
                home_care       = home_care,
                image_filename  = filename,
            )

        except Exception as exc:
            logger.exception("Prediction failed: %s", exc)
            return format_error(f"Prediction error: {str(exc)}", code=500)

    # ── Severity classification ───────────────────────────────
    def _classify_severity(self, disease: str, confidence: float) -> str:
        """
        Determine severity using disease name first, confidence second.

        FIX: Confidence fallback logic was inverted.
             High confidence + unknown disease → does NOT mean SEVERE.
             Use linear thresholds instead.
        """
        # ── Priority 1: Disease name lookup ───────────────────
        if disease in Config.SEVERE_DISEASES:
            return "SEVERE"
        if disease in Config.MODERATE_DISEASES:
            return "MODERATE"
        if disease in Config.MILD_DISEASES:
            return "MILD"

        # ── Priority 2: Confidence fallback ───────────────────
        # Only reached if disease name is not in any set
        # (e.g. model returns an unexpected class)
        logger.warning(
            "Disease '%s' not found in any severity set — "
            "using confidence fallback (conf=%.4f)",
            disease, confidence,
        )
        if confidence >= Config.MODERATE_THRESHOLD:
            return "MODERATE"
        if confidence >= Config.MILD_THRESHOLD:
            return "MILD"
        return "MILD"

    # ── Home care steps ───────────────────────────────────────
    def _get_home_care_steps(self, severity: str, disease: str) -> list[str]:
        """Return care steps appropriate for the severity level."""
        base = {
            "MILD": [
                "Keep the affected area clean and dry.",
                "Prevent your pet from licking or scratching the area.",
                "Monitor for changes over the next 3–5 days.",
                "Ensure your pet is on a balanced, nutritious diet.",
                "Use a gentle, pet-safe shampoo if bathing is needed.",
                "Consult a vet if symptoms persist or worsen.",
            ],
            "MODERATE": [
                "Do not apply human medications or unverified home remedies.",
                "Keep the affected area clean using mild antiseptic (vet-approved).",
                "Use an Elizabethan collar (cone) to prevent licking or scratching.",
                "Book a veterinary appointment within 24–48 hours.",
                "Monitor for fever, lethargy, or loss of appetite.",
                "Keep a photo record of the condition to show your vet.",
            ],
            "SEVERE": [
                "Seek immediate veterinary care — do not delay.",
                "Do NOT attempt home treatment for this condition.",
                "Keep your pet calm and restrict movement during transport.",
                "Do not feed your pet before the vet visit (sedation may be needed).",
                "Bring any previous medical records to the clinic.",
                "Emergency vet clinics are shown below.",
            ],
        }
        return base.get(severity, base["MILD"])

    # ── Low confidence response ───────────────────────────────
    def _low_confidence_response(
        self,
        confidence: float,
        all_preds:  list[dict],
        filename:   str,
    ) -> dict:
        """Return a safe response when confidence is below threshold."""
        logger.warning(
            "Low confidence %.4f for '%s' — returning uncertain response",
            confidence, filename,
        )
        return format_prediction(
            predicted_class = "Uncertain",
            confidence      = confidence,
            severity        = "MILD",
            guidance        = (
                "The AI could not confidently identify the condition from this image. "
                "This may be due to image quality, lighting, or an unusual presentation. "
                "Please upload a clearer image or consult a veterinarian directly."
            ),
            disclaimer      = Config.DISCLAIMER,
            all_predictions = all_preds,
            vet_connect     = False,
            home_care       = [
                "Upload a clearer, well-lit photo of the affected area.",
                "Ensure the area is in focus and visible (trim surrounding fur if needed).",
                "Try photographing in natural daylight.",
                "If in doubt, always consult a veterinarian.",
            ],
            image_filename  = filename,
        )


# ── Module-level singleton ────────────────────────────────────
predictor = Predictor()