// Format experience level for display
export const formatExperience = (experience) => {
  if (!experience) return 'Not specified';
  
  const levels = {
    'entry': 'Entry Level',
    'mid': 'Mid Level', 
    'senior': 'Senior Level',
    'junior': 'Junior Level',
    'lead': 'Lead Level'
  };
  
  return levels[experience.toLowerCase()] || experience;
};

// Format location for display
export const formatLocation = (location, country) => {
  if (location && country) {
    return `${location}, ${country}`;
  }
  return location || country || 'Location not specified';
};

// Debounce function for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Calculate match percentage color
export const getMatchColor = (score) => {
  if (score >= 0.8) return '#10b981'; // green
  if (score >= 0.6) return '#f59e0b'; // yellow
  if (score >= 0.4) return '#ef4444'; // red
  return '#6b7280'; // gray
};