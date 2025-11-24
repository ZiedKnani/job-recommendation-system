import React from 'react';
import './JobCard.css';

const JobCard = ({ job }) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.7) return "#10b981";
    if (score >= 0.4) return "#f59e0b";
    return "#ef4444";
  };

  const getSalaryColor = (salary) => {
    if (!salary) return "#6b7280";
    if (salary >= 100000) return "#10b981";
    if (salary >= 70000) return "#f59e0b";
    return "#ef4444";
  };

  const similarityScore = job.skill_similarity || job.combined_score;
  const salary = job.salary_midpoint;

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3>{job.job_title}</h3>
        {similarityScore && (
          <div 
            className="similarity-badge"
            style={{ backgroundColor: getConfidenceColor(similarityScore) }}
          >
            {Math.round(similarityScore * 100)}% Match
          </div>
        )}
      </div>
      
      <div className="job-card-body">
        <div className="job-meta">
          {job.common_location && (
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              {job.common_location}
            </div>
          )}
          {job.salary_range && (
            <div className="meta-item">
              <span className="meta-icon">💰</span>
              <span style={{ color: getSalaryColor(salary) }}>
                {job.salary_range}
              </span>
            </div>
          )}
          {job.salary_confidence && (
            <div className="meta-item">
              <span className="meta-icon">📊</span>
              {job.salary_confidence} confidence
            </div>
          )}
          {job.sample_size && (
            <div className="meta-item">
              <span className="meta-icon">📈</span>
              {job.sample_size} data points
            </div>
          )}
        </div>
        
        {job.skill_similarity && job.combined_score && (
          <div className="job-stats">
            <div className="stat">
              <span className="stat-label">Skill Match</span>
              <span className="stat-value">
                {Math.round(job.skill_similarity * 100)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Overall Score</span>
              <span className="stat-value">
                {Math.round(job.combined_score * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;