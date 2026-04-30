from datetime import datetime, timezone
from typing   import Any


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def format_success(data: Any, message: str = "Success") -> dict:
    """Standard success envelope."""
    return {
        "success":   True,
        "message":   message,
        "data":      data,
        "timestamp": _timestamp(),
    }


def format_error(message: str, code: int = 400, details: Any = None) -> dict:
    """Standard error envelope."""
    payload = {
        "success":   False,
        "message":   message,
        "error":     {
            "code":    code,
            "details": details,
        },
        "timestamp": _timestamp(),
    }
    return payload


def format_prediction(
    predicted_class:  str,
    confidence:       float,
    severity:         str,
    guidance:         str,
    disclaimer:       str,
    all_predictions:  list[dict],
    vet_connect:      bool,
    home_care:        list[str],
    image_filename:   str = "",
) -> dict:
    """
    Build the full prediction response consumed by Spring Boot / Frontend.

    Shape (mirrors AIAnalysisResponse.java):
    {
      "success": true,
      "message": "Analysis complete",
      "data": {
        "predictedClass":  "Ringworm",
        "confidence":       0.93,
        "severity":        "SEVERE",
        "guidance":        "...",
        "disclaimer":      "...",
        "vetConnectTrigger": true,
        "homeCareSteps":   [...],
        "allPredictions":  [{"class": "...", "confidence": 0.93}, ...],
        "imageFilename":   "abc.jpg",
        "analyzedAt":      "2024-..."
      },
      "timestamp": "..."
    }
    """
    return format_success(
        message="Analysis complete",
        data={
            "predictedClass":    predicted_class,
            "confidence":        round(confidence, 4),
            "severity":          severity,
            "guidance":          guidance,
            "disclaimer":        disclaimer,
            "vetConnectTrigger": vet_connect,
            "homeCareSteps":     home_care,
            "allPredictions":    [
                {
                    "class":      p["class"],
                    "confidence": round(p["confidence"], 4),
                }
                for p in all_predictions[:5]   # top-5 only
            ],
            "imageFilename": image_filename,
            "analyzedAt":    _timestamp(),
        },
    )