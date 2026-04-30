# save as: find_preprocessing.py
# Run this ONCE to detect what normalization your model expects

import os
import numpy as np
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import h5py, shutil, tempfile, json

MODEL_PATH = "models/fine_tuned_model_fixed_fixed.h5"

def patch_and_load(path):
    def clean(obj):
        REMOVE = {"quantization_config", "optional"}
        REMAP  = {"batch_shape": "batch_input_shape"}
        if isinstance(obj, dict):
            return {REMAP.get(k,k): clean(v) for k,v in obj.items() if k not in REMOVE}
        elif isinstance(obj, list):
            return [clean(i) for i in obj]
        return obj

    import keras
    with h5py.File(path, "r") as f:
        raw = f.attrs.get("model_config", b"").decode("utf-8")
    patched = json.dumps(clean(json.loads(raw)))
    tmp = tempfile.mktemp(suffix=".h5")
    shutil.copy2(path, tmp)
    try:
        with h5py.File(tmp, "r+") as f:
            f.attrs["model_config"] = patched.encode("utf-8")
        return keras.models.load_model(tmp, compile=False)
    finally:
        if os.path.exists(tmp): os.remove(tmp)

print("Loading model...")
model = patch_and_load(MODEL_PATH)

CLASS_NAMES = [
    "Allergic Dermatitis","Atopic Dermatitis","Bacterial Skin Infection",
    "Contact Dermatitis","Dandruff","Deep Pyoderma","Dry Skin",
    "Flea Allergy Dermatitis","Fungal Infection","Healthy Skin","Hot Spot",
    "Lupus Erythematosus","Mange","Mild Irritation","Minor Rash","Pemphigus",
    "Ringworm","Sebaceous Adenitis","Seborrhea","Skin Tumor",
    "Squamous Cell Carcinoma","Superficial Pyoderma","Yeast Infection",
]

print("\n" + "="*60)
print("PREPROCESSING MODE DETECTION")
print("="*60)

modes = {
    "mobilenet":    lambda a: (a / 127.5) - 1.0,  # → [-1, 1]
    "efficientnet": lambda a: a / 255.0,            # → [0, 1]
    "standard":     lambda a: a / 255.0,            # → [0, 1]
    "resnet":       lambda a: a - np.array([123.68, 116.779, 103.939]),
}

np.random.seed(42)

for mode_name, norm_fn in modes.items():
    entropies = []
    top_classes = []

    for trial in range(10):
        # Random image simulating a real photo
        raw = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8).astype(np.float32)
        arr = norm_fn(raw)
        arr = np.expand_dims(arr, 0)
        pred = model.predict(arr, verbose=0)[0]
        entropy = -np.sum(pred * np.log(pred + 1e-10))
        entropies.append(entropy)
        top_classes.append(np.argmax(pred))

    avg_entropy  = np.mean(entropies)
    unique_preds = len(set(top_classes))

    print(f"\n  Mode: {mode_name}")
    print(f"    Avg entropy:    {avg_entropy:.4f}  (higher = more spread = better)")
    print(f"    Unique classes: {unique_preds}/10  (more variety = better)")
    print(f"    Top classes:    {top_classes}")

print("\n" + "="*60)
print("RECOMMENDATION")
print("="*60)
print("""
Pick the mode with:
  ✅ HIGHEST average entropy
  ✅ MOST unique class predictions

Then set in config.py:
  PREPROCESSING_MODE = "mobilenet"    ← or whichever won

Then set in .env:
  PREPROCESSING_MODE=mobilenet
""")