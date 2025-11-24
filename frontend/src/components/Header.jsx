import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBriefcase, FaHome, FaSearch, FaStar } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <div className="logo-content">
                <FaBriefcase className="logo-icon" />
                <h1>JobReco</h1>
              </div>
            </Link>
          </div>
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <FaHome className="nav-icon" />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/search" 
                  className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
                >
                  <FaSearch className="nav-icon" />
                  Find Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/recommendations" 
                  className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}
                >
                  <FaStar className="nav-icon" />
                  Recommendations
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;