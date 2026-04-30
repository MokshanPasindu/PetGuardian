// frontend/src/components/breed/BreedResultCard.jsx

import React          from "react";
import BreedHealthInfo from "./BreedHealthInfo";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (confidence >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const getConfidenceLabel = (confidence) => {
  if (confidence >= 80) return "High Confidence";
  if (confidence >= 60) return "Medium Confidence";
  return "Low Confidence";
};

const CategoryIcon = ({ category }) => {
  if (category === "Dog") return <span className="text-3xl">🐶</span>;
  if (category === "Cat") return <span className="text-3xl">🐱</span>;
  return <span className="text-3xl">🐾</span>;
};

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
const BreedResultCard = ({ result, onUseResult, onDismiss }) => {

  // ── Error state ───────────────────────────────────────────────────────────
  if (!result || !result.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
        <p className="text-red-700 text-sm font-medium">
          ❌ Classification failed. Please try with a clearer image.
        </p>
        {result?.errorMessage && (
          <p className="text-red-500 text-xs mt-1">
            {result.errorMessage}
          </p>
        )}
      </div>
    );
  }

  const confidenceStyle = getConfidenceColor(result.confidence);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md
                    mt-4 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <CategoryIcon category={result.predictedCategory} />
          <div>
            <h3 className="text-lg font-bold">Breed Detected!</h3>
            <p className="text-blue-100 text-sm">AI Classification Result</p>
          </div>
        </div>
      </div>

      <div className="p-4">

        {/* ── Breed + Confidence ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            {/* Category badge */}
            <span className={`
              inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2
              ${result.predictedCategory === "Dog"
                ? "bg-orange-100 text-orange-700"
                : "bg-purple-100 text-purple-700"
              }
            `}>
              {result.predictedCategory}
            </span>

            {/* Breed name */}
            <h2 className="text-2xl font-bold text-gray-800">
              {result.predictedBreed}
            </h2>
          </div>

          {/* Confidence badge */}
          <div className={`border rounded-lg px-3 py-2 text-center ${confidenceStyle}`}>
            <div className="text-xl font-bold">{result.confidence}%</div>
            <div className="text-xs">{getConfidenceLabel(result.confidence)}</div>
          </div>
        </div>

        {/* ── Confidence bar ──────────────────────────────────────────────────── */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Confidence</span>
            <span>{result.confidence}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                result.confidence >= 80
                  ? "bg-green-500"
                  : result.confidence >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* ── Top 3 predictions ───────────────────────────────────────────────── */}
        {result.topPredictions && result.topPredictions.length > 1 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Other Possibilities
            </p>
            <div className="space-y-2">
              {result.topPredictions.slice(1).map((pred, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-32 truncate">
                    {pred.breed}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-300 h-1.5 rounded-full"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {pred.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Health Info ─────────────────────────────────────────────────────── */}
        {result.healthNotes && (
          <BreedHealthInfo
            breed={result.predictedBreed}
            category={result.predictedCategory}
            healthNotes={result.healthNotes}
          />
        )}

        {/* ── Action buttons ──────────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-3">
          {onUseResult && (
            <button
              onClick={() => onUseResult(result)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                         text-sm font-medium py-2 px-4 rounded-lg
                         transition-colors"
            >
              ✅ Use This Result
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700
                         text-sm font-medium py-2 px-4 rounded-lg
                         transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          ⚠️ AI result is a suggestion only. Please verify manually.
        </p>

      </div>
    </div>
  );
};

export default BreedResultCard;