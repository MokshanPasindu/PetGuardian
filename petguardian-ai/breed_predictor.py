"""
breed_predictor.py — PetGuardian AI
CNN-based Pet Breed & Category Classifier.
Model has TWO outputs:
  - breed_output  : 6 classes (Beagle, English Cocker Spaniel, Maine Coon, Persian, Siamese, Pug)
  - cat_output    : 2 classes (Cat, Dog)
"""

import logging
import os
from typing import Optional

import numpy as np
import tensorflow as tf
from PIL import Image
import io

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# LABELS — must match labels.json exactly
# ═══════════════════════════════════════════════════════════════════════════════

# Confirmed from labels.json:
# breed_labels: ["Beagle", "English Cocker Spaniel", "Maine Coon", "Persian", "Siamese", "Pug"]
BREED_LABELS = [
    "Beagle",
    "English Cocker Spaniel",
    "Maine Coon",
    "Persian",
    "Siamese",
    "Pug",
]

# Confirmed from labels.json:
# category_labels: ["Cat", "Dog"]
CATEGORY_LABELS = [
    "Cat",   # index 0
    "Dog",   # index 1
]

# Confirmed from labels.json breed_to_category
CATEGORY_MAP = {
    "Beagle"                : "Dog",
    "English Cocker Spaniel": "Dog",
    "Pug"                   : "Dog",
    "Maine Coon"            : "Cat",
    "Persian"               : "Cat",
    "Siamese"               : "Cat",
}

# Health notes per breed
BREED_HEALTH_NOTES = {
    "Beagle": {
        "common_conditions": ["Obesity", "Epilepsy", "Hypothyroidism", "Hip dysplasia"],
        "care_tips"        : "Beagles need regular exercise to prevent obesity. "
                             "Prone to ear infections — clean ears weekly.",
        "life_expectancy"  : "12–15 years",
        "temperament"      : "Friendly, curious, merry",
        "size"             : "Medium",
    },
    "English Cocker Spaniel": {
        "common_conditions": ["Ear infections", "Hip dysplasia", "Eye problems", "AIHA"],
        "care_tips"        : "Regular ear cleaning is essential. "
                             "Needs daily grooming to prevent matting.",
        "life_expectancy"  : "12–14 years",
        "temperament"      : "Gentle, smart, affectionate",
        "size"             : "Medium",
    },
    "Pug": {
        "common_conditions": [
            "Brachycephalic syndrome", "Obesity",
            "Skin fold infections",    "Eye ulcers",
        ],
        "care_tips"        : "Keep facial folds clean and dry daily. "
                             "Avoid hot weather — overheating risk is high.",
        "life_expectancy"  : "12–15 years",
        "temperament"      : "Charming, mischievous, loving",
        "size"             : "Small",
    },
    "Maine Coon": {
        "common_conditions": [
            "Hypertrophic cardiomyopathy", "Hip dysplasia",
            "Polycystic kidney disease",
        ],
        "care_tips"        : "Regular brushing needed (2–3×/week). "
                             "Monitor heart health with annual vet checks.",
        "life_expectancy"  : "12–15 years",
        "temperament"      : "Gentle, playful, dog-like",
        "size"             : "Large",
    },
    "Persian": {
        "common_conditions": [
            "Polycystic kidney disease", "Breathing issues",
            "Eye discharge",            "Dental malocclusion",
        ],
        "care_tips"        : "Daily face cleaning required. "
                             "Regular grooming essential — long coat mats easily.",
        "life_expectancy"  : "12–17 years",
        "temperament"      : "Quiet, gentle, sweet",
        "size"             : "Medium",
    },
    "Siamese": {
        "common_conditions": [
            "Dental issues", "Asthma",
            "Hypertrophic cardiomyopathy", "Amyloidosis",
        ],
        "care_tips"        : "Regular dental care needed. "
                             "Very vocal and social — needs companionship.",
        "life_expectancy"  : "15–20 years",
        "temperament"      : "Vocal, social, intelligent",
        "size"             : "Medium",
    },
}

