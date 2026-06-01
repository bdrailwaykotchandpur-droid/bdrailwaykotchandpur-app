import React, { useState, useEffect, useRef } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

const LocationEngine = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);
  const [matchedTrains, setMatchedTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStats, setBroadcastStats] = useState(null);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
  };

  useEffect(() => {
    const hasPrompted = sessionStorage.getItem('locationEnginePrompted');
    if (hasPrompted) return;

    const currentPath = window.location.pathname;
    let delay = 5000;
    
    if (currentPath.includes('/news')) delay = Math.floor(Math.random() * 10000) + 20000;
    else if (currentPath === '/' || currentPath.includes('/train')) delay = Math.floor(Math.random() * 3000) + 3000;
    else delay = Math.floor(Math.random() * 5000) + 10000;

    const timer = setTimeout(() => {
      initiateLocationEngine();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const initiateLocationEngine = () => {
    sessionStorage.setItem('locationEnginePrompted', 'true');
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => handlePositionReceived(position.coords.latitude, position.coords.longitude),
      (error) => console.log('Location error:', error.message),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePositionReceived = async (lat, lng) => {
    setUserLocation({ lat, lng });
    try {
      const stationsRes = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/stations`);
      const stationsData = await stationsRes.json();
      if (!stationsData.success || !stationsData.data) return;
      
      let closest = null;
      let minDistance = 10;
      
      stationsData.data.forEach(station => {
        if (station.latitude && station.longitude) {
          const dist = getDistance(lat, lng, station.latitude, station.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closest = station;
          }
        }
      });
      
      if (!closest) return;
      setNearestStation(closest);
      
      const trainsRes = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains`);
      const trainsData = await trainsRes.json();
      if (!trainsData.success || !trainsData.data) return;
      
      const trains = trainsData.data.filter(t => t.isActive !== false);
      const matches = trains.filter(t => {
        const fromMatch = t.from.toLowerCase().includes(closest.nameBengali.toLowerCase()) || t.from.toLowerCase().includes(closest.name.toLowerCase());
        const toMatch = t.to.toLowerCase().includes(closest.nameBengali.toLowerCase()) || t.to.toLowerCase().includes(closest.name.toLowerCase());
        let intermediateMatch = false;
        if (t.intermediateStations) {
          intermediateMatch = t.intermediateStations.some(s => 
            s.stationNameBengali.toLowerCase().includes(closest.nameBengali.toLowerCase()) || 
            s.stationName.toLowerCase().includes(closest.name.toLowerCase())
          );
        }
        return fromMatch || toMatch || intermediateMatch;
      });
      
      if (matches.length > 0) {
        setMatchedTrains(matches);
        setShowPrompt(true);
      }
    } catch (error) {
      console.error('Location engine error:', error);
    }
  };

  const sendPing = async (lat, lng, speed, trainId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/locations/live-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainId: trainId,
          lat,
          lng,
          speed: speed || 0,
          reporterName: 'Live Tracker Broadcast'
        })
      });
    } catch (err) {
      console.error('Ping failed', err);
    }
  };

  const startBroadcasting = () => {
    if (!selectedTrain) return;
    setLoading(true);
    setStatusMsg('লাইভ ব্রডকাস্ট শুরু হচ্ছে...');

    if (navigator.geolocation) {
      setIsBroadcasting(true);
      setShowPrompt(false);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const time = position.timestamp;
          let speed = position.coords.speed !== null ? position.coords.speed * 3.6 : 0; // m/s to km/h

          if (!speed && lastPositionRef.current) {
            // Calculate manual speed if device doesn't provide it
            const dist = getDistance(lastPositionRef.current.lat, lastPositionRef.current.lng, lat, lng);
            const timeDiff = (time - lastPositionRef.current.time) / 3600000; // hours
            if (timeDiff > 0) {
              speed = dist / timeDiff;
            }
          }

          if (speed > 160) speed = 0; // Filter gps anomalies

          lastPositionRef.current = { lat, lng, time };
          setBroadcastStats({ speed: speed.toFixed(1) });
          sendPing(lat, lng, speed, selectedTrain);
        },
        (error) => {
          console.error('Watch error:', error);
          setStatusMsg('লোকেশন পেতে সমস্যা হচ্ছে।');
          stopBroadcasting();
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }
  };

  const stopBroadcasting = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsBroadcasting(false);
    setBroadcastStats(null);
  };

  if (isBroadcasting) {
    return (
      <div style={{ position: 'fixed', bottom: '80px', right: '20px', background: '#dc3545', color: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }}></span>
          <strong>লাইভ ব্রডকাস্ট চলছে</strong>
        </div>
        {broadcastStats && (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            গতি: {toBengaliDigits(broadcastStats.speed)} কি.মি./ঘণ্টা
          </div>
        )}
        <button onClick={stopBroadcasting} style={{ background: 'white', color: '#dc3545', border: 'none', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>বন্ধ করুন</button>
      </div>
    );
  }

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
          <h3>লাইভ লোকেশন শেয়ারিং</h3>
        </div>
        
        <div className="location-engine-body">
          <p>আপনাকে <strong>{nearestStation?.nameBengali} ({nearestStation?.name})</strong> স্টেশনের কাছাকাছি পাওয়া গেছে।</p>
          <p>আপনি কি নিচের কোন ট্রেনে ভ্রমণ করছেন? ট্রেন সিলেক্ট করে লাইভ ব্রডকাস্ট শুরু করুন, অন্য যাত্রীরা ট্রেনের রিয়েল-টাইম স্পিড এবং অবস্থান দেখতে পাবে।</p>
          
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
          
          {statusMsg && <div className={`location-engine-status error`}>{statusMsg}</div>}
          
          <div className="location-engine-actions">
            <button 
              className="location-engine-btn primary" 
              onClick={startBroadcasting}
              disabled={!selectedTrain || loading}
            >
              {loading ? 'শুরু হচ্ছে...' : 'লাইভ ব্রডকাস্ট শুরু করুন'}
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
