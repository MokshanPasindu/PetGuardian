// frontend/src/components/breed/BreedClassifier.jsx

import React, { useState, useRef } from "react";
import BreedResultCard              from "./BreedResultCard";
import breedService                 from "../../services/breedService";

const BreedClassifier = ({ onBreedDetected, petId = null }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl,    setPreviewUrl]    = useState(null);
  const [isLoading,     setIsLoading]    = useState(false);
  const [result,        setResult]       = useState(null);
  const [error,         setError]        = useState(null);

  const fileInputRef = useRef(null);

  // ── Image select ──────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect({ target: { files: [file] } });
    }
  };

  // ── Classify ──────────────────────────────────────────────────────────────
  const handleClassify = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await breedService.classifyBreed(selectedImage, petId);

      // ── Unwrap Spring Boot + Flask double envelope ──────────────────────
      // Spring Boot wraps Flask response:
      // response.data = {
      //   success: true,
      //   data: {                       ← Spring ApiResponse wrapper (if any)
      //     success: true,
      //     predictedBreed: "Beagle",
      //     ...
      //   }
      // }
      // OR response.data = { success: true, predictedBreed: "Beagle", ... }

      let finalResult = response;

      // If wrapped in Spring ApiResponse
      if (response && response.data && response.data.predictedBreed) {
        finalResult = response.data;
      }
      // If wrapped in Flask format_success envelope
      else if (response && response.data && response.data.data) {
        finalResult = response.data.data;
      }

      // Ensure success flag is set
      if (finalResult && finalResult.predictedBreed) {
        finalResult.success = true;
      }

      setResult(finalResult);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Classification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Use result ────────────────────────────────────────────────────────────
  const handleUseResult = (classificationResult) => {
    if (onBreedDetected) {
      onBreedDetected({
        breed   : classificationResult.predictedBreed,
        category: classificationResult.predictedCategory,
        confidence: classificationResult.confidence,
      });
    }
    handleReset();
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-dashed border-blue-300 rounded-xl p-5">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔍</span>
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            AI Breed Detector
          </h3>
          <p className="text-xs text-gray-500">
            Upload a pet photo to auto-detect breed & category
          </p>
        </div>
      </div>

      {/* Drop zone / Preview */}
      {!previewUrl ? (
        <div
          onClick     = {() => fileInputRef.current?.click()}
          onDrop      = {handleDrop}
          onDragOver  = {(e) => e.preventDefault()}
          className   = "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-sm text-gray-600 font-medium">
            Click or drag & drop a pet image
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP • Max 5MB
          </p>
        </div>
      ) : (
        <div className="relative">
          <img
            src       = {previewUrl}
            alt       = "Pet preview"
            className = "w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            type      = "button"
            onClick   = {handleReset}
            className = "absolute top-2 right-2 bg-white border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type      = "file"
        ref       = {fileInputRef}
        onChange  = {handleImageSelect}
        accept    = "image/jpeg,image/jpg,image/png,image/webp"
        className = "hidden"
      />

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Detect button */}
      {selectedImage && !result && (
        <button
          type      = "button"
          onClick   = {handleClassify}
          disabled  = {isLoading}
          className = {[
            "mt-4 w-full py-2.5 px-4 rounded-lg text-white font-medium",
            "text-sm transition-all",
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95",
          ].join(" ")}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className   = "animate-spin h-4 w-4"
                viewBox     = "0 0 24 24"
                fill        = "none"
              >
                <circle
                  className   = "opacity-25"
                  cx="12" cy="12" r="10"
                  stroke      = "currentColor"
                  strokeWidth = "4"
                />
                <path
                  className = "opacity-75"
                  fill      = "currentColor"
                  d         = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing…
            </span>
          ) : (
            "🔍 Detect Breed"
          )}
        </button>
      )}

      {/* Result card */}
      {result && (
        <BreedResultCard
          result      = {result}
          onUseResult = {onBreedDetected ? handleUseResult : null}
          onDismiss   = {handleReset}
        />
      )}

    </div>
  );
};

export default BreedClassifier;