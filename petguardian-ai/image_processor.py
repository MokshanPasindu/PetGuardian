"""
image_processor.py
──────────────────
Higher-level image processing helpers.
Now passes preprocessing_mode from Config to preprocess_image().
"""

import io
import logging

import numpy as np
from PIL import Image

from config              import get_config
from utils.preprocessing import preprocess_image, validate_image_file

logger = logging.getLogger(__name__)
Config = get_config()


class ImageProcessor:
    """Stateless helper — all methods are static / class-level."""

    @staticmethod
    def validate(file_storage) -> tuple[bool, str]:
        """Validate extension and file header."""
        return validate_image_file(file_storage, Config.ALLOWED_EXTENSIONS)

    @staticmethod
    def process(file_storage) -> np.ndarray:
        """
        Full pipeline: validate → preprocess → return batch array.

        FIX: passes Config.PREPROCESSING_MODE so normalization
             matches the model's training preprocessing.

        Raises ValueError on any failure.
        """
        ok, reason = ImageProcessor.validate(file_storage)
        if not ok:
            raise ValueError(reason)

        arr = preprocess_image(
            file_storage,
            target_size         = Config.IMAGE_SIZE,
            preprocessing_mode  = Config.PREPROCESSING_MODE,   # ← FIX
        )

        logger.debug(
            "Image processed | shape=%s min=%.3f max=%.3f mode=%s",
            arr.shape,
            float(arr.min()),
            float(arr.max()),
            Config.PREPROCESSING_MODE,
        )
        return arr

    @staticmethod
    def get_image_metadata(file_storage) -> dict:
        """Return basic metadata. Rewinds stream after reading."""
        file_storage.stream.seek(0)
        raw = file_storage.stream.read()
        file_storage.stream.seek(0)

        try:
            img = Image.open(io.BytesIO(raw))
            return {
                "filename": file_storage.filename,
                "format":   img.format,
                "mode":     img.mode,
                "size":     img.size,
                "filesize": len(raw),
            }
        except Exception as exc:
            logger.warning("Could not read image metadata: %s", exc)
            return {
                "filename": file_storage.filename,
                "filesize": len(raw),
            }

    @staticmethod
    def check_image_quality(file_storage) -> dict:
        """
        Basic quality checks:
         - Minimum resolution (64×64)
         - Not completely uniform / blank
        Returns {"ok": bool, "warnings": [...]}
        """
        file_storage.stream.seek(0)
        raw = file_storage.stream.read()
        file_storage.stream.seek(0)

        warnings = []

        try:
            img = Image.open(io.BytesIO(raw)).convert("RGB")
            w, h = img.size

            if w < 64 or h < 64:
                warnings.append(
                    f"Image resolution {w}×{h} is very low. "
                    "Results may be inaccurate."
                )

            arr = np.array(img, dtype=np.float32)
            if arr.std() < 5.0:
                warnings.append(
                    "Image appears blank or nearly uniform. "
                    "Please upload a clear photo of the affected area."
                )

        except Exception as exc:
            warnings.append(f"Quality check failed: {exc}")

        return {"ok": len(warnings) == 0, "warnings": warnings}