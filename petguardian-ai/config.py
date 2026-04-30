import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ─── Flask ────────────────────────────────────────────────
    DEBUG                = os.getenv("FLASK_DEBUG", "False") == "True"
    HOST                 = os.getenv("FLASK_HOST", "0.0.0.0")
    PORT                 = int(os.getenv("FLASK_PORT", 5000))
    SECRET_KEY           = os.getenv("SECRET_KEY", "petguardian-ai-secret-key")

    # ─── Model ────────────────────────────────────────────────
    # FIX 1: Use the newest fixed model file
    MODEL_PATH           = os.getenv(
        "MODEL_PATH", "models/fine_tuned_model_fixed_fixed.h5"
    )
    IMAGE_SIZE           = (224, 224)
    IMAGE_SIZE_WH        = (224, 224)
    CHANNELS             = 3

    # FIX 2: Detect what preprocessing the model expects
    # Options: "mobilenet"  → [-1, 1]  (MobileNetV2, MobileNetV3)
    #          "efficientnet"→ [0, 1]  (EfficientNet)
    #          "resnet"     → ImageNet mean subtraction
    #          "standard"   → [0, 1]  (custom trained)
    # Change this to match YOUR training script
    PREPROCESSING_MODE   = os.getenv("PREPROCESSING_MODE", "mobilenet")

    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.30))

    # ─── Severity Thresholds ──────────────────────────────────
    # These are confidence MINIMUMS for the fallback path only
    # (when disease name is not in any severity set)
    MILD_THRESHOLD       = float(os.getenv("MILD_THRESHOLD",     0.40))
    MODERATE_THRESHOLD   = float(os.getenv("MODERATE_THRESHOLD", 0.65))

    # ─── CORS ─────────────────────────────────────────────────
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
    ]

    SPRING_BACKEND_URL   = os.getenv("SPRING_BACKEND_URL", "http://localhost:8080")

    # ─── Upload ───────────────────────────────────────────────
    MAX_CONTENT_LENGTH   = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS   = {"jpg", "jpeg", "png", "bmp", "webp"}

    # ─── Disease → Severity Mapping ───────────────────────────
    # All 23 classes mapped (alphabetical = DEFAULT_CLASSES order)
    SEVERE_DISEASES = {
        "Bacterial Skin Infection",
        "Deep Pyoderma",
        "Lupus Erythematosus",
        "Mange",
        "Pemphigus",
        "Ringworm",
        "Sebaceous Adenitis",
        "Skin Tumor",
        "Squamous Cell Carcinoma",
    }

    MODERATE_DISEASES = {
        "Allergic Dermatitis",
        "Atopic Dermatitis",
        "Contact Dermatitis",
        "Flea Allergy Dermatitis",
        "Fungal Infection",
        "Hot Spot",
        "Seborrhea",
        "Superficial Pyoderma",
        "Yeast Infection",
    }

    MILD_DISEASES = {
        "Dandruff",
        "Dry Skin",
        "Healthy Skin",
        "Mild Irritation",
        "Minor Rash",
    }

    # ─── Guidance per severity ────────────────────────────────
    SEVERITY_GUIDANCE = {
        "MILD": (
            "The condition appears mild. Monitor your pet at home. "
            "Keep the affected area clean and dry. Prevent scratching or licking. "
            "If symptoms worsen or persist beyond 3–5 days, consult a veterinarian."
        ),
        "MODERATE": (
            "This condition requires veterinary attention within 24–48 hours. "
            "Avoid applying home remedies without professional advice. "
            "Keep the area clean and prevent further irritation. "
            "Book a vet appointment as soon as possible."
        ),
        "SEVERE": (
            "This condition requires IMMEDIATE veterinary care. "
            "Visit the nearest veterinary clinic immediately. "
            "Do not attempt home treatment. Keep your pet calm during transport. "
            "Emergency vet services are highlighted for you below."
        ),
    }

    DISCLAIMER = (
        "⚠️ IMPORTANT: This AI analysis is a preliminary screening tool only. "
        "It does NOT replace professional veterinary diagnosis or treatment. "
        "Always consult a licensed veterinarian for proper diagnosis and care."
    )


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig,
}


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)