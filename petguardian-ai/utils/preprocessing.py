"""
utils/preprocessing.py
──────────────────────
Image validation, preprocessing, and prediction decoding.

KEY FIX: Preprocessing mode now matches model training:
  - "mobilenet"   → (pixel / 127.5) - 1.0  → range [-1, 1]
  - "efficientnet"→  pixel / 255.0          → range [0, 1]
  - "resnet"      → ImageNet mean subtraction
  - "standard"    →  pixel / 255.0          → range [0, 1]
"""

import io
import logging

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_image_file(
    file_storage,
    allowed_extensions: set,
) -> tuple[bool, str]:
    """
    Validate that the uploaded file is an acceptable image.

    Returns:
        (True, "")           on success
        (False, reason_str)  on failure
    """
    if file_storage is None or file_storage.filename == "":
        return False, "No file provided."

    filename  = file_storage.filename.lower()
    extension = filename.rsplit(".", 1)[-1] if "." in filename else ""

    if extension not in allowed_extensions:
        return False, (
            f"File type '.{extension}' is not supported. "
            f"Allowed types: {', '.join(sorted(allowed_extensions))}"
        )

    file_storage.stream.seek(0)
    raw_bytes = file_storage.stream.read()
    file_storage.stream.seek(0)

    if not raw_bytes:
        return False, "Received empty file."

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
    except UnidentifiedImageError:
        return False, "Uploaded file does not appear to be a valid image."
    except Exception:
        try:
            img2 = Image.open(io.BytesIO(raw_bytes))
            img2.load()
        except Exception as exc2:
            return False, f"Invalid image file: {exc2}"

    return True, ""


# ═══════════════════════════════════════════════════════════════
# PREPROCESSING  ← MAIN FIX
# ═══════════════════════════════════════════════════════════════

# ImageNet mean/std for ResNet-style preprocessing
_IMAGENET_MEAN = np.array([123.68, 116.779, 103.939], dtype=np.float32)  # RGB


def _normalize(arr: np.ndarray, mode: str) -> np.ndarray:
    """
    Apply the correct normalization for the model backbone.

    Args:
        arr  : float32 array in [0, 255] range, shape (H, W, 3)
        mode : preprocessing mode string

    Returns:
        Normalized float32 array
    """
    mode = mode.lower().strip()

    if mode == "mobilenet":
        # MobileNetV2 / MobileNetV3 / NASNet
        # Range: [-1, 1]
        return (arr / 127.5) - 1.0

    elif mode == "efficientnet":
        # EfficientNetB0–B7
        # Range: [0, 1]  (EfficientNet does its own internal normalization)
        return arr / 255.0

    elif mode == "resnet":
        # ResNet50 / VGG / InceptionV3
        # Subtract ImageNet channel means (no scaling)
        return arr - _IMAGENET_MEAN

    elif mode in ("standard", "simple"):
        # Custom trained models / simple normalization
        # Range: [0, 1]
        return arr / 255.0

    else:
        logger.warning(
            "Unknown PREPROCESSING_MODE '%s' — defaulting to [0,1] normalization",
            mode,
        )
        return arr / 255.0


def preprocess_image(
    file_storage,
    target_size: tuple = (224, 224),
    preprocessing_mode: str = "mobilenet",
) -> np.ndarray:
    """
    Load an image from a FileStorage object and prepare it for model inference.

    Pipeline:
        1. Open with PIL
        2. Convert to RGB
        3. Apply EXIF orientation correction
        4. Resize to target_size with LANCZOS resampling
        5. Convert to float32 array in [0, 255]
        6. Apply backbone-specific normalization
        7. Add batch dimension → shape (1, H, W, 3)

    Args:
        file_storage       : Flask FileStorage object
        target_size        : (height, width) tuple
        preprocessing_mode : "mobilenet" | "efficientnet" | "resnet" | "standard"

    Returns:
        np.ndarray of shape (1, H, W, 3) with correct normalization
    """
    file_storage.stream.seek(0)
    raw_bytes = file_storage.stream.read()

    if not raw_bytes:
        raise ValueError("Cannot preprocess empty image file.")

    try:
        image = Image.open(io.BytesIO(raw_bytes))
    except UnidentifiedImageError as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc

    # ── Normalise colour mode ──────────────────────────────────
    if image.mode != "RGB":
        image = image.convert("RGB")

    # ── Correct EXIF rotation ──────────────────────────────────
    image = ImageOps.exif_transpose(image)

    # ── Resize ────────────────────────────────────────────────
    image = image.resize(target_size, Image.Resampling.LANCZOS)

    # ── To float32 array (raw [0, 255] range) ─────────────────
    arr = np.array(image, dtype=np.float32)   # shape (H, W, 3)

    # ── Apply backbone normalization ───────────────────────────
    arr = _normalize(arr, preprocessing_mode)

    # ── Add batch dim ──────────────────────────────────────────
    arr = np.expand_dims(arr, axis=0)          # shape (1, H, W, 3)

    logger.debug(
        "Preprocessed | mode=%s target=%s → shape=%s min=%.3f max=%.3f",
        preprocessing_mode, target_size, arr.shape,
        float(arr.min()), float(arr.max()),
    )
    return arr


# ═══════════════════════════════════════════════════════════════
# PREDICTION DECODING
# ═══════════════════════════════════════════════════════════════

def decode_predictions(
    predictions: np.ndarray,
    class_names: list[str],
) -> list[dict]:
    """
    Convert raw softmax output into a ranked list of predictions.

    Args:
        predictions : np.ndarray shape (1, num_classes)
        class_names : list of class label strings

    Returns:
        List of dicts sorted by confidence descending:
            [{"class": "Ringworm", "confidence": 0.93}, ...]
    """
    probs = predictions[0]   # shape (num_classes,)

    if len(probs) != len(class_names):
        logger.error(
            "MISMATCH: model outputs %d values but class_names has %d entries. "
            "Check DEFAULT_CLASSES order in extract_classes.py",
            len(probs), len(class_names),
        )

    results = [
        {
            "class":      class_names[i] if i < len(class_names) else f"Class_{i}",
            "confidence": float(probs[i]),
        }
        for i in range(len(probs))
    ]

    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results