import React, { useState, useEffect } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

const LocationEngine = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);
  const [matchedTrains, setMatchedTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Haversine formula to calculate distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
  };

  useEffect(() => {
    // Only prompt once per session
    const hasPrompted = sessionStorage.getItem('locationEnginePrompted');
    if (hasPrompted) return;

    // Determine timeout based on current page
    const currentPath = window.location.pathname;
    let delay = 5000;
    
    if (currentPath.includes('/news')) {
      // Show much later for news readers (random 20-30 seconds)
      delay = Math.floor(Math.random() * 10000) + 20000;
    } else if (currentPath === '/' || currentPath.includes('/train')) {
      // Show faster for train schedule viewers (random 3-6 seconds)
      delay = Math.floor(Math.random() * 3000) + 3000;
    } else {
      // Standard delay for other pages (random 10-15 seconds)
      delay = Math.floor(Math.random() * 5000) + 10000;
    }

    const timer = setTimeout(() => {
      initiateLocationEngine();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const initiateLocationEngine = () => {
    sessionStorage.setItem('locationEnginePrompted', 'true');
    
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
      return;
    }

    // Attempt to get location invisibly first, but browser will prompt if not previously granted
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePositionReceived(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.log('Location permission denied or error:', error.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePositionReceived = async (lat, lng) => {
    setUserLocation({ lat, lng });
    try {
      // 1. Fetch stations
      const stationsRes = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/stations`);
      const stationsData = await stationsRes.json();
      
      if (!stationsData.success || !stationsData.data || stationsData.data.length === 0) return;
      
      const stations = stationsData.data;
      
      // 2. Find nearest station (within 10km)
      let closest = null;
      let minDistance = 10; // Max 10km radius
      
      stations.forEach(station => {
        if (station.latitude && station.longitude) {
          const dist = getDistance(lat, lng, station.latitude, station.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closest = station;
          }
        }
      });
      
      if (!closest) return; // No station nearby
      setNearestStation(closest);
      
      // 3. Fetch trains and find matches
      const trainsRes = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains`);
      const trainsData = await trainsRes.json();
      
      if (!trainsData.success || !trainsData.data) return;
      
      const trains = trainsData.data.filter(t => t.isActive !== false);
      
      // Filter trains that likely pass through or originate/terminate here
      const matches = trains.filter(t => {
        const fromMatch = t.from.toLowerCase().includes(closest.nameBengali.toLowerCase()) || t.from.toLowerCase().includes(closest.name.toLowerCase());
        const toMatch = t.to.toLowerCase().includes(closest.nameBengali.toLowerCase()) || t.to.toLowerCase().includes(closest.name.toLowerCase());
        
        let intermediateMatch = false;
        if (t.intermediateStations && t.intermediateStations.length > 0) {
          intermediateMatch = t.intermediateStations.some(s => 
            s.stationNameBengali.toLowerCase().includes(closest.nameBengali.toLowerCase()) || 
            s.stationName.toLowerCase().includes(closest.name.toLowerCase())
          );
        }
        
        return fromMatch || toMatch || intermediateMatch;
      });
      
      if (matches.length > 0) {
        setMatchedTrains(matches);
        setShowPrompt(true); // Show the popup
      }
      
    } catch (error) {
      console.error('Location engine error:', error);
    }
  };

  const handleSubmitLiveTracking = async () => {
    if (!selectedTrain || !userLocation) return;
    
    setLoading(true);
    setStatusMsg('');
    
    try {
      const train = matchedTrains.find(t => t._id === selectedTrain);
      
      const payload = {
        trainId: train._id,
        trainNumber: train.number,
        trainName: train.name,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        reporterName: 'Live Tracker Engine',
        reporterContact: 'Auto'
      };
      
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/locations/submit-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatusMsg('লাইভ ট্র্যাকিং আপডেট সফল হয়েছে! ধন্যবাদ।');
        setTimeout(() => setShowPrompt(false), 2500);
      } else {
        setStatusMsg(data.message || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (error) {
      setStatusMsg('একটি ত্রুটি ঘটেছে');
    } finally {
      setLoading(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="location-engine-overlay">
      <div className="location-engine-modal">
        <button className="location-engine-close" onClick={() => setShowPrompt(false)}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="location-engine-header">
          <div className="location-engine-icon">
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <h3>লাইভ ট্র্যাকিং</h3>
        </div>
        
        <div className="location-engine-body">
          <p>আপনাকে <strong>{nearestStation?.nameBengali} ({nearestStation?.name})</strong> স্টেশনের কাছাকাছি পাওয়া গেছে।</p>
          <p>আপনি কি নিচের কোন ট্রেনে ভ্রমণ করছেন? যদি হ্যাঁ, তবে নির্বাচন করুন যাতে অন্য যাত্রীরা ট্রেনের সঠিক অবস্থান জানতে পারে।</p>
          
          <select 
            className="location-engine-select"
            value={selectedTrain}
            onChange={(e) => setSelectedTrain(e.target.value)}
          >
            <option value="">-- ট্রেন নির্বাচন করুন --</option>
            {matchedTrains.map(t => (
              <option key={t._id} value={t._id}>
                {t.name} ({toBengaliDigits(t.number)}) - {t.from} থেকে {t.to}
              </option>
            ))}
          </select>
          
          {statusMsg && <div className={`location-engine-status ${statusMsg.includes('সফল') ? 'success' : 'error'}`}>{statusMsg}</div>}
          
          <div className="location-engine-actions">
            <button 
              className="location-engine-btn primary" 
              onClick={handleSubmitLiveTracking}
              disabled={!selectedTrain || loading}
            >
              {loading ? 'আপডেট হচ্ছে...' : 'লাইভ লোকেশন শেয়ার করুন'}
            </button>
            <button className="location-engine-btn secondary" onClick={() => setShowPrompt(false)}>
              আমি ট্রেনে নেই
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationEngine;
