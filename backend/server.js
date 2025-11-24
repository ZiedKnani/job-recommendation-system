import express from "express";
import cors from "cors";
import KaggleService from "./services/kaggleService.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import axios from "axios";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

let jobs = [];
let mlEngine = {
  status: "ready",
  primary: "career_advisor",
  models: ["career_advisor"],
};

// Career Advisor Python API configuration (override via env)
const PYTHON_PORT = process.env.PYTHON_PORT || "5000";
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || `http://localhost:${PYTHON_PORT}`;

// Start Python server properly (only start if not already running)
function startPythonServer() {
  return new Promise(async (resolve, reject) => {
    try {
      await axios.get(`${PYTHON_API_URL}/health`, { timeout: 1500 });
      console.log("✅ Career Advisor API already running");
      return resolve();
    } catch {
      console.log("⚠️ Career Advisor API not running, starting now...");
    }

    const pythonPath = join(__dirname, "ml-core", "api_server.py");
    const python = spawn("python", [pythonPath], {
      cwd: join(__dirname, "ml-core"),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PYTHON_PORT: PYTHON_PORT },
    });

    let started = false;
    python.stdout.on("data", (data) => {
      const msg = data.toString();
      process.stdout.write(`🐍 PYTHON: ${msg}`);
      if (
        !started &&
        (msg.includes("Application startup complete") ||
          msg.includes("Uvicorn running"))
      ) {
        started = true;
        console.log("🐍 Python Career Advisor is READY");
        resolve();
      }
    });

    python.stderr.on("data", (data) => {
      const msg = data.toString();
      process.stderr.write(`🐍 PYTHON ERROR: ${msg}`);
      if (
        msg.includes("error while attempting to bind") ||
        msg.includes("Address already in use")
      ) {
        reject(new Error(`Port ${PYTHON_PORT} already in use`));
      }
    });

    python.on("exit", (code) => {
      if (!started) reject(new Error(`Python exited with code ${code}`));
      else console.log(`Python exited with code ${code}`);
    });
  });
}

async function startCareerAdvisorAPI() {
  try {
    console.log("🚀 Starting Career Advisor API...");
    await startPythonServer();

    // Poll /health
    let attempts = 0;
    while (attempts < 10) {
      try {
        await axios.get(`${PYTHON_API_URL}/health`, { timeout: 2000 });
        console.log("✅ Career Advisor API started successfully");
        mlEngine.status = "ready";
        return true;
      } catch {
        attempts++;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw new Error("Career Advisor API failed to start");
  } catch (err) {
    console.error("❌ Error starting Career Advisor API:", err.message);
    mlEngine.status = "error";
    return false;
  }
}

// Helper: call Python Career Advisor
async function getCareerAdvisorRecommendations(payload = {}, top_n = 10) {
  try {
    const resp = await axios.post(
      `${PYTHON_API_URL}/api/recommend`,
      {
        skills: payload.skills || "",
        experience: payload.experience || "",
        qualifications: payload.qualifications || "",
        top_n: top_n,
      },
      { timeout: 15000 }
    );
    return resp.data;
  } catch (err) {
    throw new Error(`Career Advisor request failed: ${err.message}`);
  }
}

// CSV parsing (simple)
function parseCSV(csvData) {
  if (!csvData) return [];
  const lines = csvData.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines
    .slice(1)
    .map((line) => {
      const values = [];
      let curr = "",
        inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) {
          values.push(curr.trim());
          curr = "";
        } else curr += ch;
      }
      values.push(curr.trim());
      const job = {};
      headers.forEach(
        (h, i) => (job[h] = (values[i] || "").replace(/^"(.*)"$/, "$1"))
      );
      return job;
    })
    .filter((j) => j["Job Title"]);
}

