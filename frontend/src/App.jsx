import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobRecommendations from './pages/JobRecommendations';
import './styles/App.css';

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/search" 
              element={
                <JobSearch 
                  setRecommendations={setRecommendations}
                  setLoading={setLoading}
                />
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <JobRecommendations 
                  recommendations={recommendations}
                  loading={loading}
                />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;