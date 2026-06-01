import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import FeatureAwareNavigation from './components/FeatureAwareNavigation';
import ViewerWithCitySearch from './components/ViewerWithCitySearch';
import News from './components/News';
import Ticket from './components/Ticket';
import LocationEngine from './components/LocationEngine';
import Submission from './components/Submission';
import Shopping from './components/Shopping';
import Admin from './components/Admin';
import Login from './components/Login';
import LocationSubmit from './components/LocationSubmit';
import Donate from './components/Donate';
import About from './components/About';
import ScrollToTop from './components/ScrollToTop';
import NoticePopup from './components/NoticePopup';
import './App.css';

function App() {
  const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [activeNotices, setActiveNotices] = useState([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  const fetchActiveNotices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/active`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setActiveNotices(data.data);
        setCurrentNoticeIndex(0);
      }
    } catch (error) {
      console.error('Error fetching active notices:', error);
    }
  };
  useEffect(() => {
    fetchActiveNotices();
  }, []);

  const closeCurrentNotice = () => {
    if (currentNoticeIndex + 1 < activeNotices.length) {
      setCurrentNoticeIndex(currentNoticeIndex + 1);
    } else {
      setCurrentNoticeIndex(-1);
    }
  };

  return (
    <Router>
      <div className="App">
        <LocationEngine />
        {activeNotices.length > 0 && currentNoticeIndex >= 0 && currentNoticeIndex < activeNotices.length && (
          <NoticePopup 
            notice={activeNotices[currentNoticeIndex]} 
            onClose={closeCurrentNotice}
          />
        )}
        
        <Header />
        <FeatureAwareNavigation />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ViewerWithCitySearch />} />
            <Route path="/location-submit" element={<LocationSubmit />} />
            <Route path="/news" element={<News />} />
            <Route path="/ticket" element={<Ticket />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/about" element={<About />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route 
              path="/admin" 
              element={
                (isAdmin || (isLoggedIn && user?.role === 'admin')) 
                ? <Admin /> 
                : <Navigate to="/login" replace />
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<ViewerWithCitySearch />} />
          </Routes>
        </main>
        
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
