import { recommendJobs, getSampleRecommendation as getSample } from '../services/recommenderService.js';

/**
 * Get job recommendations based on user profile
 */
export const getRecommendations = async (req, res) => {
  try {
    const { profile_text, top_n = 10 } = req.body;

    // Validation
    if (!profile_text || profile_text.trim().length === 0) {
      return res.status(400).json({
        error: 'Profile text is required',
        message: 'Please provide your skills and experience'
      });
    }

    if (top_n < 1 || top_n > 50) {
      return res.status(400).json({
        error: 'Invalid top_n parameter',
        message: 'top_n must be between 1 and 50'
      });
    }

    const recommendations = await recommendJobs(profile_text, top_n);

    res.json({
      success: true,
      data: {
        recommendations,
        total_count: recommendations.length,
        profile_summary: profile_text.substring(0, 100) + '...'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
};

/**
 * Get sample recommendations for testing
 */
export const getSampleRecommendation = async (req, res) => {
  try {
    const sampleProfile = "3 years of Python development experience with web frameworks like Django and React. Strong knowledge of machine learning and databases.";
    const recommendations = await getSample(sampleProfile, 5);

    res.json({
      success: true,
      data: {
        recommendations,
        total_count: recommendations.length,
        profile_summary: sampleProfile.substring(0, 100) + '...',
        note: 'This is a sample recommendation for testing'
      }
    });

  } catch (error) {
    console.error('Sample recommendation error:', error);
    res.status(500).json({
      error: 'Failed to get sample recommendations',
      message: error.message
    });
  }
};