import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // backend
  timeout: 7000,
  headers: { "Content-Type": "application/json" },
});

export const jobAPI = {
  // Get all jobs
  getAllJobs: async () => {
    try {
      const response = await api.get("/jobs");
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  // Get recommendations based on user profile
  getRecommendations: async (userData) => {
    try {
      const response = await api.post("/recommendations/profile", userData);
      return response.data;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  },

  // Get similar jobs based on job ID
  getSimilarJobs: async (jobId, topN = 5) => {
    try {
      const response = await api.get(
        `/recommendations/similar/${jobId}?top_n=${topN}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting similar jobs:", error);
      throw error;
    }
  },

  // Search jobs by keywords
  searchJobs: async (query) => {
    try {
      const response = await api.get(
        `/jobs/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching jobs:", error);
      throw error;
    }
  },
};

export async function recommend(payload) {
  try {
    const res = await api.post("/api/recommend", payload);
    return res.data;
  } catch (err) {
    console.warn(
      "API /api/recommend failed, returning mock data:",
      err.message
    );
    // fallback mock for frontend development (must match shape expected by UI)
    return {
      job_recommendations: [
        {
          job_id: "mock-1",
          job_title: "Mock Dev",
          salary_range: "$60k-$80k",
          latitude: 37.7749,
          longitude: -122.4194,
          common_location: "San Francisco, CA",
        },
        {
          job_id: "mock-2",
          job_title: "Mock Analyst",
          salary_range: "$50k-$70k",
          latitude: 34.0522,
          longitude: -118.2437,
          common_location: "Los Angeles, CA",
        },
      ],
    };
  }
}

export default api;
