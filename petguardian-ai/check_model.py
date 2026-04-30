"""
check_model.py
──────────────
Model verification for Keras 3.x saved models.
"""

import json
import logging
import os
import sys
import time

import numpy as np

# ── Silence TF/oneDNN spam ────────────────────────────────────
os.environ["TF_CPP_MIN_LOG_LEVEL"]  = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["KERAS_BACKEND"]         = "tensorflow"

logging.basicConfig(level=logging.WARNING)


def inspect_h5(model_path: str) -> dict:
    """Read model metadata directly from HDF5."""
    import h5py
    info = {}
    try:
        with h5py.File(model_path, "r") as f:
            kv = f.attrs.get("keras_version", b"unknown")
            bk = f.attrs.get("backend",       b"tensorflow")
            info["keras_version"] = kv.decode() if isinstance(kv, bytes) else str(kv)
            info["backend"]       = bk.decode() if isinstance(bk, bytes) else str(bk)
            info["groups"]        = list(f.keys())

            cfg_raw = f.attrs.get("model_config", "")
            if isinstance(cfg_raw, bytes):
                cfg_raw = cfg_raw.decode("utf-8")

            if cfg_raw:
                cfg = json.loads(cfg_raw)
                info["model_class"] = cfg.get("class_name", "unknown")
                info["config"]      = cfg
    except Exception as e:
        info["error"] = str(e)
    return info


def load_model(model_path: str):
    """
    Try multiple loading strategies.
    Returns (model, strategy_name).
    """
    import tensorflow as tf
    import keras

    strategies = []

    # ── Strategy 1: Native Keras 3.x load ─────────────────────
    def s1():
        return keras.models.load_model(model_path, compile=False)
    strategies.append(("keras_native", s1))

    # ── Strategy 2: tf.keras load ─────────────────────────────
    def s2():
        return tf.keras.models.load_model(model_path, compile=False)
    strategies.append(("tf_keras", s2))

    # ── Strategy 3: keras with safe_mode off ──────────────────
    def s3():
        return keras.saving.load_model(model_path, compile=False, safe_mode=False)
    strategies.append(("keras_unsafe", s3))

    # ── Strategy 4: keras with custom_objects ─────────────────
    def s4():
        return keras.models.load_model(
            model_path,
            compile=False,
            custom_objects={},
        )
    strategies.append(("keras_custom_obj", s4))

    # ── Strategy 5: Patch JSON config ─────────────────────────
    def s5():
        import h5py
        import tempfile
        import shutil

        with h5py.File(model_path, "r") as f:
            cfg_raw = f.attrs.get("model_config", "")
            if isinstance(cfg_raw, bytes):
                cfg_raw = cfg_raw.decode()

        cfg_patched = _patch_config(cfg_raw)

        tmp = tempfile.mktemp(suffix=".h5")
        shutil.copy2(model_path, tmp)
        try:
            with h5py.File(tmp, "r+") as f:
                f.attrs["model_config"] = cfg_patched.encode()
            model = keras.models.load_model(tmp, compile=False)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
        return model
    strategies.append(("patched_config", s5))

    # ── Try each ──────────────────────────────────────────────
    errors = {}
    for name, fn in strategies:
        print(f"   ⏳ [{name}]", end=" … ", flush=True)
        try:
            model = fn()
            print("✅")
            return model, name
        except Exception as e:
            short = str(e)[:100].replace("\n", " ")
            print(f"❌\n      {short}")
            errors[name] = str(e)

    raise RuntimeError(
        "All strategies failed.\n" +
        "\n".join(f"  [{k}]: {v[:150]}" for k, v in errors.items())
    )


def _patch_config(config_str: str) -> str:
    """Remove / remap keys that cause version incompatibility."""
    REMOVE = {
        "quantization_config",
        "optional",
    }
    REMAP = {
        "batch_shape": "batch_input_shape",
    }

    def _clean(obj):
        if isinstance(obj, dict):
            out = {}
            for k, v in obj.items():
                if k in REMOVE:
                    continue
                if k in REMAP:
                    out[REMAP[k]] = _clean(v)
                else:
                    out[k] = _clean(v)
            return out
        elif isinstance(obj, list):
            return [_clean(i) for i in obj]
        return obj

    try:
        return json.dumps(_clean(json.loads(config_str)))
    except Exception:
        return config_str


