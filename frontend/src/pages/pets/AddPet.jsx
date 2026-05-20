// frontend/src/pages/pets/AddPet.jsx

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser, FiTag, FiCalendar, FiActivity, FiImage,
  FiFileText, FiCheck, FiX, FiAlertCircle, FiZap,
  FiShield, FiHeart, FiUpload, FiCamera,
} from "react-icons/fi";
import BreedClassifier from "../../components/breed/BreedClassifier";
import petService      from "../../services/petService";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const PET_TYPES = [
  { label: "Dog",     value: "DOG",     emoji: "🐶", bg: "from-amber-400  to-orange-500"  },
  { label: "Cat",     value: "CAT",     emoji: "🐱", bg: "from-purple-400 to-violet-500"  },
  { label: "Bird",    value: "BIRD",    emoji: "🐦", bg: "from-sky-400    to-blue-500"    },
  { label: "Rabbit",  value: "RABBIT",  emoji: "🐰", bg: "from-pink-400   to-rose-500"    },
  { label: "Hamster", value: "HAMSTER", emoji: "🐹", bg: "from-yellow-400 to-amber-500"   },
  { label: "Fish",    value: "FISH",    emoji: "🐠", bg: "from-cyan-400   to-teal-500"    },
  { label: "Reptile", value: "REPTILE", emoji: "🦎", bg: "from-green-400  to-emerald-500" },
  { label: "Other",   value: "OTHER",   emoji: "🐾", bg: "from-gray-400   to-slate-500"   },
];

const CATEGORY_TO_TYPE = { Dog: "DOG", Cat: "CAT" };

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const ageToBirthDate = (y) => {
  if (!y || isNaN(y) || Number(y) < 0) return "";
  return `${new Date().getFullYear() - Number(y)}-01-01`;
};
const birthDateToAge = (d) => {
  if (!d) return "";
  return String(new Date().getFullYear() - new Date(d).getFullYear());
};

