import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let jobData = null;

/**
 * Load job data from CSV
 */
const loadJobData = async () => {
  if (jobData) return jobData;

  try {
    const dataPath = path.join(__dirname, '../../data/raw/job_dataset.csv');
    const csvData = await readFile(dataPath, 'utf-8');
    
    // Simple CSV parsing (in production, use a proper CSV parser)
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    jobData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const job = {};
      headers.forEach((header, index) => {
        job[header] = values[index] || '';
      });
      return job;
    }).filter(job => job.job_title); // Remove empty rows

    return jobData;
  } catch (error) {
    console.error('Error loading job data:', error);
    throw new Error('Failed to load job data');
  }
};

/**
 * Get all jobs with pagination
 */
export const getAllJobs = async (limit = 50, page = 1) => {
  const data = await loadJobData();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page,
    limit
  };
};

/**
 * Get specific job details
 */
export const getJobDetails = async (jobId) => {
  const data = await loadJobData();
  
  if (jobId < 0 || jobId >= data.length) {
    return null;
  }

  return {
    job_id: jobId,
    ...data[jobId]
  };
};