import React from 'react';
import JobCard from '../components/JobCard';
import './JobRecommendations.css';
import { FaBriefcase, FaHome, FaSearch, FaStar } from 'react-icons/fa';

const JobRecommendations = ({ recommendations = [], loading = false }) => {
  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Finding the best jobs for you...</h2>
            <p>Our AI is analyzing thousands of opportunities to match your profile</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const scoreA = a.combined_score || a.skill_similarity || 0;
    const scoreB = b.combined_score || b.skill_similarity || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="job-recommendations">
      <div className="container">
        <div className="recommendations-header">
          <h1>Your Job Recommendations</h1>
          <p>Carefully selected opportunities based on your profile and preferences</p>
        </div>

        {sortedRecommendations.length === 0 ? (
          <div className="no-recommendations">
            <div className="empty-state">
             <FaBriefcase className="logo-icon" />
              <h2>No recommendations yet</h2>
              <p>Start by searching for jobs to get personalized recommendations based on your skills and experience!</p>
              <div className="empty-actions">
                <a href="/search" className="btn btn-primary">
                  Start Job Search
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="recommendations-stats">
              <div className="stats-card">
                <div className="stat">
                  <div className="stat-number">{sortedRecommendations.length}</div>
                  <div className="stat-label">Jobs Found</div>
                </div>
                <div className="stat">
                  <div className="stat-number">
                    {Math.round(
                      (sortedRecommendations.reduce((acc, job) => 
                        acc + (job.combined_score || job.skill_similarity || 0), 0) / 
                        sortedRecommendations.length) * 100
                    )}%
                  </div>
                  <div className="stat-label">Average Match</div>
                </div>
                <div className="stat">
                  <div className="stat-number">
                    ${Math.round(
                      sortedRecommendations.reduce((acc, job) => 
                        acc + (job.salary_midpoint || 0), 0) / 
                        sortedRecommendations.length
                    ).toLocaleString()}
                  </div>
                  <div className="stat-label">Avg. Salary</div>
                </div>
              </div>
            </div>
            
            <div className="recommendations-grid">
              {sortedRecommendations.map((job, index) => (
                <JobCard key={job.job_id || index} job={job} />
              ))}
            </div>

            <div className="recommendations-footer">
              <p>
                Showing {sortedRecommendations.length} of {sortedRecommendations.length} matching jobs. 
                These recommendations update in real-time as new opportunities become available.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;