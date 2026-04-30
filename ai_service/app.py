"""
PetGuardian AI Service - Pet Breed & Category Classifier
Flask microservice that serves the TensorFlow SavedModel for breed prediction.

Model details:
  - Input:   (None, 224, 224, 3) float32 — RGB images resized to 224x224
  - Output0: (None, 6) float32 — Breed probabilities
  - Output1: (None, 2) float32 — Category probabilities (Cat, Dog)
"""

import os
import json
import logging
from pathlib import Path

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MODEL_DIR = os.environ.get(
    'MODEL_PATH',
    str(Path(__file__).resolve().parent.parent / 'pet_breed_category_classifier')
)
LABELS_FILE = Path(__file__).resolve().parent / 'labels.json'
IMG_SIZE = (224, 224)
PORT = int(os.environ.get('AI_SERVICE_PORT', 5000))

# ---------------------------------------------------------------------------
# Load model & labels
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

logger.info(f"Loading model from {MODEL_DIR} ...")
model = tf.saved_model.load(MODEL_DIR)
predict_fn = model.signatures['serving_default']
logger.info("Model loaded successfully.")

with open(LABELS_FILE, 'r') as f:
    labels_data = json.load(f)

BREED_LABELS = labels_data['breed_labels']
CATEGORY_LABELS = labels_data['category_labels']
BREED_TO_CATEGORY = labels_data['breed_to_category']

logger.info(f"Breeds: {BREED_LABELS}")
logger.info(f"Categories: {CATEGORY_LABELS}")

# Determine the output key names from the signature
output_keys = list(predict_fn.structured_outputs.keys())
logger.info(f"Model output keys: {output_keys}")

# Identify which output is breed (6 classes) and which is category (2 classes)
breed_output_key = None
category_output_key = None
for key, tensor in predict_fn.structured_outputs.items():
    shape = tensor.shape
    if shape[-1] == len(BREED_LABELS):
        breed_output_key = key
    elif shape[-1] == len(CATEGORY_LABELS):
        category_output_key = key

logger.info(f"Breed output key: {breed_output_key}")
logger.info(f"Category output key: {category_output_key}")

# Determine the input key name
input_key = list(predict_fn.structured_input_signature[1].keys())[0]
logger.info(f"Input key: {input_key}")

# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Load image bytes, resize to 224x224, normalize to [0, 1]."""
    img = Image.open(__import__('io').BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    # Standard Keras MobileNetV2 preprocessing: (x / 127.5) - 1.0 (range [-1, 1])
    arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, origins='*')


@app.route('/ai/predict-breed', methods=['POST'])
def predict_breed():
    """
    Accept a pet image and return breed + category predictions.

    Request:  multipart/form-data with field 'image'
    Response:
    {
      "success": true,
      "prediction": { "breed": "Beagle", "category": "Dog", "confidence": 0.95 },
      "topPredictions": [ ... ],
      "categoryPrediction": { "category": "Dog", "confidence": 0.98 }
    }
    """
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400

    try:
        image_bytes = file.read()
        input_tensor = preprocess_image(image_bytes)
        input_tf = tf.constant(input_tensor, dtype=tf.float32)

        # Run inference
        result = predict_fn(**{input_key: input_tf})

        # --- Breed predictions ---
        breed_raw = result[breed_output_key].numpy()[0]
        # Check if the model already applies softmax (sum is ~1.0)
        if np.abs(np.sum(breed_raw) - 1.0) < 0.01:
             breed_probs = breed_raw
        else:
             breed_probs = _softmax(breed_raw)
        
        sorted_indices = np.argsort(breed_probs)[::-1]

        top_predictions = []
        for idx in sorted_indices:
            breed_name = BREED_LABELS[idx]
            top_predictions.append({
                'breed': breed_name,
                'category': BREED_TO_CATEGORY.get(breed_name, 'Unknown'),
                'confidence': round(float(breed_probs[idx]), 4),
            })

        # --- Category predictions ---
        category_result = None
        if category_output_key:
            cat_raw = result[category_output_key].numpy()[0]
            if np.abs(np.sum(cat_raw) - 1.0) < 0.01:
                cat_probs = cat_raw
            else:
                cat_probs = _softmax(cat_raw)
            
            cat_idx = int(np.argmax(cat_probs))
            category_result = {
                'category': CATEGORY_LABELS[cat_idx],
                'confidence': round(float(cat_probs[cat_idx]), 4),
            }

        best = top_predictions[0]

        predicted_category = category_result['category'] if category_result else best['category']

        response = {
            'success': True,
            'prediction': {
                'breed': best['breed'],
                'category': predicted_category,
                'confidence': best['confidence'],
            },
            'topPredictions': top_predictions[:3],
        }
        if category_result:
            response['categoryPrediction'] = category_result

        logger.info(f"Prediction: {best['breed']} ({best['confidence']:.2%}) | Category: {category_result}")
        return jsonify(response)

    except Exception as e:
        logger.exception("Prediction failed")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/ai/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'breeds': BREED_LABELS,
        'categories': CATEGORY_LABELS,
    })


def _softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax."""
    e = np.exp(x - np.max(x))
    return e / e.sum()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    logger.info(f"Starting AI service on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
