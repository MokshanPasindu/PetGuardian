"""
extract_classes.py
──────────────────
Extracts class names from the trained model.

FIX: Replaced output_shape access (which fails on Keras 3.x Dense layers)
     with get_config()['units'] which always works.
"""

import json
import logging
import os
import shutil
import tempfile

logger = logging.getLogger(__name__)

# ── These MUST match model training order ─────────────────────
# If trained with ImageDataGenerator.flow_from_directory()
# folders are sorted ALPHABETICALLY — this list already is.
DEFAULT_CLASSES = [
    "Allergic Dermatitis",       # 00
    "Atopic Dermatitis",         # 01
    "Bacterial Skin Infection",  # 02
    "Contact Dermatitis",        # 03
    "Dandruff",                  # 04
    "Deep Pyoderma",             # 05
    "Dry Skin",                  # 06
    "Flea Allergy Dermatitis",   # 07
    "Fungal Infection",          # 08
    "Healthy Skin",              # 09
    "Hot Spot",                  # 10
    "Lupus Erythematosus",       # 11
    "Mange",                     # 12
    "Mild Irritation",           # 13
    "Minor Rash",                # 14
    "Pemphigus",                 # 15
    "Ringworm",                  # 16
    "Sebaceous Adenitis",        # 17
    "Seborrhea",                 # 18
    "Skin Tumor",                # 19
    "Squamous Cell Carcinoma",   # 20
    "Superficial Pyoderma",      # 21
    "Yeast Infection",           # 22
]


def _patch_config_str(config_str: str) -> str:
    """Remove keys unknown to the installed Keras version."""
    REMOVE = {"quantization_config", "optional"}
    REMAP  = {"batch_shape": "batch_input_shape"}

    def _clean(obj):
        if isinstance(obj, dict):
            return {
                REMAP.get(k, k): _clean(v)
                for k, v in obj.items()
                if k not in REMOVE
            }
        elif isinstance(obj, list):
            return [_clean(i) for i in obj]
        return obj

    try:
        return json.dumps(_clean(json.loads(config_str)))
    except Exception:
        return config_str


def _get_output_units(model) -> int | None:
    """
    Safely get the number of output units from the last layer.

    FIX: Use get_config()['units'] instead of output_shape
         because Dense.output_shape raises AttributeError in Keras 3.x
         when the model has not been built with a concrete input.
    """
    last_layer = model.layers[-1]

    # Method 1: get_config (most reliable for Dense layers)
    try:
        cfg   = last_layer.get_config()
        units = cfg.get("units")
        if units is not None:
            return int(units)
    except Exception as e:
        logger.debug("get_config() failed: %s", e)

    # Method 2: output_shape (works after model.build())
    try:
        shape = last_layer.output_shape
        if isinstance(shape, (list, tuple)):
            return int(shape[-1])
    except Exception as e:
        logger.debug("output_shape failed: %s", e)

    # Method 3: compute_output_shape with dummy input
    try:
        import numpy as np
        dummy   = np.zeros((1, 224, 224, 3), dtype=np.float32)
        out     = model(dummy, training=False)
        return int(out.shape[-1])
    except Exception as e:
        logger.debug("dummy forward pass failed: %s", e)

    return None


def _try_get_names_from_model(model_path: str) -> list[str] | None:
    """
    Attempt to load the model and read class names.
    Priority:
      1. sibling classes.json file
      2. output layer config (class_names key)
      3. output unit count validation
    """
    import h5py

    # ── 1. Check for sibling classes.json ─────────────────────
    classes_json = os.path.join(os.path.dirname(model_path), "classes.json")
    if os.path.exists(classes_json):
        try:
            with open(classes_json, "r") as f:
                names = json.load(f)
            logger.info("Loaded %d classes from %s", len(names), classes_json)
            return names
        except Exception as e:
            logger.warning("Could not read classes.json: %s", e)

    # ── 2. Load model with patch ───────────────────────────────
    try:
        import keras

        with h5py.File(model_path, "r") as f:
            raw = f.attrs.get("model_config", "")
            if isinstance(raw, bytes):
                raw = raw.decode("utf-8")

        patched = _patch_config_str(raw)
        tmp     = tempfile.mktemp(suffix=".h5")
        shutil.copy2(model_path, tmp)

        try:
            with h5py.File(tmp, "r+") as f:
                f.attrs["model_config"] = patched.encode("utf-8")
            model = keras.models.load_model(tmp, compile=False)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)

        # ── Check output layer config for class_names ──────────
        out_layer = model.layers[-1]
        cfg = out_layer.get_config()
        if "class_names" in cfg:
            logger.info("Found class_names in output layer config")
            return cfg["class_names"]

        # ── Validate unit count ────────────────────────────────
        units = _get_output_units(model)   # FIX: safe method
        if units is not None:
            logger.info(
                "Model output units: %d | DEFAULT_CLASSES: %d",
                units, len(DEFAULT_CLASSES),
            )
            if units != len(DEFAULT_CLASSES):
                logger.error(
                    "CRITICAL MISMATCH: model has %d output units "
                    "but DEFAULT_CLASSES has %d entries! "
                    "Predictions will be WRONG.",
                    units, len(DEFAULT_CLASSES),
                )
        else:
            logger.warning(
                "Could not determine output units — "
                "using DEFAULT_CLASSES (%d) unverified",
                len(DEFAULT_CLASSES),
            )

        return None

    except Exception as e:
        logger.error("extract_class_names failed: %s — using defaults", e)
        return None


def extract_class_names(model_path: str) -> list[str]:
    """
    Return class names for the model.
    Priority:
      1. models/classes.json  (manual override — recommended)
      2. Model output layer config
      3. DEFAULT_CLASSES (hardcoded alphabetical order)
    """
    names = _try_get_names_from_model(model_path)

    if names and len(names) == len(DEFAULT_CLASSES):
        return names

    logger.info("Using DEFAULT_CLASSES (%d classes)", len(DEFAULT_CLASSES))
    return DEFAULT_CLASSES


def get_class_names(model_path: str) -> list[str]:
    """Public API — used by predictor.py."""
    names = extract_class_names(model_path)
    logger.debug("Class names resolved: %s", names)
    return names


# ── CLI ───────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model",
        default="models/fine_tuned_model_fixed_fixed.h5"
    )
    args  = parser.parse_args()
    names = get_class_names(args.model)

    print(f"\n{len(names)} classes:")
    for i, n in enumerate(names):
        print(f"  [{i:02d}] {n}")