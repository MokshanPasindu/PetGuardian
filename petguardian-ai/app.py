"""
app.py — PetGuardian AI Flask Service
Entry point for the CNN-based skin disease prediction API
and Pet Breed & Category Classification API.
"""

import logging
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"]  = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import sys
from datetime import datetime, timezone

from flask      import Flask, jsonify, request
from flask_cors import CORS

from config              import get_config
from predictor           import predictor
from image_processor     import ImageProcessor
from utils.response_formatter import format_success, format_error
from breed_predictor     import breed_classifier

logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    stream  = sys.stdout,
)
logger = logging.getLogger(__name__)
Config = get_config()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH

    CORS(
        app,
        resources            = {r"/api/*": {"origins": Config.ALLOWED_ORIGINS}},
        supports_credentials = True,
    )

    # ── Load skin disease model ────────────────────────────────
    try:
        predictor.load(Config.MODEL_PATH)
        logger.info("✅ Skin disease AI model loaded successfully")
    except FileNotFoundError as exc:
        logger.error("❌ %s", exc)
        logger.warning("Server starting WITHOUT skin model — /predict will return 503")
    except Exception as exc:
        logger.exception("❌ Unexpected skin model load error: %s", exc)

    # ── Load breed classifier model ────────────────────────────
    breed_loaded = breed_classifier.load_model()
    if breed_loaded:
        logger.info("✅ Breed classifier model loaded successfully")
    else:
        logger.warning("⚠️  Breed classifier not loaded — /api/breed/classify will return 503")

    # ═══════════════════════════════════════════════════════════
    # EXISTING ROUTES
    # ═══════════════════════════════════════════════════════════

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify(format_success({
            "status"          : "healthy",
            "modelLoaded"     : predictor.is_ready,
            "breedModelLoaded": breed_classifier.is_ready,
            "service"         : "PetGuardian AI",
            "version"         : "2.0.0",
            "timestamp"       : datetime.now(timezone.utc).isoformat(),
        })), 200

    @app.route("/api/model/info", methods=["GET"])
    def model_info():
        if not predictor.is_ready:
            return jsonify(format_error("Model not loaded", 503)), 503

        from model_loader    import get_model_info
        from extract_classes import get_class_names

        model = predictor._model
        info  = get_model_info(model)
        info["classNames"]  = predictor._class_names
        info["numClasses"]  = len(predictor._class_names)
        info["imageSize"]   = Config.IMAGE_SIZE
        info["modelPath"]   = Config.MODEL_PATH

        return jsonify(format_success(info)), 200

    @app.route("/api/predict", methods=["POST"])
    def predict():
        if not predictor.is_ready:
            return jsonify(
                format_error("AI model is not available. Please try later.", 503)
            ), 503

        if "image" not in request.files:
            return jsonify(
                format_error("No image file provided. Use field name 'image'.", 400)
            ), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify(
                format_error("Empty filename. Please select a file.", 400)
            ), 400

        ok, reason = ImageProcessor.validate(file)
        if not ok:
            return jsonify(format_error(reason, 400)), 400

        quality = ImageProcessor.check_image_quality(file)
        if not quality["ok"]:
            logger.warning(
                "Image quality warnings for '%s': %s",
                file.filename, quality["warnings"],
            )

        meta = ImageProcessor.get_image_metadata(file)
        logger.info(
            "Received image | name='%s' size=%s format=%s bytes=%s",
            meta.get("filename"), meta.get("size"),
            meta.get("format"),   meta.get("filesize"),
        )

        try:
            image_array = ImageProcessor.process(file)
        except ValueError as exc:
            return jsonify(format_error(str(exc), 400)), 400

        result = predictor.predict(image_array, filename=file.filename)

        if not quality["ok"] and "data" in result:
            result["data"]["qualityWarnings"] = quality["warnings"]

        status_code = 200 if result.get("success") else 500
        return jsonify(result), status_code

    @app.route("/api/predict/batch", methods=["POST"])
    def predict_batch():
        if not predictor.is_ready:
            return jsonify(format_error("Model not available", 503)), 503

        results = []
        for key in request.files:
            if not key.startswith("image"):
                continue
            file = request.files[key]
            try:
                arr    = ImageProcessor.process(file)
                result = predictor.predict(arr, filename=file.filename)
            except ValueError as exc:
                result = format_error(str(exc), 400)
            results.append({"file": file.filename, "result": result})

        if not results:
            return jsonify(format_error("No valid image files found", 400)), 400

        return jsonify(
            format_success(results, f"{len(results)} images analysed")
        ), 200

    @app.route("/api/severity/info", methods=["GET"])
    def severity_info():
        return jsonify(format_success({
            "severityLevels": [
                {
                    "level"      : "MILD",
                    "description": "Minor condition. Home monitoring appropriate.",
                    "action"     : "Monitor at home. See vet if no improvement in 3–5 days.",
                    "vetConnect" : False,
                    "diseases"   : sorted(Config.MILD_DISEASES),
                },
                {
                    "level"      : "MODERATE",
                    "description": "Condition requires veterinary attention soon.",
                    "action"     : "Book vet appointment within 24–48 hours.",
                    "vetConnect" : False,
                    "diseases"   : sorted(Config.MODERATE_DISEASES),
                },
                {
                    "level"      : "SEVERE",
                    "description": "Serious condition. Immediate veterinary care needed.",
                    "action"     : "Go to nearest vet IMMEDIATELY.",
                    "vetConnect" : True,
                    "diseases"   : sorted(Config.SEVERE_DISEASES),
                },
            ],
            "confidenceThreshold": Config.CONFIDENCE_THRESHOLD,
            "disclaimer"         : Config.DISCLAIMER,
        })), 200

    @app.route("/api/classes", methods=["GET"])
    def class_list():
        if not predictor.is_ready:
            return jsonify(format_error("Model not loaded", 503)), 503

        classes = [
            {
                "name"    : name,
                "severity": _classify_name(name),
            }
            for name in predictor._class_names
        ]
        return jsonify(format_success({
            "classes"   : classes,
            "totalCount": len(classes),
        })), 200

    def _classify_name(name: str) -> str:
        if name in Config.SEVERE_DISEASES:   return "SEVERE"
        if name in Config.MODERATE_DISEASES: return "MODERATE"
        return "MILD"

    # ═══════════════════════════════════════════════════════════
    # NEW ROUTES — Breed Classification
    # ═══════════════════════════════════════════════════════════

    @app.route("/api/breed/classify", methods=["POST"])
    def classify_breed():
        """
        POST /api/breed/classify
        Content-Type: multipart/form-data
        Body field : image (file)
        """
        # ── Model readiness ────────────────────────────────────
        if not breed_classifier.is_ready:
            return jsonify(
                format_error(
                    "Breed classifier is not available. Please try later.", 503
                )
            ), 503

        # ── File presence ──────────────────────────────────────
        if "image" not in request.files:
            return jsonify(
                format_error(
                    "No image file provided. Use field name 'image'.", 400
                )
            ), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify(
                format_error("Empty filename. Please select a file.", 400)
            ), 400

        # ── READ BYTES FIRST before stream is consumed ─────────
        # validate() and get_image_metadata() both read file.stream
        # We must capture bytes before they do
        file.stream.seek(0)
        image_bytes = file.stream.read()

        if not image_bytes:
            return jsonify(
                format_error("Received empty image file.", 400)
            ), 400

        logger.info(
            "[BreedClassify] bytes=%d | name='%s' | type='%s'",
            len(image_bytes),
            file.filename,
            file.content_type,
        )

        # ── Validate (reset stream first) ──────────────────────
        file.stream.seek(0)
        ok, reason = ImageProcessor.validate(file)
        if not ok:
            logger.warning("[BreedClassify] Validation failed: %s", reason)
            return jsonify(format_error(reason, 400)), 400

        # ── Log metadata ───────────────────────────────────────
        file.stream.seek(0)
        meta = ImageProcessor.get_image_metadata(file)
        logger.info(
            "[BreedClassify] name='%s' size=%s format=%s",
            meta.get("filename"),
            meta.get("size"),
            meta.get("format"),
        )

        # ── Run breed inference ────────────────────────────────
        # image_bytes captured before any stream operations above
        try:
            result = breed_classifier.predict(image_bytes)
        except ValueError as exc:
            return jsonify(format_error(str(exc), 400)), 400
        except RuntimeError as exc:
            logger.error("[BreedClassify] Runtime error: %s", exc)
            return jsonify(format_error(str(exc), 500)), 500
        except Exception as exc:
            logger.exception("[BreedClassify] Unexpected error: %s", exc)
            return jsonify(
                format_error("Unexpected classification error", 500)
            ), 500

        return jsonify(
            format_success(result, "Breed classification successful")
        ), 200

    @app.route("/api/breed/health", methods=["GET"])
    def breed_health_info():
        breed = request.args.get("breed", "").strip()

        if not breed:
            return jsonify(
                format_error(
                    "Breed parameter is required. Example: ?breed=Beagle", 400
                )
            ), 400

        from breed_predictor import BREED_HEALTH_NOTES, CATEGORY_MAP

        if breed not in BREED_HEALTH_NOTES:
            return jsonify(
                format_error(f"Breed '{breed}' not found.", 404)
            ), 404

        return jsonify(format_success({
            "breed"     : breed,
            "category"  : CATEGORY_MAP.get(breed, "Unknown"),
            "healthInfo": BREED_HEALTH_NOTES[breed],
        })), 200

    @app.route("/api/breed/breeds", methods=["GET"])
    def all_breeds():
        from breed_predictor import BREED_LABELS, CATEGORY_MAP, BREED_HEALTH_NOTES

        breeds_list = [
            {
                "name"      : breed,
                "category"  : CATEGORY_MAP.get(breed, "Unknown"),
                "healthInfo": BREED_HEALTH_NOTES.get(breed, {}),
            }
            for breed in BREED_LABELS
        ]

        return jsonify(format_success({
            "total" : len(breeds_list),
            "breeds": breeds_list,
        })), 200

    @app.route("/api/breed/info", methods=["GET"])
    def breed_model_info():
        if not breed_classifier.is_ready:
            return jsonify(format_error("Breed model not loaded", 503)), 503

        from breed_predictor import BREED_LABELS, CATEGORY_MAP

        dogs = [b for b, c in CATEGORY_MAP.items() if c == "Dog"]
        cats = [b for b, c in CATEGORY_MAP.items() if c == "Cat"]

        return jsonify(format_success({
            "modelType"  : "CNN — SavedModel (TensorFlow)",
            "totalBreeds": len(BREED_LABELS),
            "dogBreeds"  : dogs,
            "catBreeds"  : cats,
            "inputSize"  : [224, 224, 3],
            "modelReady" : breed_classifier.is_ready,
        })), 200

    # ═══════════════════════════════════════════════════════════
    # ERROR HANDLERS
    # ═══════════════════════════════════════════════════════════

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(format_error(str(e), 400)), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(format_error("Endpoint not found", 404)), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify(
            format_error(
                f"File too large. Maximum size is "
                f"{Config.MAX_CONTENT_LENGTH // (1024 * 1024)} MB.",
                413,
            )
        ), 413

    @app.errorhandler(500)
    def server_error(e):
        logger.exception("Internal server error: %s", e)
        return jsonify(format_error("Internal server error", 500)), 500

    @app.errorhandler(503)
    def service_unavailable(e):
        return jsonify(format_error("Service unavailable", 503)), 503

    return app


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    application = create_app()
    application.run(
        host  = Config.HOST,
        port  = Config.PORT,
        debug = Config.DEBUG,
    )