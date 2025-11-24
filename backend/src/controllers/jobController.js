import { getAllJobs as getJobs, getJobDetails } from '../services/dataService.js';

/**
 * Get all jobs with pagination
 */
export const getAllJobs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const jobs = await getJobs(parseInt(limit), parseInt(page));

    res.json({
      success: true,
      data: {
        jobs: jobs.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jobs.total,
          totalPages: Math.ceil(jobs.total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
};

/**
 * Get specific job details
 */
export const getJobById = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId) || jobId < 0) {
      return res.status(400).json({
        error: 'Invalid job ID',
        message: 'Job ID must be a positive number'
      });
    }

    const job = await getJobDetails(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `Job with ID ${jobId} does not exist`
      });
    }

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      error: 'Failed to fetch job details',
      message: error.message
    });
  }
};