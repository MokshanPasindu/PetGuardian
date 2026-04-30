import os
import numpy as np
import tensorflow as tf
from PIL import Image
from pathlib import Path
import json

MODEL_DIR = str(Path(__file__).resolve().parent.parent / 'pet_breed_category_classifier')
LABELS_FILE = Path(__file__).resolve().parent / 'labels.json'

print(f"Loading model from {MODEL_DIR}...")
model = tf.saved_model.load(MODEL_DIR)
predict_fn = model.signatures['serving_default']

with open(LABELS_FILE, 'r') as f:
    labels_data = json.load(f)

BREED_LABELS = labels_data['breed_labels']
print(f"Current Labels: {BREED_LABELS}")

# Identify output keys
output_keys = list(predict_fn.structured_outputs.keys())
breed_key = [k for k in output_keys if predict_fn.structured_outputs[k].shape[-1] == 6][0]
input_key = list(predict_fn.structured_input_signature[1].keys())[0]

def test_inference(img_path, normalization_type='0_1'):
    img = Image.open(img_path).convert('RGB').resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    
    if normalization_type == '0_1':
        arr = arr / 255.0
    elif normalization_type == '-1_1':
        arr = (arr / 127.5) - 1.0
        
    input_tensor = np.expand_dims(arr, axis=0)
    input_tf = tf.constant(input_tensor, dtype=tf.float32)
    
    result = predict_fn(**{input_key: input_tf})
    breed_out = result[breed_key].numpy()[0]
    
    print(f"\nTesting {img_path} with {normalization_type} normalization:")
    print(f"Raw scores: {breed_out}")
    
    # Softmax for visualization
    def softmax(x):
        e = np.exp(x - np.max(x))
        return e / e.sum()
    
    probs = softmax(breed_out)
    idx = np.argmax(probs)
    print(f"Prediction: {BREED_LABELS[idx]} (Confidence: {probs[idx]:.4f})")
    
    # Show TOP 3
    sorted_idx = np.argsort(probs)[::-1]
    for i in range(3):
        print(f"  {i+1}. {BREED_LABELS[sorted_idx[i]]}: {probs[sorted_idx[i]]:.4f}")

# Search for any JPG/PNG files in the folder to test
import glob
import sys

if len(sys.argv) > 1:
    img_path = sys.argv[1]
    if os.path.exists(img_path):
        test_inference(img_path, '0_1')
        test_inference(img_path, '-1_1')
    else:
        print(f"File not found: {img_path}")
else:
    test_images = glob.glob(str(Path(__file__).resolve().parent.parent / "*.jpg"))
    if not test_images:
        print("No test images found. Please provide a path.")
    else:
        for img in test_images[:3]:
            test_inference(img, '0_1')
            test_inference(img, '-1_1')
