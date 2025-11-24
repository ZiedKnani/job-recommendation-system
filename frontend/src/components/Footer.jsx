import React from 'react';
import './Footer.css';
import { FaBriefcase, FaHome, FaSearch, FaStar } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="logo-content">
                <FaBriefcase className="logo-icon" />
                <h3>JobReco</h3>
              </div>
              <p className="footer-tagline">
                AI-powered job matching for the modern professional
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <ul>
                  <li><a href="/search">Find Jobs</a></li>
                  <li><a href="/recommendations">Recommendations</a></li>
                  <li><a href="#">Career Resources</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Contact</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Connect</h4>
                <ul>
                  <li><a href="#">LinkedIn</a></li>
                  <li><a href="#">Twitter</a></li>
                  <li><a href="#">GitHub</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2024 JobReco. All rights reserved.</p>
              <p>Built with React & Machine Learning</p>
            </div>
            <div className="footer-tech">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Python</span>
              <span className="tech-badge">AI/ML</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;