// Simple keyword fallback recommender
function getBasicRecommendations(profileText, topN = 10) {
  const profileWords = profileText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.replace(/[^\w]/g, ""));
  const scored = jobs
    .map((job, idx) => {
      const text = Object.values(job).join(" ").toLowerCase();
      let score = 0;
      profileWords.forEach((w) => {
        if (text.includes(w)) score += 1;
      });
      return { job, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  return scored.map((s) => ({
    job_id: s.job["Job Id"] || Math.random().toString(36).slice(2, 9),
    job_title: s.job["Job Title"],
    role: s.job.Role || s.job["Job Title"],
    company: s.job.Company || "",
    location: s.job.location || "",
    country: s.job.Country || "",
    experience: s.job.Experience || "",
    salary_range: s.job["Salary Range"] || "",
    description: s.job["Job Description"] || "",
    skills: s.job.skills || "",
    similarity_score: Math.min(1, s.score / (profileWords.length || 1)),
    algorithm: "keyword_fallback",
  }));
}

// Load jobs and ensure Python API available
async function loadJobs() {
  try {
    console.log("🔄 Loading dataset from KaggleService...");
    const csv = await KaggleService.getDataset();
    jobs = parseCSV(csv);
    console.log(`✅ Loaded ${jobs.length} jobs`);
    await startCareerAdvisorAPI();
  } catch (err) {
    console.warn("❌ Load dataset failed, using sample data:", err.message);
    const sample = KaggleService.getSampleData();
    jobs = parseCSV(sample);
    await startCareerAdvisorAPI();
  }
}

// ROUTES (single copy)
app.get("/", (req, res) => {
  res.json({
    message: "🎯 Job Recommendation API - Career Advisor AI System",
    status: "online",
    jobs_loaded: jobs.length,
    ml_status: mlEngine.status,
    career_advisor_url: PYTHON_API_URL,
  });
});

app.post("/api/recommendations/profile", async (req, res) => {
  const { skills = "", experience = "", qualifications = "" } = req.body || {};
  if (!skills.trim())
    return res.status(400).json({ error: "Skills are required" });

  try {
    let result;
    try {
      const ai = await getCareerAdvisorRecommendations(
        { skills, experience, qualifications },
        10
      );
      // If Python returns structured data use it, otherwise fallback
      result = ai?.jobs ? ai : { jobs: [] };
    } catch {
      // fallback
      const basic = getBasicRecommendations(
        `${skills} ${experience} ${qualifications}`,
        10
      );
      result = {
        jobs: basic,
        best_countries: [],
        salary_insights: {},
        country_data: [],
      };
    }

    res.json({
      recommendations: result.jobs,
      best_countries: result.best_countries || [],
      salary_insights: result.salary_insights || {},
      country_data: result.country_data || [],
      profile: { skills, experience, qualifications },
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
});

app.post("/api/recommend/ai", async (req, res) => {
  const { skills = "" } = req.body || {};
  if (!skills.trim())
    return res.status(400).json({ error: "Skills are required" });
  try {
    const ai = await getCareerAdvisorRecommendations(
      req.body,
      req.body.top_n || 10
    );
    res.json({ success: true, data: ai, profile: req.body });
  } catch (err) {
    res
      .status(500)
      .json({ error: "AI service unavailable", message: err.message });
  }
});

app.get("/api/career-health", async (req, res) => {
  try {
    const r = await axios.get(`${PYTHON_API_URL}/health`, { timeout: 3000 });
    res.json({
      career_advisor: "healthy",
      jobs_loaded: r.data.jobs_loaded,
      python_api: PYTHON_API_URL,
    });
  } catch (err) {
    res.status(503).json({ career_advisor: "unhealthy", error: err.message });
  }
});

app.get("/api/jobs", (req, res) => res.json(jobs));

app.get("/api/recommendations/similar/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const target = jobs.find((j) => j["Job Id"] === jobId || j.job_id === jobId);
  if (!target) return res.status(404).json({ error: "Job not found" });
  const profile = [
    target["Job Title"],
    target.Role,
    target.skills,
    target.Qualifications,
    target.Experience,
    target["Job Description"],
  ].join(" ");
  const recs = getBasicRecommendations(
    profile,
    parseInt(req.query.top_n) || 5
  ).filter((r) => r.job_id.toString() !== jobId.toString());
  res.json(recs);
});

app.get("/api/jobs/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase().trim();
  if (!q) return res.json([]);
  const terms = q.split(/\s+/);
  const filtered = jobs.filter((job) =>
    terms.every((t) => Object.values(job).join(" ").toLowerCase().includes(t))
  );
  res.json(filtered.slice(0, 50));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    jobs_loaded: jobs.length,
    ml_engine: mlEngine,
    career_advisor_url: PYTHON_API_URL,
  });
});

// Start sequence
(async () => {
  try {
    await startPythonServer();
    await loadJobs();
    app.listen(PORT, () => {
      console.log(`🚀 Node server running: http://localhost:${PORT}`);
      console.log(`🐍 Python Career Advisor: ${PYTHON_API_URL}`);
    });
  } catch (err) {
    console.error("❌ Failed to start services:", err.message);
    process.exit(1);
  }
})();