# Image preprocessing constants
IMAGE_SIZE = (224, 224)


# ═══════════════════════════════════════════════════════════════════════════════
# BREED CLASSIFIER
# ═══════════════════════════════════════════════════════════════════════════════

class BreedClassifier:
    """
    Wraps the dual-output TensorFlow SavedModel.

    Model outputs (confirmed from check_breed_model.py):
      output_0: shape (1, 6)  → breed probabilities
      output_1: shape (1, 2)  → category probabilities (Cat, Dog)
    """

    def __init__(self) -> None:
        self._model = None
        self._model_path = os.path.join(
            os.path.dirname(__file__),
            "models",
            "pet_breed_category_classifier",
        )

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    # ── Load model ────────────────────────────────────────────────────────────
    def load_model(self) -> bool:
        if not os.path.exists(self._model_path):
            logger.error(
                "[BreedClassifier] Model path not found: %s", self._model_path
            )
            return False

        try:
            logger.info(
                "[BreedClassifier] Loading model from: %s", self._model_path
            )
            self._model = tf.saved_model.load(self._model_path)
            logger.info("[BreedClassifier] ✅ Model loaded successfully")

            # ── Verify model outputs ──────────────────────────────────────────
            self._verify_model()
            return True

        except Exception as exc:
            logger.exception(
                "[BreedClassifier] ❌ Failed to load model: %s", exc
            )
            self._model = None
            return False

    # ── Verify model output shapes ────────────────────────────────────────────
    def _verify_model(self):
        """
        Runs a dummy inference to confirm output shapes match labels.
        Logs warnings if mismatch found.
        """
        try:
            dummy   = np.zeros((1, 224, 224, 3), dtype=np.float32)
            tensor  = tf.constant(dummy)
            infer   = self._model.signatures["serving_default"]
            outputs = infer(tensor)

            for key, val in outputs.items():
                logger.info(
                    "[BreedClassifier] Output '%s' shape: %s",
                    key, val.shape
                )

            logger.info(
                "[BreedClassifier] Expected breed classes: %d, category classes: %d",
                len(BREED_LABELS), len(CATEGORY_LABELS)
            )

        except Exception as e:
            logger.warning(
                "[BreedClassifier] Could not verify model outputs: %s", e
            )

    # ── Preprocess image bytes ────────────────────────────────────────────────
    def _preprocess(self, image_bytes: bytes) -> np.ndarray:
        """
        Convert raw bytes → MobileNetV2 preprocessed array (1, 224, 224, 3)

        Steps:
          1. Open with Pillow
          2. Convert to RGB
          3. Resize to 224x224
          4. Apply MobileNetV2 preprocess_input (scales to [-1, 1])
          5. Add batch dimension
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
        except Exception as exc:
            raise ValueError(f"Cannot open image: {exc}") from exc

        # Convert to RGB
        img = img.convert("RGB")

        # Resize
        img = img.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)

        # To float32 array
        arr = np.array(img, dtype=np.float32)

        # ── MobileNetV2 preprocessing ─────────────────────────────────────────
        # train_ai.py uses: from tensorflow.keras.applications.mobilenet_v2
        #                   import preprocess_input
        # preprocess_input scales pixels from [0, 255] to [-1, 1]
        # We MUST match training preprocessing exactly
        arr = arr / 127.5 - 1.0      # equivalent to preprocess_input()

        # Add batch dimension: (224, 224, 3) → (1, 224, 224, 3)
        arr = np.expand_dims(arr, axis=0)

        return arr

    # ── Run inference ─────────────────────────────────────────────────────────
    def _infer(self, arr: np.ndarray):
        """
        Run inference using serving_default signature.

        Returns:
            breed_probs   : np.ndarray shape (6,)  — breed probabilities
            category_probs: np.ndarray shape (2,)  — category probabilities
        """
        tensor = tf.constant(arr, dtype=tf.float32)

        # Use serving_default (direct call fails: '_UserObject' not callable)
        infer   = self._model.signatures["serving_default"]
        outputs = infer(tensor)

        # ── Extract outputs by shape ──────────────────────────────────────────
        # output_0: shape (1, 6) → breed
        # output_1: shape (1, 2) → category
        breed_probs    = None
        category_probs = None

        for key, val in outputs.items():
            arr_out = val.numpy()[0]   # remove batch dim
            logger.debug(
                "[BreedClassifier] Output '%s' shape: %s", key, arr_out.shape
            )

            if arr_out.shape[0] == len(BREED_LABELS):
                # shape (6,) → breed output
                breed_probs = arr_out
                logger.debug("[BreedClassifier] '%s' → breed output", key)

            elif arr_out.shape[0] == len(CATEGORY_LABELS):
                # shape (2,) → category output
                category_probs = arr_out
                logger.debug("[BreedClassifier] '%s' → category output", key)

        if breed_probs is None:
            raise RuntimeError(
                f"Could not find breed output with {len(BREED_LABELS)} classes "
                f"in model outputs. Check BREED_LABELS count."
            )

        if category_probs is None:
            raise RuntimeError(
                f"Could not find category output with {len(CATEGORY_LABELS)} classes "
                f"in model outputs. Check CATEGORY_LABELS count."
            )

        return breed_probs, category_probs

    # ── Public predict ────────────────────────────────────────────────────────
    def predict(self, image_bytes: bytes) -> dict:
        """
        Classify a pet image.

        Returns dict with:
            predictedBreed      str
            predictedCategory   str   ("Dog" | "Cat")
            confidence          float (0–100)
            categoryConfidence  float (0–100)
            topPredictions      list  (top 3)
            healthNotes         dict
            totalClasses        int
        """
        if not self.is_ready:
            raise RuntimeError(
                "Breed classifier model is not loaded. "
                "Call load_model() first."
            )

        # Preprocess
        arr = self._preprocess(image_bytes)

        # Inference — get both breed and category outputs
        breed_probs, category_probs = self._infer(arr)

        # ── Breed prediction ──────────────────────────────────────────────────
        top_breed_idx        = int(np.argmax(breed_probs))
        top_breed_confidence = float(breed_probs[top_breed_idx])
        predicted_breed      = BREED_LABELS[top_breed_idx]

        # ── Category prediction (from dedicated cat_output) ───────────────────
        top_cat_idx          = int(np.argmax(category_probs))
        top_cat_confidence   = float(category_probs[top_cat_idx])
        predicted_category   = CATEGORY_LABELS[top_cat_idx]

        # ── Top-3 breed predictions ───────────────────────────────────────────
        top3_indices = np.argsort(breed_probs)[::-1][:3]
        top_predictions = [
            {
                "breed"     : BREED_LABELS[i],
                "category"  : CATEGORY_MAP.get(BREED_LABELS[i], "Unknown"),
                "confidence": round(float(breed_probs[i]) * 100, 2),
            }
            for i in top3_indices
        ]

        # ── Health notes ──────────────────────────────────────────────────────
        health_notes = BREED_HEALTH_NOTES.get(predicted_breed, {})

        logger.info(
            "[BreedClassifier] Breed: %s (%.1f%%) | Category: %s (%.1f%%)",
            predicted_breed,      top_breed_confidence * 100,
            predicted_category,   top_cat_confidence   * 100,
        )

        return {
            "predictedBreed"     : predicted_breed,
            "predictedCategory"  : predicted_category,
            "confidence"         : round(top_breed_confidence   * 100, 2),
            "categoryConfidence" : round(top_cat_confidence     * 100, 2),
            "topPredictions"     : top_predictions,
            "healthNotes"        : health_notes,
            "totalClasses"       : len(BREED_LABELS),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
breed_classifier = BreedClassifier()