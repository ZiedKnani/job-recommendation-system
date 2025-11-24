# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import traceback
from recommender import DynamicJobRecommender  # ADD THIS LINE
app = Flask(__name__)
CORS(app)

# Global variable for the recommender
recommender = None

def load_recommender():
    """Load the trained recommender model"""
    global recommender
    try:
        recommender = joblib.load('dynamic_job_recommender.pkl')
        print("✅ Dynamic job recommender loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error loading recommender: {e}")
        return False

# Load the model when the app starts
load_recommender()

@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "Job Recommendation API is running",
        "endpoints": {
            "/api/recommend": "POST - Get job recommendations",
            "/api/skills/suggestions": "GET - Get skill suggestions", 
            "/api/health": "GET - Health check"
        }
    })

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """Main recommendation endpoint"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract parameters with defaults
        skills = data.get('skills', [])
        experience_level = float(data.get('experience_level', 1.0))
        top_jobs = int(data.get('top_jobs', 8))
        top_locations = int(data.get('top_locations', 5))
        
        # Validate required fields
        if not skills:
            return jsonify({'error': 'No skills provided'}), 400
        
        if not recommender:
            return jsonify({'error': 'Recommendation engine not loaded'}), 500
        
        # Get recommendations
        result = recommender.get_recommendations(
            skills=skills,
            experience_level=experience_level,
            top_jobs=top_jobs,
            top_locations=top_locations
        )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in /api/recommend: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/skills/suggestions', methods=['GET'])
def get_skill_suggestions():
    """Get popular skill suggestions from the dataset"""
    try:
        if not recommender:
            return jsonify({'error': 'Recommendation engine not loaded'}), 500
        
        # Get top skills from the dataset
        top_skills = [skill[0] for skill in recommender.available_skills[:30]]
        
        # Categorize skills for better organization
        categorized_skills = {
            'programming': [s for s in top_skills if any(word in s.lower() for word in [
                'python', 'java', 'javascript', 'sql', 'c++', 'c#', 'php', 'ruby', 'go'
            ])],
            'web_development': [s for s in top_skills if any(word in s.lower() for word in [
                'react', 'angular', 'vue', 'html', 'css', 'node', 'express', 'django', 'flask'
            ])],
            'data_science': [s for s in top_skills if any(word in s.lower() for word in [
                'data', 'analysis', 'machine', 'learning', 'statistics', 'analytics'
            ])],
            'devops_cloud': [s for s in top_skills if any(word in s.lower() for word in [
                'aws', 'docker', 'kubernetes', 'linux', 'cloud', 'devops', 'jenkins'
            ])],
            'databases': [s for s in top_skills if any(word in s.lower() for word in [
                'sql', 'mysql', 'mongodb', 'postgresql', 'database', 'redis'
            ])],
            'other_skills': [s for s in top_skills if not any(
                s in cat for cat in [
                    categorized_skills['programming'],
                    categorized_skills['web_development'], 
                    categorized_skills['data_science'],
                    categorized_skills['devops_cloud'],
                    categorized_skills['databases']
                ]
            )]
        }
        
        return jsonify({
            'suggestions': top_skills,
            'categorized': categorized_skills,
            'total_skills_available': len(recommender.available_skills)
        })
        
    except Exception as e:
        print(f"Error in /api/skills/suggestions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy' if recommender else 'unhealthy',
        'engine_loaded': recommender is not None,
        'dataset_info': {
            'total_jobs': recommender.df.shape[0] if recommender else 0,
            'total_skills': len(recommender.skill_cols) if recommender else 0,
            'total_job_titles': len(recommender.job_title_cols) if recommender else 0,
            'total_locations': len(recommender.location_cols) if recommender else 0
        } if recommender else {}
    }
    return jsonify(status)

@app.route('/api/reload', methods=['POST'])
def reload_model():
    """Reload the model (for development)"""
    try:
        success = load_recommender()
        if success:
            return jsonify({'status': 'success', 'message': 'Model reloaded successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to reload model'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Job Recommendation API...")
    print("📍 Endpoints:")
    print("   http://127.0.0.1:5000/")
    print("   http://127.0.0.1:5000/api/recommend")
    print("   http://127.0.0.1:5000/api/skills/suggestions")
    print("   http://127.0.0.1:5000/api/health")
    
    app.run(host='0.0.0.0', port=5000, debug=True)