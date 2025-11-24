import express from 'express';
import { getRecommendations, getSampleRecommendation } from '../controllers/recommendationController.js';

const router = express.Router();

/**
 * @route POST /api/recommendations
 * @desc Get job recommendations based on user profile
 * @access Public
 */
router.post('/', getRecommendations);

/**
 * @route GET /api/recommendations/sample
 * @desc Get sample recommendations for testing
 * @access Public
 */
router.get('/sample', getSampleRecommendation);

export default router;