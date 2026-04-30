"""
model_loader.py
───────────────
Loads Keras model with full cross-version compatibility.
Primary strategy: patched_config (proven to work with Keras 3.13.2 model on 3.12.1)
"""

import json
import logging
import os
import shutil
import tempfile

import numpy as np

# Silence TF noise
os.environ["TF_CPP_MIN_LOG_LEVEL"]  = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

logger = logging.getLogger(__name__)

# ── Module-level cache ────────────────────────────────────────
_model      = None
_model_path = None
_strategy   = None


# ═══════════════════════════════════════════════════════════════
# CONFIG PATCHER
# ═══════════════════════════════════════════════════════════════

KEYS_TO_REMOVE = {
    "quantization_config",
    "optional",
}

KEYS_TO_REMAP = {
    "batch_shape": "batch_input_shape",
}


def _patch_config_obj(obj):
    """Recursively patch a decoded JSON object."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in KEYS_TO_REMOVE:
                continue
            if k in KEYS_TO_REMAP:
                out[KEYS_TO_REMAP[k]] = _patch_config_obj(v)
            else:
                out[k] = _patch_config_obj(v)
        return out
    elif isinstance(obj, list):
        return [_patch_config_obj(i) for i in obj]
    return obj


def _patch_config_str(config_str: str) -> str:
    """Parse, patch, and re-serialise the model config JSON."""
    try:
        obj = json.loads(config_str)
        return json.dumps(_patch_config_obj(obj))
    except Exception as e:
        logger.warning("Config patching failed: %s — using original", e)
        return config_str


# ═══════════════════════════════════════════════════════════════
# LOADING STRATEGIES  (ordered: best first)
# ═══════════════════════════════════════════════════════════════

def _strategy_patched_config(model_path: str):
    """
    PRIMARY STRATEGY
    ─────────────────
    1. Copy .h5 to a temp file
    2. Patch 'model_config' JSON inside the copy
    3. Load from the patched copy
    4. Delete temp file

    Works for:  model saved with Keras 3.13.2, loaded on Keras 3.12.x
    Root cause: 'quantization_config' key added in 3.13, unknown to 3.12
    """
    import h5py
    import keras

    # ── Read original config ───────────────────────────────────
    with h5py.File(model_path, "r") as f:
        raw = f.attrs.get("model_config", "")
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")

    if not raw:
        raise ValueError("No model_config found in HDF5 file")

    patched = _patch_config_str(raw)

    # ── Write patched copy ────────────────────────────────────
    tmp_path = tempfile.mktemp(suffix=".h5")
    shutil.copy2(model_path, tmp_path)

    try:
        with h5py.File(tmp_path, "r+") as f:
            f.attrs["model_config"] = patched.encode("utf-8")

        model = keras.models.load_model(tmp_path, compile=False)
        return model

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _strategy_keras_native(model_path: str):
    """Direct keras load — works when versions match exactly."""
    import keras
    return keras.models.load_model(model_path, compile=False)


def _strategy_keras_unsafe(model_path: str):
    """keras load with safe_mode disabled."""
    import keras
    return keras.saving.load_model(model_path, compile=False, safe_mode=False)


def _strategy_tf_keras(model_path: str):
    """tf.keras load."""
    import tensorflow as tf
    return tf.keras.models.load_model(model_path, compile=False)


# Strategy order — patched_config FIRST (proven to work)
_STRATEGIES = [
    ("patched_config", _strategy_patched_config),
    ("keras_native",   _strategy_keras_native),
    ("keras_unsafe",   _strategy_keras_unsafe),
    ("tf_keras",       _strategy_tf_keras),
]


# ═══════════════════════════════════════════════════════════════
# PUBLIC API
# ═══════════════════════════════════════════════════════════════

def load_model(model_path: str):
    """
    Load (or return cached) Keras model.
    Tries strategies in order until one succeeds.

    Returns the loaded model.
    Raises RuntimeError if all strategies fail.
    """
    global _model, _model_path, _strategy

    # ── Return cached ──────────────────────────────────────────
    if _model is not None and _model_path == model_path:
        logger.debug(
            "Returning cached model '%s' (strategy: %s)",
            model_path, _strategy,
        )
        return _model

    # ── File check ─────────────────────────────────────────────
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at '{model_path}'.\n"
            "Place fine_tuned_model_fixed.h5 inside the models/ directory."
        )

    logger.info("Loading model: %s", model_path)

    # ── Try strategies ────────────────────────────────────────
    errors = {}

    for name, fn in _STRATEGIES:
        try:
            logger.info("Trying strategy [%s] …", name)
            model = fn(model_path)

            # ── Cache ──────────────────────────────────────────
            _model      = model
            _model_path = model_path
            _strategy   = name

            logger.info(
                "✅ Model loaded via [%s] | input=%s output=%s params=%s",
                name,
                model.input_shape,
                model.output_shape,
                f"{model.count_params():,}",
            )
            return _model

        except ImportError as e:
            logger.debug("[%s] skipped — not installed: %s", name, e)
            errors[name] = f"ImportError: {e}"
        except Exception as e:
            logger.warning("[%s] failed: %s", name, e)
            errors[name] = str(e)

    # ── All failed ────────────────────────────────────────────
    error_lines = "\n".join(f"  [{k}]: {v[:120]}" for k, v in errors.items())
    raise RuntimeError(
        f"Could not load model from '{model_path}'.\n\n"
        f"Errors:\n{error_lines}\n\n"
        "Solutions:\n"
        "  pip install keras==3.12.1  (to match your environment)\n"
        "  OR use models/fine_tuned_model_fixed.h5 (already patched)"
    )


def get_model():
    """Return the cached model. Raises if not loaded yet."""
    if _model is None:
        raise RuntimeError(
            "Model not loaded. Call load_model(path) first."
        )
    return _model


def get_model_info(model) -> dict:
    """Return a JSON-safe summary of the model."""
    try:
        return {
            "inputShape":  str(model.input_shape),
            "outputShape": str(model.output_shape),
            "totalParams": int(model.count_params()),
            "layers":      len(model.layers),
            "strategy":    _strategy or "unknown",
        }
    except Exception:
        return {"info": "unavailable", "strategy": _strategy or "unknown"}