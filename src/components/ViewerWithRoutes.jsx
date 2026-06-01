// This is an ADDITIONAL component - does NOT replace existing Viewer.js
// Import this in App.js alongside existing Viewer

import React, { useState, useEffect } from 'react';
import { trainsAPI } from '../services/api';
import { toBengaliDigits, formatToBengaliTime, formatToBengaliDate } from '../utils/banglaTimeFormatter';
import TrainRouteMap from './TrainRouteMap';

// Your train icon (same as favicon)
const trainIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path 
      fill="#f14f29" 
      transform="translate(6,3)"
      d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
    />
  </svg>
);

const ViewerWithRoutes = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedTrainRoute, setSelectedTrainRoute] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTrains();
    // Update date every minute
    const interval = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainsAPI.getAll();
      setTrains(data.trains || []);
    } catch (error) {
      console.error('Trains fetch error:', error);
      setError('ট্রেনের তথ্য লোড করতে সমস্যা হয়েছে');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrains = trains.filter(train => {
    if (filter === 'all') return true;
    return train.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'status-on-time';
      case 'delayed': return 'status-delayed';
      case 'cancelled': return 'status-cancelled';
      case 'early': return 'status-early';
      default: return 'status-unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on-time': return 'সময়মতো';
      case 'delayed': return 'বিলম্বিত';
      case 'cancelled': return 'বাতিল';
      case 'early': return 'জলদি';
      default: return 'অজানা';
    }
  };

  const handleTrainClick = (train) => {
    setSelectedTrainRoute(selectedTrainRoute === train._id ? null : train._id);
  };

  // Format current date in Bengali
  const formattedDate = formatToBengaliDate(currentDate);
  const formattedTime = formatToBengaliTime(currentDate.toLocaleTimeString());

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-animation"></div>
        <p>ট্রেনের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchTrains} className="retry-btn">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="viewer-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {trainIcon}
          <h1 style={{ margin: 0 }}>ট্রেন সময়সূচী</h1>
          {trainIcon}
        </div>
        <p>কোটচাঁদপুর রেলওয়ে স্টেশন - সমস্ত ট্রেনের সময়সূচী</p>
        
        {/* Bengali Date and Time Display */}
        <div className="datetime-bengali" style={{
          background: '#f14f29',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '30px',
          display: 'inline-block',
          margin: '10px 0',
          fontSize: '0.9rem'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            {trainIcon}
            {formattedTime}
          </span>
          {' | '}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            📅 {formattedDate}
          </span>
        </div>
        
        <button onClick={fetchTrains} className="refresh-btn" disabled={loading}>
          {loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
        </button>
      </div>

      <div className="schedule-container">
        <div className="schedule-info-bar">
          <div className="schedule-stats">
            <div className="stat-item">
              <span className="stat-value">{toBengaliDigits(trains.length)}</span>
              <span className="stat-label">মোট ট্রেন</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{toBengaliDigits(trains.filter(t => t.status === 'on-time').length)}</span>
              <span className="stat-label">সময়মতো</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{toBengaliDigits(trains.filter(t => t.status === 'delayed').length)}</span>
              <span className="stat-label">বিলম্বিত</span>
            </div>
          </div>

          <div className="filter-buttons">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              সব
            </button>
            <button className={`filter-btn ${filter === 'on-time' ? 'active' : ''}`} onClick={() => setFilter('on-time')}>
              সময়মতো
            </button>
            <button className={`filter-btn ${filter === 'delayed' ? 'active' : ''}`} onClick={() => setFilter('delayed')}>
              বিলম্বিত
            </button>
            <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
              বাতিল
            </button>
          </div>
        </div>

        <div className="schedule-table-container">
          {filteredTrains.length > 0 ? (
            <div className="schedule-grid">
              <div className="schedule-header-row">
                <div className="col">ট্রেন নাম</div>
                <div className="col">ট্রেন নং</div>
                <div className="col">উৎস</div>
                <div className="col">গন্তব্য</div>
                <div className="col">প্রস্থান</div>
                <div className="col">আগমন</div>
                <div className="col">বর্তমান অবস্থান</div>
                <div className="col">পরবর্তী গন্তব্য</div>
                <div className="col">স্ট্যাটাস</div>
              </div>
              <div className="schedule-body">
                {filteredTrains.map((train) => (
                  <React.Fragment key={train._id}>
                    <div 
                      className={`schedule-row ${selectedTrainRoute === train._id ? 'expanded' : ''}`}
                      onClick={() => handleTrainClick(train)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="col" data-label="নাম">
                        <strong>{train.name}</strong>
                      </div>
                      <div className="col" data-label="নং">{toBengaliDigits(train.number)}</div>
                      <div className="col" data-label="উৎস">{train.from}</div>
                      <div className="col" data-label="গন্তব্য">{train.to}</div>
                      <div className="col" data-label="প্রস্থান">
                        <span className="time-badge">{formatToBengaliTime(train.departure)}</span>
                      </div>
                      <div className="col" data-label="আগমন">
                        <span className="time-badge">{formatToBengaliTime(train.arrival)}</span>
                      </div>
                      <div className="col" data-label="বর্তমান অবস্থান">
                        {train.currentLocation || '—'}
                      </div>
                      <div className="col" data-label="পরবর্তী গন্তব্য">
                        {train.nextStation || '—'}
                      </div>
                      <div className="col" data-label="স্ট্যাটাস">
                        <span className={`status-badge ${getStatusColor(train.status)}`}>
                          {getStatusText(train.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded route section */}
                    {selectedTrainRoute === train._id && (
                      <div className="schedule-route-expanded">
                        <TrainRouteMap 
                          trainId={train._id}
                          trainNumber={train.number}
                          onStationClick={(station) => {
                            console.log('Station clicked:', station);
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-trains-message">
              <p>এই ফিল্টারে কোন ট্রেন পাওয়া যায়নি</p>
              <button onClick={() => setFilter('all')} className="show-all-btn">
                সব ট্রেন দেখুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerWithRoutes;
