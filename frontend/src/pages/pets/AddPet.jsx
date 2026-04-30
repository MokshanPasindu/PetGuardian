// frontend/src/pages/pets/AddPet.jsx

import React, { useState, useRef } from "react";
import { useNavigate }             from "react-router-dom";
import BreedClassifier             from "../../components/breed/BreedClassifier";
import petService                  from "../../services/petService";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS — must match backend PetType enum exactly
// PetType.java: DOG, CAT, BIRD, RABBIT, HAMSTER, FISH, REPTILE, OTHER
// ═══════════════════════════════════════════════════════════════════════════════
const PET_TYPES = [
  { label: "🐶 Dog",     value: "DOG"     },
  { label: "🐱 Cat",     value: "CAT"     },
  { label: "🐦 Bird",    value: "BIRD"    },
  { label: "🐰 Rabbit",  value: "RABBIT"  },
  { label: "🐹 Hamster", value: "HAMSTER" },
  { label: "🐠 Fish",    value: "FISH"    },
  { label: "🦎 Reptile", value: "REPTILE" },
  { label: "🐾 Other",   value: "OTHER"   },
];

// Maps AI category → PetType enum value
// breed_predictor.py returns "Dog" or "Cat"
const CATEGORY_TO_TYPE = {
  "Dog" : "DOG",
  "Cat" : "CAT",
};

// ── Helper: convert age (years) → birthDate (YYYY-MM-DD) ─────────────────────
// Backend CreatePetRequest requires: birthDate: LocalDate (not null, must be past)
const ageToBirthDate = (ageYears) => {
  if (!ageYears || isNaN(ageYears) || Number(ageYears) < 0) return "";
  const birthYear = new Date().getFullYear() - Number(ageYears);
  return `${birthYear}-01-01`;   // Jan 1st of birth year
};

