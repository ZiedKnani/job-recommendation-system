import express from 'express';
import { getAllJobs, getJobById } from '../controllers/jobController.js';

const router = express.Router();

/**
 * @route GET /api/jobs
 * @desc Get all jobs with pagination
 * @access Public
 */
router.get('/', getAllJobs);

/**
 * @route GET /api/jobs/:id
 * @desc Get specific job details
 * @access Public
 */
router.get('/:id', getJobById);

export default router;