def check_model(model_path: str) -> bool:
    print("\n" + "═" * 62)
    print("    PetGuardian AI — Model Verification")
    print("═" * 62)

    # ── 1. File ────────────────────────────────────────────────
    print("\n📁 File")
    if not os.path.exists(model_path):
        print(f"   ❌ Not found : {model_path}")
        return False
    size_mb = os.path.getsize(model_path) / (1024 * 1024)
    print(f"   ✅ Found     : {model_path}")
    print(f"   📦 Size      : {size_mb:.1f} MB")

    # ── 2. HDF5 Metadata ──────────────────────────────────────
    print("\n🔍 Model Metadata")
    meta = inspect_h5(model_path)
    print(f"   Keras version : {meta.get('keras_version', '?')}")
    print(f"   Backend       : {meta.get('backend', '?')}")
    print(f"   Model class   : {meta.get('model_class', '?')}")
    print(f"   HDF5 groups   : {meta.get('groups', [])}")

    # ── 3. Installed versions ──────────────────────────────────
    print("\n📦 Installed Versions")
    try:
        import tensorflow as tf
        print(f"   TensorFlow : {tf.__version__}")
    except ImportError:
        print("   ❌ TensorFlow not installed")
        return False

    try:
        import keras
        print(f"   Keras      : {keras.__version__}")

        # Version match check
        model_kv     = meta.get("keras_version", "")
        installed_kv = keras.__version__

        model_major_minor     = ".".join(model_kv.split(".")[:2])
        installed_major_minor = ".".join(installed_kv.split(".")[:2])

        if model_major_minor == installed_major_minor:
            print(f"   ✅ Keras version matches model save version")
        else:
            print(f"   ⚠️  Version mismatch!")
            print(f"      Model saved with : {model_kv}")
            print(f"      Installed        : {installed_kv}")
            print(f"      → Run: pip install keras=={model_kv}")

    except ImportError:
        print("   ❌ Keras not installed")
        return False

    # ── 4. Load ────────────────────────────────────────────────
    print("\n🚀 Loading Model")
    t0 = time.time()
    try:
        model, strategy = load_model(model_path)
        elapsed = time.time() - t0
        print(f"\n   ✅ Loaded in {elapsed:.2f}s  [strategy: {strategy}]")
    except RuntimeError as e:
        print(f"\n❌ ALL STRATEGIES FAILED\n")
        print(f"   Your model requires Keras {meta.get('keras_version')}")
        print(f"   Run these commands:")
        print(f"\n   pip uninstall tensorflow keras -y")
        print(f"   pip install keras=={meta.get('keras_version')}")
        print(f"   pip install tensorflow==2.19.0")
        return False

    # ── 5. Architecture ────────────────────────────────────────
    print("\n📐 Architecture")
    try:
        print(f"   Input  : {model.input_shape}")
        print(f"   Output : {model.output_shape}")
        print(f"   Layers : {len(model.layers)}")
        print(f"   Params : {model.count_params():,}")
    except Exception as e:
        print(f"   ⚠️  {e}")

    # ── 6. Classes ─────────────────────────────────────────────
    print("\n🏷  Classes")
    names = []
    try:
        from extract_classes import get_class_names
        names   = get_class_names(model_path)
        n_model = model.output_shape[-1]
        n_names = len(names)

        print(f"   Model outputs : {n_model}")
        print(f"   Config names  : {n_names}")

        if n_model == n_names:
            print(f"   ✅ Count matches")
        else:
            print(f"   ⚠️  MISMATCH")
            print(f"      Update DEFAULT_CLASSES in extract_classes.py")
            print(f"      Set exactly {n_model} class names")

        for i, n in enumerate(names):
            print(f"      [{i:02d}] {n}")

    except Exception as e:
        print(f"   ⚠️  Could not load class names: {e}")
        try:
            names = [f"Class_{i}" for i in range(model.output_shape[-1])]
        except Exception:
            names = []

    # ── 7. Inference ───────────────────────────────────────────
    print("\n🔬 Inference Test")
    try:
        import numpy as np
        h = model.input_shape[1] or 224
        w = model.input_shape[2] or 224

        dummy = np.random.rand(1, h, w, 3).astype(np.float32)
        t1    = time.time()
        preds = model.predict(dummy, verbose=0)
        ms    = (time.time() - t1) * 1000

        top_idx  = int(preds[0].argmax())
        top_conf = float(preds[0].max())
        prob_sum = float(preds[0].sum())
        top_name = names[top_idx] if top_idx < len(names) else f"Class_{top_idx}"

        print(f"   ✅ Time      : {ms:.0f} ms")
        print(f"   Output      : {preds.shape}")
        print(f"   Prob sum    : {prob_sum:.4f}  "
              f"{'✅ softmax OK' if 0.99 < prob_sum < 1.01 else '⚠️ not softmax'}")
        print(f"   Top class   : [{top_idx}] {top_name} ({top_conf:.4f})")

    except Exception as e:
        print(f"   ❌ {e}")
        return False

    # ── 8. Save fixed copy ─────────────────────────────────────
    print("\n💾 Saving Compatible Copy")
    fixed_path = model_path.replace(".h5", "_fixed.h5")
    try:
        model.save(fixed_path)
        fixed_mb = os.path.getsize(fixed_path) / (1024 * 1024)
        print(f"   ✅ Saved : {fixed_path}  ({fixed_mb:.1f} MB)")
        print(f"   → Update MODEL_PATH=models/fine_tuned_model_fixed.h5 in .env")
    except Exception as e:
        print(f"   ⚠️  Could not save: {e} (not critical)")

    # ── 9. Summary ─────────────────────────────────────────────
    print(f"\n{'═' * 62}")
    print(f"  ✅ PASSED — Model is ready for inference")
    print(f"  Strategy : [{strategy}]")
    print(f"{'═' * 62}\n")
    return True


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="models/fine_tuned_model.h5")
    args = parser.parse_args()
    ok   = check_model(args.model)
    sys.exit(0 if ok else 1)