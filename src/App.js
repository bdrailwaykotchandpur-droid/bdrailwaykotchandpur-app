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
import BottomTabs from './components/BottomTabs';
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/active`);
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

  useEffect(() => {
    const svgIcon = `data:image/svg+xml,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
<path fill='%23f14f29' transform='translate(6,3)'
d='M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z'/>
</svg>`;
    
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';
    link.href = svgIcon;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

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
        
        <BottomTabs />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
