import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toBengaliDigits, formatToBengaliDate } from '../utils/banglaTimeFormatter';

const Header = () => {
  const [logoError, setLogoError] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const getBDTimeString = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      let period = '';
      if (hours >= 5 && hours < 12) period = 'সকাল';
      else if (hours >= 12 && hours < 15) period = 'দুপুর';
      else if (hours >= 15 && hours < 18) period = 'বিকাল';
      else if (hours >= 18 && hours < 20) period = 'সন্ধ্যা';
      else period = 'রাত';
      const display = hours % 12 || 12;
      return `${toBengaliDigits(display)}:${toBengaliDigits(minutes.toString().padStart(2, '0'))} ${period}`;
    };
    const getBDDateString = () => formatToBengaliDate(new Date());
    setTime(getBDTimeString());
    setDate(getBDDateString());
    const interval = setInterval(() => {
      setTime(getBDTimeString());
      setDate(getBDDateString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-container" style={{ position: 'relative' }}>
      <div className="header-background">
        
        {/* Cute Live Clock at Top Left */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '30px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{time}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>{date}</span>
          </div>
        </div>

        <div className="header-overlay">
          <div className="header-content">
            <div className="logo-container">
              <div className="logo">
                {!logoError ? (
                  <img 
                    src="/images/train.svg"
                    alt="Bangladesh Railway Logo"
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span style={{ fontSize: '28px', fontWeight: 'bold' }}>BR</span>
                )}
              </div>
            </div>
            <div className="header-text">
              <h1 className="header-title">বাংলাদেশ রেলওয়ে</h1>
              <p className="header-subtitle">Bangladesh Railway</p>
              <p className="header-tagline">Kotchandpur - Always with you</p>
            </div>
          </div>
        </div>
        
        <div className="header-auth-buttons">
          {isAdmin && (
             <Link to="/admin" className="auth-btn admin-btn">
               এডমিন
             </Link>
          )}
          
          {!isAdmin && !isLoggedIn && (
            <Link to="/login" className="auth-btn login-btn">
              লগইন
            </Link>
          )}
          {(isAdmin || isLoggedIn) && (
            <button 
              className="auth-btn logout-btn"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
            >
              লগআউট
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;