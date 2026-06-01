import React, { useState, useEffect } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

// Your train icon (same as favicon)
const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
  <path fill="#f14f29" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

// Source station icon (using circle with dot)
const sourceIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
  <circle cx="12" cy="12" r="8" fill="#28a745" stroke="none"/>
  <circle cx="12" cy="12" r="3" fill="white" stroke="none"/>
</svg>`;

// Destination station icon (using square with flag shape - simple)
const destinationIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
  <rect x="4" y="4" width="4" height="16" fill="#dc3545" rx="1"/>
  <polygon points="8,4 18,8 8,12" fill="#dc3545"/>
</svg>`;

// Intermediate station icon (simple dot)
const intermediateIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
  <circle cx="12" cy="12" r="4" fill="#6c757d" stroke="none"/>
</svg>`;

const TrainRouteMap = ({ trainId, trainNumber, onStationClick }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (trainId || trainNumber) {
      fetchRoute();
    }
  }, [trainId, trainNumber]);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes/${trainId || trainNumber}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      const data = await response.json();
      if (data.success) {
        setRoute(data.data);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="route-loading">রুট লোড হচ্ছে...</div>;
  }

  if (!route || !route.stations || route.stations.length === 0) {
    return null;
  }

  const getStationStatusClass = (station) => {
    if (station.isCurrentLocation) return 'station-current';
    if (station.type === 'source') return 'station-source';
    if (station.type === 'destination') return 'station-destination';
    return 'station-intermediate';
  };

  const getStationIcon = (station) => {
    if (station.isCurrentLocation) {
      return trainIconSVG;
    }
    if (station.type === 'source') {
      return sourceIconSVG;
    }
    if (station.type === 'destination') {
      return destinationIconSVG;
    }
    return intermediateIconSVG;
  };

  const displayedStations = expanded ? route.stations : route.stations.slice(0, 5);

  return (
    <div className="train-route-map">
      <div className="route-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <span className="route-title">
          <span dangerouslySetInnerHTML={{ __html: trainIconSVG }} />
          {' '}সম্পূর্ণ রুট: {route.source} → {route.destination}
        </span>
        <span className="route-toggle">{expanded ? '▲' : '▼'}</span>
        <span className="route-stats">({toBengaliDigits(route.totalStations)} টি স্টেশন)</span>
      </div>
      
      {expanded && (
        <div className="route-stations">
          {displayedStations.map((station, index) => (
            <div 
              key={index}
              className={`route-station-item ${getStationStatusClass(station)}`}
              onClick={() => onStationClick && onStationClick(station)}
              style={{ cursor: onStationClick ? 'pointer' : 'default' }}
            >
              <div className="station-marker">
                <div 
                  className="station-icon"
                  dangerouslySetInnerHTML={{ __html: getStationIcon(station) }}
                />
                {index < displayedStations.length - 1 && <div className="station-line"></div>}
              </div>
              <div className="station-info">
                <div className="station-name">
                  {station.nameBengali || station.name}
                  {station.isCurrentLocation && <span className="current-badge">বর্তমান অবস্থান</span>}
                </div>
                {station.arrivalTime && (
                  <div className="station-time">আগমন: {station.arrivalTime}</div>
                )}
                {station.departureTime && (
                  <div className="station-time">প্রস্থান: {station.departureTime}</div>
                )}
                {station.distanceFromSource > 0 && (
                  <div className="station-distance">দূরত্ব: {toBengaliDigits(station.distanceFromSource)} কিমি</div>
                )}
              </div>
            </div>
          ))}
          
          {!expanded && route.stations.length > 5 && (
            <div className="route-expand-hint">ক্লিক করুন পুরো রুট দেখতে...</div>
          )}
        </div>
      )}
      
      <style jsx="true">{`
        .train-route-map {
          background: #f8f9fa;
          border-radius: 12px;
          margin: 15px 0;
          overflow: hidden;
          border: 1px solid #e9ecef;
        }
        
        .route-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
        }
        
        .route-title {
          flex: 1;
          color: #f14f29;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .route-title svg {
          width: 18px;
          height: 18px;
        }
        
        .route-toggle {
          color: #6c757d;
          font-size: 0.8rem;
        }
        
        .route-stats {
          color: #6c757d;
          font-size: 0.7rem;
        }
        
        .route-stations {
          padding: 10px 0;
        }
        
        .route-station-item {
          display: flex;
          padding: 10px 15px;
          transition: background 0.2s;
          position: relative;
        }
        
        .route-station-item:hover {
          background: #fff5f0;
        }
        
        .station-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 30px;
          margin-right: 15px;
          position: relative;
        }
        
        .station-icon {
          z-index: 2;
          background: #f8f9fa;
          border-radius: 50%;
          padding: 2px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .station-icon svg {
          width: 16px;
          height: 16px;
        }
        
        .station-line {
          width: 2px;
          height: 30px;
          background: #dee2e6;
          margin: 2px 0;
        }
        
        .route-station-item:last-child .station-line {
          display: none;
        }
        
        .station-info {
          flex: 1;
        }
        
        .station-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #212529;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .current-badge {
          background: #f14f29;
          color: white;
          font-size: 0.6rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: normal;
        }
        
        .station-time, .station-distance {
          font-size: 0.7rem;
          color: #6c757d;
          margin-top: 2px;
        }
        
        .route-station-item.station-current .station-name {
          color: #f14f29;
        }
        
        .route-station-item.station-current .station-icon {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .route-expand-hint {
          text-align: center;
          padding: 10px;
          color: #6c757d;
          font-size: 0.7rem;
          border-top: 1px solid #e9ecef;
        }
        
        @media (max-width: 768px) {
          .route-header {
            padding: 10px 12px;
          }
          .route-title {
            font-size: 0.8rem;
          }
          .station-name {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TrainRouteMap;