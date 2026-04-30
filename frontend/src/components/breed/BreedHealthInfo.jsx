// frontend/src/components/breed/BreedHealthInfo.jsx

import React from "react";

// ════════════════════════════════════════════════════════════════════════════════
// BREED HEALTH INFO COMPONENT
// Displays health notes for a detected breed
// ════════════════════════════════════════════════════════════════════════════════
const BreedHealthInfo = ({ breed, category, healthNotes }) => {

  // ── Nothing to show ───────────────────────────────────────────────────────
  if (!healthNotes || Object.keys(healthNotes).length === 0) {
    return null;
  }

  // ── Category color ────────────────────────────────────────────────────────
  const categoryColor = category === "Dog"
    ? "bg-orange-50 border-orange-200 text-orange-700"
    : "bg-purple-50 border-purple-200 text-purple-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-3">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">
          {category === "Dog" ? "🐶" : category === "Cat" ? "🐱" : "🐾"}
        </span>
        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            {breed} — Health Info
          </h4>
          <span className={`
            inline-block text-xs px-2 py-0.5 rounded-full border font-medium
            ${categoryColor}
          `}>
            {category}
          </span>
        </div>
      </div>

      {/* ── Care Tips ───────────────────────────────────────────────────────── */}
      {healthNotes.care_tips && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">
            💡 Care Tips
          </p>
          <p className="text-sm text-blue-600">{healthNotes.care_tips}</p>
        </div>
      )}

      {/* ── Common Conditions ───────────────────────────────────────────────── */}
      {healthNotes.common_conditions &&
       healthNotes.common_conditions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            ⚠️ Common Health Conditions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {healthNotes.common_conditions.map((condition, index) => (
              <span
                key={index}
                className="text-xs bg-red-50 border border-red-200
                           text-red-600 px-2 py-0.5 rounded-full"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Life Expectancy & Size ───────────────────────────────────────────── */}
      <div className="flex gap-3 mt-2">
        {healthNotes.life_expectancy && (
          <div className="flex-1 bg-gray-50 border border-gray-200
                          rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Life Expectancy</p>
            <p className="text-sm font-semibold text-gray-700">
              {healthNotes.life_expectancy}
            </p>
          </div>
        )}
        {healthNotes.size && (
          <div className="flex-1 bg-gray-50 border border-gray-200
                          rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Size</p>
            <p className="text-sm font-semibold text-gray-700">
              {healthNotes.size}
            </p>
          </div>
        )}
        {healthNotes.temperament && (
          <div className="flex-1 bg-gray-50 border border-gray-200
                          rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Temperament</p>
            <p className="text-sm font-semibold text-gray-700">
              {healthNotes.temperament}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default BreedHealthInfo;