// ── Helper: convert birthDate → age (for display) ────────────────────────────
const birthDateToAge = (birthDate) => {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now   = new Date();
  return String(now.getFullYear() - birth.getFullYear());
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL FORM STATE
// Keys must match petService.createPet() field names exactly
// ═══════════════════════════════════════════════════════════════════════════════
const INITIAL_FORM = {
  name       : "",
  type       : "",        // PetType enum: DOG, CAT, etc.
  breed      : "",
  birthDate  : "",        // LocalDate: YYYY-MM-DD
  gender     : "",
  weight     : "",
  color      : "",
  microchipId: "",
  notes      : "",
  image      : null,      // File object for image upload
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AddPet = () => {
  const navigate    = useNavigate();
  const imageRef    = useRef(null);

  // ── Form data (matches petService.createPet() fields) ────────────────────
  const [formData, setFormData]           = useState(INITIAL_FORM);

  // ── Age input (UI only — converted to birthDate before submit) ────────────
  const [ageInput, setAgeInput]           = useState("");

  // ── Image preview URL ─────────────────────────────────────────────────────
  const [imagePreview, setImagePreview]   = useState(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showBreedDetector, setShowBreedDetector] = useState(false);
  const [breedDetected, setBreedDetected]         = useState(false);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [error, setError]                         = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  // Generic field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear AI badge if user manually edits AI-filled fields
    if ((name === "type" || name === "breed") && breedDetected) {
      setBreedDetected(false);
    }
  };

  // Age input — UI only, converts to birthDate
  const handleAgeChange = (e) => {
    const age = e.target.value;
    setAgeInput(age);
    // Convert age → birthDate and store in formData
    setFormData((prev) => ({
      ...prev,
      birthDate: ageToBirthDate(age),
    }));
  };

  // Direct birthDate input
  const handleBirthDateChange = (e) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, birthDate: date }));
    // Sync age display from birthDate
    setAgeInput(birthDateToAge(date));
  };

  // Image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // Validate size (max 10MB — matches Spring Boot config)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError(null);
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  // ── AI Breed Detection result ─────────────────────────────────────────────
  /**
   * Called when user clicks "Use This Result" in BreedResultCard.
   * breed_predictor.py returns category as "Dog" or "Cat"
   * We map "Dog" → "DOG" to match PetType enum
   */
  const handleBreedDetected = ({ breed, category }) => {
    const petType = CATEGORY_TO_TYPE[category] || "OTHER";

    setFormData((prev) => ({
      ...prev,
      type : petType,   // "DOG" or "CAT" — matches PetType enum
      breed: breed,     // "Beagle", "Persian", etc.
    }));
    setBreedDetected(true);
    setShowBreedDetector(false);
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Validate required fields ──────────────────────────────────────────
    if (!formData.name.trim()) {
      setError("Pet name is required.");
      return;
    }
    if (!formData.type) {
      setError("Pet type is required.");
      return;
    }
    if (!formData.birthDate) {
      setError("Please enter your pet's age or birth date.");
      return;
    }

    // ── Validate birthDate is in the past ─────────────────────────────────
    const birthDateObj = new Date(formData.birthDate);
    if (birthDateObj >= new Date()) {
      setError("Birth date must be in the past.");
      return;
    }

    setIsSubmitting(true);

    try {
      // petService.createPet() builds FormData internally
      // It checks: name, type, breed, birthDate, gender, weight,
      //            color, microchipId, notes, image
      await petService.createPet(formData);
      navigate("/pets");

    } catch (err) {
      // petService throws new Error(message) — not axios error directly
      setError(err.message || "Failed to add pet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Pet</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in your pet's details below.
        </p>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 flex items-start gap-2">
          <span className="text-red-500 mt-0.5">⚠️</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — Pet Name                                              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Name <span className="text-red-500">*</span>
          </label>
          <input
            type        = "text"
            name        = "name"
            value       = {formData.name}
            onChange    = {handleChange}
            required
            placeholder = "e.g., Buddy"
            autoComplete= "off"
            className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — AI Breed Detector Panel                               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  AI Breed Detection
                </p>
                <p className="text-xs text-blue-500">
                  Upload a photo — AI will identify breed & type automatically
                </p>
              </div>
            </div>
            <button
              type    = "button"
              onClick = {() => setShowBreedDetector((p) => !p)}
              className={[
                "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                showBreedDetector
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-blue-300 text-blue-700 hover:bg-blue-100",
              ].join(" ")}
            >
              {showBreedDetector ? "▲ Hide" : "▼ Detect Breed"}
            </button>
          </div>

          {/* Success notification after AI result applied */}
          {breedDetected && (
            <div className="mx-4 mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-500 text-sm">✅</span>
              <p className="text-green-700 text-xs font-medium">
                Pet type and breed auto-filled from AI detection.
                You can still edit them below.
              </p>
            </div>
          )}

          {/* BreedClassifier — shown only when panel is open */}
          {showBreedDetector && (
            <div className="px-4 pb-4">
              <BreedClassifier onBreedDetected={handleBreedDetected} />
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — Pet Type & Breed                                      */}
        {/* Pet Type → matches PetType enum: DOG, CAT, BIRD ...              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Pet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Type <span className="text-red-500">*</span>
              {breedDetected && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  ✓ AI detected
                </span>
              )}
            </label>
            <select
              name     = "type"
              value    = {formData.type}
              onChange = {handleChange}
              required
              className={[
                "w-full border rounded-lg px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                breedDetected
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-white",
              ].join(" ")}
            >
              <option value="">Select type</option>
              {PET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Breed
              {breedDetected && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  ✓ AI detected
                </span>
              )}
            </label>
            <input
              type        = "text"
              name        = "breed"
              value       = {formData.breed}
              onChange    = {handleChange}
              placeholder = "e.g., Golden Retriever"
              autoComplete= "off"
              className={[
                "w-full border rounded-lg px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                breedDetected
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-white",
              ].join(" ")}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — Birth Date & Age                                      */}
        {/* Backend needs birthDate (LocalDate) — NOT age                    */}
        {/* We show both: user can enter age OR pick a date                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Age (years) — UI convenience, auto-converts to birthDate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age (years)
              <span className="ml-1 text-xs text-gray-400 font-normal">
                — or use birth date →
              </span>
            </label>
            <input
              type        = "number"
              value       = {ageInput}
              onChange    = {handleAgeChange}
              placeholder = "e.g., 2"
              min         = "0"
              max         = "50"
              step        = "1"
              className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birth Date — required by backend (LocalDate, must be past) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type      = "date"
              name      = "birthDate"
              value     = {formData.birthDate}
              onChange  = {handleBirthDateChange}
              max       = {new Date().toISOString().split("T")[0]}
              required
              className = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — Gender & Weight                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-4">

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name     = "gender"
              value    = {formData.gender}
              onChange = {handleChange}
              className= "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type        = "number"
              name        = "weight"
              value       = {formData.weight}
              onChange    = {handleChange}
              placeholder = "e.g., 5.5"
              min         = "0"
              step        = "0.1"
              className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — Color & Microchip ID                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-4">

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color / Markings
            </label>
            <input
              type        = "text"
              name        = "color"
              value       = {formData.color}
              onChange    = {handleChange}
              placeholder = "e.g., Golden, black and white"
              autoComplete= "off"
              className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Microchip ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Microchip ID
            </label>
            <input
              type        = "text"
              name        = "microchipId"
              value       = {formData.microchipId}
              onChange    = {handleChange}
              placeholder = "Optional"
              autoComplete= "off"
              className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — Pet Image Upload                                       */}
        {/* petService.createPet() checks: petData.image instanceof File      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Photo
          </label>

          {!imagePreview ? (
            /* Drop zone */
            <div
              onClick    = {() => imageRef.current?.click()}
              className  = "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="text-3xl mb-2">📸</div>
              <p className="text-sm text-gray-500">
                Click to upload a pet photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP • Max 10MB
              </p>
            </div>
          ) : (
            /* Image preview */
            <div className="relative">
              <img
                src       = {imagePreview}
                alt       = "Pet preview"
                className = "w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                type      = "button"
                onClick   = {handleRemoveImage}
                className = "absolute top-2 right-2 bg-white border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type     = "file"
            ref      = {imageRef}
            onChange = {handleImageChange}
            accept   = "image/jpeg,image/jpg,image/png,image/webp"
            className= "hidden"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 8 — Notes                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name        = "notes"
            value       = {formData.notes}
            onChange    = {handleChange}
            rows        = {3}
            placeholder = "Any special notes — allergies, diet, behaviour…"
            className   = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 9 — Action Buttons                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-3 pt-2">

          {/* Submit */}
          <button
            type      = "submit"
            disabled  = {isSubmitting}
            className = {[
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
              isSubmitting
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm",
            ].join(" ")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className = "animate-spin h-4 w-4"
                  fill      = "none"
                  viewBox   = "0 0 24 24"
                >
                  <circle
                    className    = "opacity-25"
                    cx="12" cy="12" r="10"
                    stroke       = "currentColor"
                    strokeWidth  = "4"
                  />
                  <path
                    className = "opacity-75"
                    fill      = "currentColor"
                    d         = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding Pet…
              </span>
            ) : (
              "Add Pet"
            )}
          </button>

          {/* Cancel */}
          <button
            type      = "button"
            onClick   = {() => navigate("/pets")}
            disabled  = {isSubmitting}
            className = "px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPet;