// frontend/src/services/breedService.js

import api from "./api";

const breedService = {

  // ── Classify breed from image ─────────────────────────────────────────────
  classifyBreed: async (imageFile, petId = null) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    if (petId) {
      formData.append("petId", petId);
    }

    // baseURL = http://localhost:8080  (from api.js)
    // full URL = http://localhost:8080/api/breed/classify  ✅
    const response = await api.post("/api/breed/classify", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // ── Get breed scan history for current user ───────────────────────────────
  getBreedHistory: async () => {
    // full URL = http://localhost:8080/api/breed/history  ✅
    const response = await api.get("/api/breed/history");
    return response.data;
  },

  // ── Get breed scan history for a specific pet ─────────────────────────────
  getPetBreedHistory: async (petId) => {
    // full URL = http://localhost:8080/api/breed/pet/{petId}/history  ✅
    const response = await api.get(`/api/breed/pet/${petId}/history`);
    return response.data;
  },
};

export default breedService;