const INITIAL_FORM = {
  name: "", type: "", breed: "", birthDate: "",
  gender: "", weight: "", color: "", microchipId: "", notes: "", image: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// UI ATOMS
// ═══════════════════════════════════════════════════════════════════════════════

/* ── Glassmorphism section card ── */
const Card = ({ children, className = "" }) => (
  <div className={`
    relative bg-white dark:bg-gray-800/90
    border border-gray-100 dark:border-gray-700/60
    rounded-3xl shadow-soft overflow-hidden
    backdrop-blur-sm
    ${className}
  `}>
    {children}
  </div>
);

/* ── Colored left border accent ── */
const CardAccent = ({ gradient }) => (
  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`} />
);

/* ── Section header row ── */
const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className="flex items-center gap-3 mb-5 pl-2">
    <div className={`
      w-9 h-9 rounded-2xl bg-gradient-to-br ${gradient}
      flex items-center justify-center shadow-soft flex-shrink-0
    `}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <h3 className="text-xs font-black text-gray-500 dark:text-gray-400
                   uppercase tracking-[0.15em]">
      {title}
    </h3>
  </div>
);

/* ── Field wrapper ── */
const Field = ({ label, required, ai, hint, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {ai && (
        <span className="inline-flex items-center gap-1 text-[10px] font-black
                         bg-gradient-to-r from-accent-500 to-primary-500
                         text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
          <FiZap className="w-2.5 h-2.5" /> AI
        </span>
      )}
    </div>
    {children}
    {hint && (
      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
        {hint}
      </p>
    )}
  </div>
);

/* ── Base input ── */
const Input = ({ ai, highlight, className = "", ...props }) => (
  <input
    {...props}
    className={`
      w-full rounded-2xl px-4 py-3 text-sm font-medium border-2
      transition-all duration-200 outline-none
      placeholder:text-gray-300 dark:placeholder:text-gray-600
      dark:bg-gray-700/50 dark:text-gray-100
      focus:scale-[1.01]
      ${ai || highlight
        ? "border-primary-300 dark:border-primary-600/50 bg-primary-50/80 dark:bg-primary-900/20 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30"
        : "border-gray-100 dark:border-gray-600/50 bg-gray-50/80 dark:bg-gray-700/30 focus:border-accent-300 dark:focus:border-accent-600 focus:ring-4 focus:ring-accent-50 dark:focus:ring-accent-900/20 hover:border-gray-200 dark:hover:border-gray-500"
      }
      ${className}
    `}
  />
);

/* ── Pet type card button ── */
const TypeCard = ({ type, selected, ai, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl
      border-2 text-xs font-bold transition-all duration-200
      hover:scale-105 active:scale-95 focus:outline-none
      ${selected
        ? "border-transparent shadow-medium text-white"
        : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-750"
      }
    `}
  >
    {/* Gradient bg when selected */}
    {selected && (
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${type.bg} opacity-90`} />
    )}
    {/* AI glow ring */}
    {selected && ai && (
      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-400 ring-offset-2
                      ring-offset-white dark:ring-offset-gray-800" />
    )}
    <span className="relative text-2xl leading-none">{type.emoji}</span>
    <span className="relative leading-tight text-center">{type.label}</span>
  </button>
);

/* ── Gender toggle button ── */
const GenderBtn = ({ label, icon, active, gradient, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      py-3 rounded-2xl border-2 text-sm font-bold
      flex items-center justify-center gap-2
      transition-all duration-200 active:scale-95 focus:outline-none
      ${active
        ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow-soft`
        : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600"
      }
    `}
  >
    <span className="text-base leading-none">{icon}</span>
    {label}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS DOTS  (visual only — not steps)
// ═══════════════════════════════════════════════════════════════════════════════
const ProgressDots = ({ formData, imagePreview }) => {
  const checks = [
    !!formData.name.trim(),
    !!formData.type,
    !!formData.birthDate,
    !!(formData.gender || formData.weight),
    !!(formData.color || formData.microchipId),
    !!imagePreview,
    !!formData.notes,
  ];
  const done = checks.filter(Boolean).length;
  const pct  = Math.round((done / checks.length) * 100);

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-400 to-primary-500
                     rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-8 text-right">
        {pct}%
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AddPet = () => {
  const navigate = useNavigate();
  const imageRef = useRef(null);       // ← ONLY ref, same pattern as original

  const [formData,          setFormData]          = useState(INITIAL_FORM);
  const [ageInput,          setAgeInput]          = useState("");
  const [imagePreview,      setImagePreview]      = useState(null); // null by default
  const [showBreedDetector, setShowBreedDetector] = useState(false);
  const [breedDetected,     setBreedDetected]     = useState(false);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [error,             setError]             = useState(null);

  // ── Handlers (identical logic to working original) ──────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if ((name === "type" || name === "breed") && breedDetected) setBreedDetected(false);
  };

  const handleTypeChange = (v) => {
    setFormData((p) => ({ ...p, type: v }));
    if (breedDetected) setBreedDetected(false);
  };

  const handleGenderChange = (v) => setFormData((p) => ({ ...p, gender: v }));

  const handleAgeChange = (e) => {
    const a = e.target.value;
    setAgeInput(a);
    setFormData((p) => ({ ...p, birthDate: ageToBirthDate(a) }));
  };

  const handleBirthDateChange = (e) => {
    const d = e.target.value;
    setFormData((p) => ({ ...p, birthDate: d }));
    setAgeInput(birthDateToAge(d));
  };

  // ── Image — SAME pattern as working original ──────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image."); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB."); return;
    }
    setError(null);
    setFormData((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    setImagePreview(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleBreedDetected = ({ breed, category }) => {
    setFormData((p) => ({
      ...p,
      type : CATEGORY_TO_TYPE[category] || "OTHER",
      breed: breed,
    }));
    setBreedDetected(true);
    setShowBreedDetector(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim())  { setError("Pet name is required.");                      return; }
    if (!formData.type)         { setError("Please select a pet type.");                  return; }
    if (!formData.birthDate)    { setError("Please enter your pet's age or birth date."); return; }
    if (new Date(formData.birthDate) >= new Date()) {
      setError("Birth date must be in the past."); return;
    }
    setIsSubmitting(true);
    try {
      await petService.createPet(formData);
      navigate("/pets");
    } catch (err) {
      setError(err.message || "Failed to add pet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br
                    from-slate-50 via-white to-primary-50/40
                    dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* ── Decorative blobs ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full
                        bg-primary-200/30 dark:bg-primary-900/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full
                        bg-accent-200/30 dark:bg-accent-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-8">
          <div className="
            w-16 h-16 rounded-3xl flex-shrink-0
            bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500
            flex items-center justify-center
            shadow-medium shadow-primary-200/60 dark:shadow-primary-900/40
          ">
            <FiHeart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-display font-black
                           text-gray-900 dark:text-white leading-tight">
              Add New Pet
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Create a digital health passport for your furry companion
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/pets")}
            className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800
                       flex items-center justify-center flex-shrink-0
                       hover:bg-gray-200 dark:hover:bg-gray-700
                       transition-colors text-gray-500 dark:text-gray-400"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        <ProgressDots formData={formData} imagePreview={imagePreview} />

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl p-4
                          bg-red-50 dark:bg-red-900/20
                          border-2 border-red-200 dark:border-red-800/60">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50
                            flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold flex-1 pt-1">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-0.5"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 1. PET NAME                                                   */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-primary-400 to-accent-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiUser}
                title    = "Pet Name"
                gradient = "from-primary-400 to-accent-500"
              />
              <Field label="What's your pet's name?" required>
                <Input
                  type        = "text"
                  name        = "name"
                  value       = {formData.name}
                  onChange    = {handleChange}
                  placeholder = "e.g., Buddy, Luna, Max, Bella…"
                  autoComplete= "off"
                />
              </Field>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 2. AI BREED DETECTOR                                          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="
            rounded-3xl border-2 border-dashed border-accent-300
            dark:border-accent-700/60
            bg-gradient-to-br from-accent-50/80 to-primary-50/60
            dark:from-accent-900/20 dark:to-primary-900/10
            overflow-hidden
          ">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl flex-shrink-0
                                bg-gradient-to-br from-accent-500 to-primary-500
                                flex items-center justify-center shadow-soft">
                  <FiZap className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100">
                      AI Breed Detection
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest
                                     bg-gradient-to-r from-accent-500 to-primary-500
                                     text-white px-2 py-0.5 rounded-full flex-shrink-0">
                      SMART
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    Upload a photo — instantly detect breed & type
                  </p>
                </div>
              </div>
              <button
                type    = "button"
                onClick = {() => setShowBreedDetector((p) => !p)}
                className={`
                  text-xs font-bold px-4 py-2 rounded-2xl
                  transition-all duration-200 flex-shrink-0 ml-3
                  ${showBreedDetector
                    ? "bg-accent-600 text-white shadow-soft"
                    : "bg-white dark:bg-gray-800 border-2 border-accent-200 dark:border-accent-700 text-accent-700 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/30"
                  }
                `}
              >
                {showBreedDetector ? "✕ Hide" : "✦ Try it"}
              </button>
            </div>

            {/* AI success notice */}
            {breedDetected && (
              <div className="mx-5 mb-4 sm:mx-6 flex items-center gap-2
                               bg-white/80 dark:bg-gray-800/80
                               border border-primary-200 dark:border-primary-700
                               rounded-2xl px-4 py-2.5 shadow-soft">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50
                                flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-xs text-primary-700 dark:text-primary-300 font-semibold">
                  Breed & type auto-filled from AI — edit below if needed
                </p>
              </div>
            )}

            {/* BreedClassifier — own internal file input, no ref conflict */}
            {showBreedDetector && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <BreedClassifier onBreedDetected={handleBreedDetected} />
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 3. PET TYPE & BREED                                           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-accent-400 to-violet-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6 space-y-5">
              <SectionHeader
                icon     = {FiTag}
                title    = "Type & Breed"
                gradient = "from-accent-400 to-violet-500"
              />

              {/* Type grid */}
              <Field label="Select Pet Type" required ai={breedDetected}>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-1">
                  {PET_TYPES.map((t) => (
                    <TypeCard
                      key      = {t.value}
                      type     = {t}
                      selected = {formData.type === t.value}
                      ai       = {breedDetected}
                      onClick  = {() => handleTypeChange(t.value)}
                    />
                  ))}
                </div>
              </Field>

              {/* Breed */}
              <Field
                label = "Breed"
                ai    = {breedDetected}
                hint  = "Leave blank if mixed breed or unknown"
              >
                <Input
                  type        = "text"
                  name        = "breed"
                  value       = {formData.breed}
                  onChange    = {handleChange}
                  placeholder = "e.g., Golden Retriever, Persian, Beagle…"
                  autoComplete= "off"
                  ai          = {breedDetected}
                />
              </Field>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 4. AGE & BIRTHDAY                                             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-amber-400 to-orange-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiCalendar}
                title    = "Age & Birthday"
                gradient = "from-amber-400 to-orange-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Age (years)" hint="Automatically converts to birth date">
                  <Input
                    type        = "number"
                    value       = {ageInput}
                    onChange    = {handleAgeChange}
                    placeholder = "e.g., 2"
                    min="0" max="50" step="1"
                  />
                </Field>
                <Field label="Birth Date" required hint="Must be a past date">
                  <Input
                    type     = "date"
                    name     = "birthDate"
                    value    = {formData.birthDate}
                    onChange = {handleBirthDateChange}
                    max      = {new Date().toISOString().split("T")[0]}
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 5. GENDER & WEIGHT                                            */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-green-400 to-emerald-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiActivity}
                title    = "Gender & Weight"
                gradient = "from-green-400 to-emerald-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Gender">
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    <GenderBtn
                      label    = "Male"
                      icon     = "♂"
                      active   = {formData.gender === "Male"}
                      gradient = "from-sky-400 to-blue-500"
                      onClick  = {() => handleGenderChange("Male")}
                    />
                    <GenderBtn
                      label    = "Female"
                      icon     = "♀"
                      active   = {formData.gender === "Female"}
                      gradient = "from-pink-400 to-rose-500"
                      onClick  = {() => handleGenderChange("Female")}
                    />
                  </div>
                </Field>
                <Field label="Weight (kg)" hint="Current body weight">
                  <Input
                    type        = "number"
                    name        = "weight"
                    value       = {formData.weight}
                    onChange    = {handleChange}
                    placeholder = "e.g., 5.5"
                    min="0" step="0.1"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 6. COLOR & MICROCHIP                                          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-purple-400 to-violet-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiShield}
                title    = "Appearance & ID"
                gradient = "from-purple-400 to-violet-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Color / Markings" hint="e.g., Golden, black & white">
                  <Input
                    type        = "text"
                    name        = "color"
                    value       = {formData.color}
                    onChange    = {handleChange}
                    placeholder = "e.g., Golden, black & white"
                    autoComplete= "off"
                  />
                </Field>
                <Field label="Microchip ID" hint="15-digit ISO number (optional)">
                  <Input
                    type        = "text"
                    name        = "microchipId"
                    value       = {formData.microchipId}
                    onChange    = {handleChange}
                    placeholder = "e.g., 900123456789012"
                    autoComplete= "off"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 7. PET PHOTO                                                  */}
          {/* EXACT same ref + onClick pattern as working original          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-cyan-400 to-blue-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiCamera}
                title    = "Pet Photo"
                gradient = "from-cyan-400 to-blue-500"
              />

              {/* ── Drop zone ─────────────────────────────────────────── */}
              {!imagePreview ? (
                <div
                  onClick   = {() => imageRef.current?.click()}
                  className = "
                    relative border-2 border-dashed border-gray-200
                    dark:border-gray-600 rounded-2xl overflow-hidden
                    cursor-pointer group transition-all duration-300
                    hover:border-primary-400 dark:hover:border-primary-500
                    hover:bg-primary-50/50 dark:hover:bg-primary-900/10
                  "
                >
                  <div className="flex flex-col items-center gap-4 py-12 px-6
                                  pointer-events-none">
                    {/* Upload icon with animated ring */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary-100
                                      dark:bg-primary-900/30 scale-0
                                      group-hover:scale-150 transition-transform
                                      duration-500 opacity-0 group-hover:opacity-100" />
                      <div className="relative w-16 h-16 rounded-2xl
                                      bg-gray-100 dark:bg-gray-700
                                      group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40
                                      flex items-center justify-center transition-colors duration-300">
                        <FiUpload className="w-7 h-7 text-gray-400 dark:text-gray-500
                                             group-hover:text-primary-500 transition-colors duration-300" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400
                                    group-hover:text-primary-600 dark:group-hover:text-primary-400
                                    transition-colors duration-200">
                        Click to upload a photo
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                        JPG · PNG · WebP &nbsp;·&nbsp; Max 10 MB
                      </p>
                    </div>

                    <span className="
                      text-xs font-bold px-5 py-2 rounded-full
                      bg-gray-100 dark:bg-gray-700
                      group-hover:bg-primary-500 group-hover:text-white
                      text-gray-500 dark:text-gray-400
                      transition-all duration-300 shadow-soft
                    ">
                      Browse Files
                    </span>
                  </div>
                </div>

              ) : (
                /* ── Image preview ─────────────────────────────────────── */
                <div className="relative rounded-2xl overflow-hidden group shadow-medium">
                  <img
                    src       = {imagePreview}
                    alt       = "Pet preview"
                    className = "w-full h-56 sm:h-72 object-cover
                                 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t
                                  from-black/60 via-transparent to-transparent" />

                  {/* Action buttons — always visible on mobile, hover on desktop */}
                  <div className="
                    absolute inset-0
                    flex items-center justify-center gap-3
                    bg-black/0 group-hover:bg-black/20
                    transition-all duration-300
                    opacity-0 group-hover:opacity-100
                  ">
                    <button
                      type      = "button"
                      onClick   = {() => imageRef.current?.click()}
                      className = "bg-white/95 backdrop-blur-sm text-gray-800
                                   text-xs font-bold px-4 py-2.5 rounded-xl
                                   shadow-medium hover:bg-white transition-colors
                                   flex items-center gap-1.5"
                    >
                      <FiCamera className="w-3.5 h-3.5" /> Change
                    </button>
                    <button
                      type      = "button"
                      onClick   = {handleRemoveImage}
                      className = "bg-red-500/90 backdrop-blur-sm text-white
                                   text-xs font-bold px-4 py-2.5 rounded-xl
                                   shadow-medium hover:bg-red-600 transition-colors
                                   flex items-center gap-1.5"
                    >
                      <FiX className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3
                                  flex items-center justify-between">
                    <span className="text-white/80 text-xs font-medium truncate max-w-[60%]">
                      {formData.image?.name}
                    </span>
                    <div className="flex items-center gap-1.5 bg-primary-500/90
                                    backdrop-blur-sm text-white text-xs font-bold
                                    px-3 py-1.5 rounded-full shadow-soft">
                      <FiCheck className="w-3 h-3" /> Photo ready
                    </div>
                  </div>
                </div>
              )}

              {/* ── Hidden file input — IDENTICAL to working original ─── */}
              <input
                type      = "file"
                ref       = {imageRef}
                onChange  = {handleImageChange}
                accept    = "image/jpeg,image/jpg,image/png,image/webp"
                className = "hidden"
              />
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 8. NOTES                                                      */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <Card>
            <CardAccent gradient="from-teal-400 to-primary-500" />
            <div className="pl-5 pr-5 pt-5 pb-5 sm:pl-7 sm:pr-6 sm:pt-6 sm:pb-6">
              <SectionHeader
                icon     = {FiFileText}
                title    = "Additional Notes"
                gradient = "from-teal-400 to-primary-500"
              />
              <textarea
                name        = "notes"
                value       = {formData.notes}
                onChange    = {handleChange}
                rows        = {3}
                placeholder = "Allergies, diet, behaviour, special needs, favourite toys…"
                className   = "
                  w-full rounded-2xl px-4 py-3 text-sm font-medium border-2
                  border-gray-100 dark:border-gray-600/50
                  bg-gray-50/80 dark:bg-gray-700/30
                  dark:text-gray-100 dark:placeholder:text-gray-600
                  placeholder:text-gray-300
                  focus:outline-none focus:border-accent-300 dark:focus:border-accent-600
                  focus:ring-4 focus:ring-accent-50 dark:focus:ring-accent-900/20
                  hover:border-gray-200 dark:hover:border-gray-500
                  transition-all duration-200 resize-none
                "
              />
            </div>
          </Card>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* 9. ACTION BUTTONS                                             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="flex gap-3 pt-2 pb-4">

            {/* Submit */}
            <button
              type      = "submit"
              disabled  = {isSubmitting}
              className = {`
                flex-1 py-4 rounded-2xl text-sm font-black
                flex items-center justify-center gap-2.5
                transition-all duration-200 active:scale-[0.98]
                ${isSubmitting
                  ? "bg-primary-300 dark:bg-primary-800 text-white cursor-not-allowed"
                  : `bg-gradient-to-r from-primary-500 to-accent-500
                     hover:from-primary-600 hover:to-accent-600
                     text-white shadow-medium shadow-primary-200/60
                     dark:shadow-primary-900/40
                     hover:shadow-strong hover:shadow-primary-300/40
                     dark:hover:shadow-primary-800/40`
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Adding Pet…
                </>
              ) : (
                <>
                  <FiHeart className="w-4 h-4" />
                  Add Pet to Family
                </>
              )}
            </button>

            {/* Cancel */}
            <button
              type      = "button"
              onClick   = {() => navigate("/pets")}
              disabled  = {isSubmitting}
              className = "
                px-6 py-4 rounded-2xl text-sm font-bold
                bg-white dark:bg-gray-800
                hover:bg-gray-50 dark:hover:bg-gray-700
                text-gray-500 dark:text-gray-400
                border-2 border-gray-100 dark:border-gray-700
                transition-all duration-200 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddPet;