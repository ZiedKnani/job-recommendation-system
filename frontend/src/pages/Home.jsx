import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  List, 
  Target, 
  Zap, 
  User, 
  BarChart3, 
  Globe, 
  RefreshCw,
  Briefcase,
  MapPin,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Find Your Dream Job with Intelligent Matching</h1>
              <p>
                Get personalized job recommendations based on your skills, experience, 
                and preferences using our advanced matching system.
              </p>
              <div className="hero-buttons">
                <Link to="/search" className="btn btn-primary btn-large">
                  <Search size={20} />
                  Start Your Search
                </Link>
                <Link to="/recommendations" className="btn btn-secondary btn-large">
                  <List size={20} />
                  View Recommendations
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Jobs Matched</div>
                </div>
                <div className="stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Accuracy Rate</div>
                </div>
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Real-time Updates</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-card">
                <div className="card-header">
                  <div className="card-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="job-preview">
                    <div className="preview-header">
                      <h4>Senior Developer</h4>
                      <span className="match-badge">92% Match</span>
                    </div>
                    <div className="preview-details">
                      <span><MapPin size={14} /> San Francisco</span>
                      <span><DollarSign size={14} /> $120,000 - $150,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Our platform makes job hunting smarter and more efficient</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Target size={32} />
              </div>
              <h3>Smart Matching</h3>
              <p>Advanced algorithms analyze job requirements and your profile to find perfect matches.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Fast Results</h3>
              <p>Get instant recommendations powered by real-time job market data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <User size={32} />
              </div>
              <h3>Personalized</h3>
              <p>Recommendations tailored to your skills, career goals, and preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Data-Driven</h3>
              <p>Make informed decisions with salary insights and market trends.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Globe size={32} />
              </div>
              <h3>Global Reach</h3>
              <p>Access opportunities from companies worldwide with comprehensive analysis.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <RefreshCw size={32} />
              </div>
              <h3>Continuous Updates</h3>
              <p>Our system improves with every interaction for better recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Job?</h2>
            <p>Join thousands of professionals who found their dream jobs through our platform</p>
            <Link to="/search" className="btn btn-primary btn-large">
              <Search size={20} />
              Start Searching Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;