# create this file: check_breed_model.py
# run: python check_breed_model.py

import tensorflow as tf
import numpy as np
from PIL import Image
import io

# Load model
model = tf.saved_model.load("models/pet_breed_category_classifier")

# Check output size with dummy input
dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
tensor = tf.constant(dummy)

# Try direct call
try:
    output = model(tensor)
    print(f"Output shape: {output.shape}")
    print(f"Number of classes: {output.shape[-1]}")
except Exception as e:
    print(f"Direct call failed: {e}")
    # Try serving_default
    try:
        infer = model.signatures["serving_default"]
        output = infer(tensor)
        for key, val in output.items():
            print(f"Output key: {key}, shape: {val.shape}")
            print(f"Number of classes: {val.shape[-1]}")
    except Exception as e2:
        print(f"Serving default failed: {e2}")