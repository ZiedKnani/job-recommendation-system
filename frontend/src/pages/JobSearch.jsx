import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaChartBar, 
  FaChartLine,
  FaBriefcase,
  FaStar,
  FaCog,
  FaLightbulb,
  FaRocket,
  FaGlobeAmericas,
  FaList,
  FaAward,
  FaMoneyBillWave,
  FaUserTie
} from "react-icons/fa";
import "./JobSearch.css";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Custom icon
const createCustomIcon = () => {
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Geocoding service (keep your existing geocoding functions)
const geocodeLocation = async (location) => {
  try {
    const cached = localStorage.getItem(`geocode_${location}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data.coordinates;
      }
    }

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: location,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        timeout: 5000
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coordinates = [parseFloat(result.lat), parseFloat(result.lon)];
      
      localStorage.setItem(`geocode_${location}`, JSON.stringify({
        coordinates,
        timestamp: Date.now()
      }));
      
      return coordinates;
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding failed for ${location}:`, error);
    return null;
  }
};

const geocodeMultipleLocations = async (locations) => {
  const results = {};
  const uniqueLocations = [...new Set(locations)];
  
  for (const location of uniqueLocations) {
    if (location) {
      try {
        const coordinates = await geocodeLocation(location);
        if (coordinates) {
          results[location] = coordinates;
        } else {
          const fallbackCoords = getFallbackCoordinates(location);
          if (fallbackCoords) {
            results[location] = fallbackCoords;
          }
        }
      } catch (error) {
        console.error(`Error geocoding ${location}:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

const getFallbackCoordinates = (location) => {
  const commonCities = {
    'tbilisi': [41.7151, 44.8271],
    'new york': [40.7128, -74.0060],
    'london': [51.5074, -0.1278],
    'san francisco': [37.7749, -122.4194],
    'berlin': [52.5200, 13.4050],
    'tokyo': [35.6762, 139.6503],
    'sydney': [-33.8688, 151.2093],
    'toronto': [43.6532, -79.3832],
    'paris': [48.8566, 2.3522],
    'mumbai': [19.0760, 72.8777],
    'dublin': [53.3498, -6.2603],
    'amsterdam': [52.3676, 4.9041],
    'barcelona': [41.3851, 2.1734],
    'prague': [50.0755, 14.4378],
    'budapest': [47.4979, 19.0402],
    'warsaw': [52.2297, 21.0122],
    'vienna': [48.2082, 16.3738],
    'athens': [37.9838, 23.7275],
    'rome': [41.9028, 12.4964],
    'madrid': [40.4168, -3.7038],
    'monrovia': [6.3008, -10.7972],
    'kabul': [34.5553, 69.2075],
    'valletta': [35.8997, 14.5147],
  };

  const normalizedLocation = location.toLowerCase().trim();
  
  if (commonCities[normalizedLocation]) {
    return commonCities[normalizedLocation];
  }
  
  for (const [city, coords] of Object.entries(commonCities)) {
    if (normalizedLocation.includes(city) || city.includes(normalizedLocation)) {
      return coords;
    }
  }
  
  return null;
};

const JobSearch = () => {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(2.5);
  const [recommendations, setRecommendations] = useState([]);
  const [bestOverall, setBestOverall] = useState(null);
  const [locationRecommendations, setLocationRecommendations] = useState([]);
  const [salaryExpectations, setSalaryExpectations] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapMarkers, setMapMarkers] = useState([]);

  useEffect(() => {
    const loadSkillSuggestions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/skills/suggestions");
        if (res.data && res.data.suggestions) {
          setSkillSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.error("Failed to load skill suggestions:", err);
      }
    };
    loadSkillSuggestions();
  }, []);

  useEffect(() => {
    const processGeocoding = async () => {
      if (recommendations.length === 0) {
        setMapMarkers([]);
        return;
      }

      setGeocoding(true);
      
      try {
        const locations = recommendations
          .map(job => job.common_location)
          .filter(location => location && typeof location === 'string');
        
        const geocodedResults = await geocodeMultipleLocations(locations);
        
        const markers = recommendations
          .map(job => {
            if (!job.common_location) return null;
            
            const coordinates = geocodedResults[job.common_location];
            if (!coordinates) return null;
            
            return {
              position: coordinates,
              job: job,
              popupText: `
                <div class="map-popup">
                  <h4>${job.job_title}</h4>
                  <p><strong>Location:</strong> ${job.common_location}</p>
                  <p><strong>Salary:</strong> ${job.salary_range}</p>
                  <p><strong>Match:</strong> ${(job.combined_score * 100).toFixed(0)}%</p>
                </div>
              `
            };
          })
          .filter(marker => marker !== null);

        setMapMarkers(markers);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setGeocoding(false);
      }
    };

    processGeocoding();
  }, [recommendations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.trim()) {
      setError("Please enter at least one skill");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setBestOverall(null);
    setLocationRecommendations([]);
    setSalaryExpectations(null);
    setUserProfile(null);
    setMapMarkers([]);

    try {
      const skillList = skills.split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(skill => skill.toLowerCase());

      const res = await axios.post("http://localhost:5000/api/recommend", {
        skills: skillList,
        experience_level: Number(experience),
        top_jobs: 15,
        top_locations: 8
      }, { timeout: 15000 });

      if (res.data && res.data.success) {
        setRecommendations(res.data.job_recommendations || []);
        setBestOverall(res.data.best_overall || null);
        setLocationRecommendations(res.data.location_recommendations || []);
        setSalaryExpectations(res.data.salary_expectations || null);
        setUserProfile(res.data.user_profile || null);
        
        if (!res.data.job_recommendations || res.data.job_recommendations.length === 0) {
          setError("No job matches found for your skills. Try different skills or broaden your search.");
        }
      } else {
        setError(res.data?.error || "No recommendations returned");
      }
    } catch (err) {
      console.error("API Error:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout - please try again");
      } else if (err.response?.status === 500) {
        setError("Server error - please try again later");
      } else {
        setError(err.response?.data?.error || err.message || "Error fetching recommendations");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill) => {
    const currentSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
    if (!currentSkills.includes(skill)) {
      currentSkills.push(skill);
      setSkills(currentSkills.join(", "));
    }
    setShowSuggestions(false);
  };

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

  const calculateMapCenter = () => {
    if (mapMarkers.length === 0) return [20, 0];
    
    const latitudes = mapMarkers.map(marker => marker.position[0]);
    const longitudes = mapMarkers.map(marker => marker.position[1]);
    
    const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
    
    return [centerLat, centerLng];
  };

  const mapCenter = calculateMapCenter();

  return (
    <div className="job-search">
      <div className="container">
        {/* Header */}
        <header className="search-header">
          <div className="header-content">
            <h1><FaSearch className="header-icon" /> Job Recommendations</h1>
            <p>Discover job opportunities that match your skills and experience level</p>
          </div>
        </header>

        {/* Search Form */}
        <section className="search-section">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Your Skills</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Python, JavaScript, React, AWS, SQL..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && skillSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      <div className="dropdown-title">
                        <FaLightbulb className="dropdown-icon" />
                        Popular Skills
                      </div>
                      {skillSuggestions.slice(0, 8).map((skill, index) => (
                        <button
                          key={index}
                          type="button"
                          className="suggestion-item"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label>
                  Experience: <span className="experience-value">{experience} years</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="experience-slider"
                />
                <div className="slider-labels">
                  <span>0.5</span>
                  <span>5</span>
                  <span>10+</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !skills.trim()}
                className="search-btn"
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FaRocket className="btn-icon" />
                    Find Jobs
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <FaCog className="error-icon" />
              {error}
            </div>
          </div>
        )}

        {/* Geocoding Loader */}
        {geocoding && (
          <div className="info-banner">
            <div className="info-content">
              <FaGlobeAmericas className="info-icon" />
              Loading map locations...
            </div>
          </div>
        )}

        {/* Best Match */}
        {bestOverall && (
          <section className="highlight-section">
            <div className="section-header">
              <h2>Best Match</h2>
              <div className="highlight-badge">
                <FaAward className="badge-icon" />
                Recommended
              </div>
            </div>
            <div className="best-match-card">
              <div className="match-content">
                <div className="match-header">
                  <h3>{bestOverall.job}</h3>
                  <div 
                    className="confidence-score"
                    style={{ backgroundColor: getConfidenceColor(bestOverall.confidence) }}
                  >
                    <FaStar className="score-icon" />
                    {Math.round(bestOverall.confidence * 100)}% match
                  </div>
                </div>
                <div className="match-details">
                  <div className="detail">
                    <span className="detail-label">
                      <FaMapMarkerAlt className="detail-icon" />
                      Location
                    </span>
                    <span className="detail-value">{bestOverall.location}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">
                      <FaMoneyBillWave className="detail-icon" />
                      Expected Salary
                    </span>
                    <span 
                      className="detail-value salary"
                      style={{ color: getSalaryColor(bestOverall.expected_salary) }}
                    >
                      ${bestOverall.expected_salary?.toLocaleString()}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">
                      <FaChartBar className="detail-icon" />
                      Salary Range
                    </span>
                    <span className="detail-value">{bestOverall.salary_range}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Salary Expectations */}
        {salaryExpectations && (
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="stat-content">
                  <div className="stat-value">${salaryExpectations.average_expected?.toLocaleString()}</div>
                  <div className="stat-label">Average Expected Salary</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaChartBar />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{salaryExpectations.confidence}</div>
                  <div className="stat-label">Confidence Level</div>
                </div>
              </div>
              {userProfile && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUserTie />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{userProfile.skills_matched}</div>
                    <div className="stat-label">Skills Matched</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Results Grid */}
        {(recommendations.length > 0 || locationRecommendations.length > 0) && (
          <section className="results-section">
            <div className="results-grid">
              {/* Job Listings */}
              <div className="results-column">
                <div className="column-header">
                  <h2><FaBriefcase className="column-icon" /> Job Matches</h2>
                  <span className="results-count">{recommendations.length} positions</span>
                </div>
                <div className="jobs-list">
                  {recommendations.map((job, i) => (
                    <div key={i} className="job-card">
                      <div className="job-card-header">
                        <h4>{job.job_title}</h4>
                        <div 
                          className="match-indicator"
                          style={{ backgroundColor: getConfidenceColor(job.combined_score) }}
                        >
                          {Math.round(job.combined_score * 100)}%
                        </div>
                      </div>
                      <div className="job-card-body">
                        <div className="job-meta">
                          <div className="meta-item">
                            <FaMapMarkerAlt className="meta-icon" />
                            {job.common_location}
                          </div>
                          <div className="meta-item">
                            <FaDollarSign className="meta-icon" />
                            <span style={{ color: getSalaryColor(job.salary_midpoint) }}>
                              {job.salary_range}
                            </span>
                          </div>
                          <div className="meta-item">
                            <FaChartBar className="meta-icon" />
                            {job.salary_confidence} confidence
                          </div>
                          {job.sample_size && (
                            <div className="meta-item">
                              <FaChartLine className="meta-icon" />
                              {job.sample_size} data points
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map & Locations */}
              <div className="results-column">
                <div className="column-header">
                  <h2><FaGlobeAmericas className="column-icon" /> Locations</h2>
                  <span className="results-count">{mapMarkers.length} mapped</span>
                </div>
                
                <div className="map-card">
                  <div className="map-container">
                    <MapContainer 
                      center={mapCenter} 
                      zoom={mapMarkers.length > 0 ? 3 : 1} 
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {mapMarkers.map((marker, index) => (
                        <Marker 
                          key={index} 
                          position={marker.position}
                          icon={createCustomIcon()}
                        >
                          <Popup>
                            <div dangerouslySetInnerHTML={{ __html: marker.popupText }} />
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>

                {locationRecommendations.length > 0 && (
                  <div className="locations-card">
                    <h3><FaList className="location-icon" /> Top Locations</h3>
                    <div className="locations-list">
                      {locationRecommendations.slice(0, 6).map((loc, i) => (
                        <div key={i} className="location-item">
                          <span className="location-name">{loc.location}</span>
                          <span className="location-demand">
                            {Math.round(loc.demand_score * 100)}% demand
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <section className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">
                <FaSearch />
              </div>
              <h3>Ready to find your next opportunity?</h3>
              <p>Enter your skills above to discover job matches tailored to your experience</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default JobSearch;