import React, { useState, useEffect } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

// SVG Icons (NO emojis)
const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
</svg>`;

const plusIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 5v14M5 12h14"/>
</svg>`;

const closeIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2">
  <path d="M18 6L6 18M6 6l12 12"/>
</svg>`;

const refreshIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M23 4v6h-6M1 20v-6h6"/>
  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
</svg>`;

const AdminRouteManager = ({ token }) => {
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [availableStations, setAvailableStations] = useState([]);
  const [newStation, setNewStation] = useState({
    stationName: '',
    stationNameBengali: '',
    arrivalTime: '',
    departureTime: '',
    distanceFromSource: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('select');

  useEffect(() => {
    fetchTrains();
    fetchAvailableStations();
  }, []);

  const fetchAvailableStations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`);
      const data = await response.json();
      if (data.success && data.data) {
        setAvailableStations(data.data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setTrains(data.trains || []);
      }
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (trainId, trainNumber) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes/${trainId || trainNumber}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setRoute(data.data);
        setStations(data.data.intermediateStations || []);
      } else {
        setRoute(null);
        setStations([]);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRoute(null);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainSelect = (trainId) => {
    const train = trains.find(t => t._id === trainId);
    setSelectedTrain(train);
    if (train) {
      fetchRoute(train._id, train.number);
    }
    setActiveTab('add');
  };

  const handleAddStation = () => {
    if (!newStation.stationName || !newStation.stationNameBengali) {
      setMessage({ type: 'error', text: 'স্টেশনের নাম প্রয়োজন' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const stationToAdd = {
      stationName: newStation.stationName.trim(),
      stationNameBengali: newStation.stationNameBengali.trim(),
      sequence: stations.length + 1,
      arrivalTime: newStation.arrivalTime || '',
      departureTime: newStation.departureTime || '',
      distanceFromSource: newStation.distanceFromSource || ((stations.length + 1) * 10),
      isCurrentLocation: false
    };

    setStations([...stations, stationToAdd]);
    setNewStation({
      stationName: '',
      stationNameBengali: '',
      arrivalTime: '',
      departureTime: '',
      distanceFromSource: ''
    });
    setMessage({ type: 'success', text: 'স্টেশন যোগ করা হয়েছে' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleRemoveStation = (index) => {
    const newStations = stations.filter((_, i) => i !== index);
    const reSequenced = newStations.map((station, idx) => ({
      ...station,
      sequence: idx + 1
    }));
    setStations(reSequenced);
    setMessage({ type: 'success', text: 'স্টেশন সরানো হয়েছে' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleSaveRoute = async () => {
    if (!selectedTrain) {
      setMessage({ type: 'error', text: 'কোন ট্রেন নির্বাচন করা হয়নি' });
      return;
    }

    setLoading(true);
    try {
      const routeData = {
        trainId: selectedTrain._id,
        trainNumber: selectedTrain.number,
        sourceStation: selectedTrain.from,
        destinationStation: selectedTrain.to,
        intermediateStations: stations,
        totalDistance: stations.length * 10 || 0
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(routeData)
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'ট্রেনের রুট সফলভাবে সংরক্ষণ করা হয়েছে!' });
        setActiveTab('select');
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'সংরক্ষণ করতে ব্যর্থ হয়েছে' });
      }
    } catch (error) {
      console.error('Error saving route:', error);
      setMessage({ type: 'error', text: 'সংরক্ষণ করতে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedTrain(null);
    setRoute(null);
    setStations([]);
    setActiveTab('select');
    setNewStation({
      stationName: '',
      stationNameBengali: '',
      arrivalTime: '',
      departureTime: '',
      distanceFromSource: ''
    });
  };

  // Format time for display (24-hour format)
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '';
    // If already in HH:MM format, return as is
    if (timeStr.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return timeStr;
    }
    return timeStr;
  };

  return (
    <div className="admin-route-manager">
      <h3 style={{ color: '#f14f29', marginBottom: '20px' }}>ট্রেন রুট ম্যানেজমেন্ট</h3>
      
      {message.text && (
        <div className={`message message-${message.type}`} style={{ marginBottom: '15px' }}>
          {message.text}
        </div>
      )}

      {activeTab === 'select' && (
        <div className="route-select-train">
          <h4>১. ট্রেন নির্বাচন করুন</h4>
          <div className="train-list-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '10px',
            marginTop: '15px'
          }}>
            {trains.map(train => (
              <div
                key={train._id}
                onClick={() => handleTrainSelect(train._id)}
                style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
              >
                <div style={{ fontWeight: 'bold', color: '#f14f29' }}>{train.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>নং: {train.number}</div>
                <div style={{ fontSize: '0.75rem' }}>{train.from} → {train.to}</div>
                <div style={{ fontSize: '0.7rem', color: '#28a745', marginTop: '4px' }}>
                  প্রস্থান: {train.departure} | আগমন: {train.arrival}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'add' && selectedTrain && (
        <div className="route-add-stations">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <div>
              <h4 style={{ margin: 0 }}>২. মধ্যবর্তী স্টেশন যোগ করুন</h4>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', margin: '5px 0 0' }}>
                <strong>{selectedTrain.name}</strong> ({selectedTrain.number}) - 
                {selectedTrain.from} → {selectedTrain.to}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#28a745', margin: '3px 0 0' }}>
                প্রস্থান: {selectedTrain.departure} | আগমন: {selectedTrain.arrival}
              </p>
            </div>
            <button 
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: refreshIconSVG }} />
              অন্য ট্রেন নির্বাচন করুন
            </button>
          </div>

          {/* Source Station */}
          <div style={{
            background: '#d4edda',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>উৎস স্টেশন</div>
              <div style={{ fontSize: '0.9rem' }}>{selectedTrain.from}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>প্রস্থান সময়</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>{selectedTrain.departure}</div>
            </div>
          </div>

          {/* Intermediate Stations List */}
          {stations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                মধ্যবর্তী স্টেশন ({toBengaliDigits(stations.length)})
              </h5>
              {stations.map((station, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#fff7ed',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    borderLeft: '3px solid #f14f29',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {index + 1}. {station.stationNameBengali} ({station.stationName})
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '4px' }}>
                      {station.distanceFromSource && `দূরত্ব: ${station.distanceFromSource} কিমি`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>আগমন</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', fontFamily: 'monospace' }}>
                        {station.arrivalTime || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6c757d' }}>প্রস্থান</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', fontFamily: 'monospace' }}>
                        {station.departureTime || '—'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStation(index)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: closeIconSVG }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Station Form with Time Pickers */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <h5 style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#f14f29' }}>নতুন স্টেশন যোগ করুন</h5>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                আপলোড করা স্টেশন থেকে নির্বাচন করুন
              </label>
              <select
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
                onChange={(e) => {
                  const selectedCity = availableStations.find(c => c._id === e.target.value);
                  if (selectedCity) {
                    setNewStation({
                      ...newStation,
                      stationName: selectedCity.name,
                      stationNameBengali: selectedCity.nameBengali
                    });
                  }
                }}
              >
                <option value="">-- পূর্বে আপলোড করা স্টেশন নির্বাচন করুন --</option>
                {availableStations.map(city => (
                  <option key={city._id} value={city._id}>
                    {city.nameBengali} ({city.name})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                  স্টেশনের নাম (ইংরেজি) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Dhaka"
                  className="form-input"
                  value={newStation.stationName}
                  onChange={(e) => setNewStation({...newStation, stationName: e.target.value})}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                  স্টেশনের নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা"
                  className="form-input"
                  value={newStation.stationNameBengali}
                  onChange={(e) => setNewStation({...newStation, stationNameBengali: e.target.value})}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                  আগমনের সময়
                </label>
                <input
                  type="time"
                  className="form-input time-input"
                  value={newStation.arrivalTime}
                  onChange={(e) => setNewStation({...newStation, arrivalTime: e.target.value})}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
                <small style={{ fontSize: '0.6rem', color: '#6c757d' }}>২৪ ঘন্টা ফরম্যাটে (যেমন: 10:30)</small>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                  প্রস্থানের সময়
                </label>
                <input
                  type="time"
                  className="form-input time-input"
                  value={newStation.departureTime}
                  onChange={(e) => setNewStation({...newStation, departureTime: e.target.value})}
                  style={{ padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
                <small style={{ fontSize: '0.6rem', color: '#6c757d' }}>২৪ ঘন্টা ফরম্যাটে (যেমন: 10:35)</small>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.7rem', color: '#6c757d', display: 'block', marginBottom: '4px' }}>
                দূরত্ব (কিমি)
              </label>
              <input
                type="number"
                placeholder="উৎস থেকে দূরত্ব"
                className="form-input"
                value={newStation.distanceFromSource}
                onChange={(e) => setNewStation({...newStation, distanceFromSource: e.target.value})}
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              />
              <small style={{ fontSize: '0.6rem', color: '#6c757d' }}>ঐচ্ছিক - স্বয়ংক্রিয়ভাবে গণনা হবে</small>
            </div>
            
            <button
              onClick={handleAddStation}
              style={{
                padding: '10px 20px',
                background: 'var(--orange-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: plusIconSVG }} />
              স্টেশন যোগ করুন
            </button>
          </div>

          {/* Destination Station */}
          <div style={{
            background: '#f8d7da',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>গন্তব্য স্টেশন</div>
              <div style={{ fontSize: '0.9rem' }}>{selectedTrain.to}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>আগমন সময়</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>{selectedTrain.arrival}</div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveRoute}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f14f29',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: trainIconSVG }} />
            {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'ট্রেন রুট সংরক্ষণ করুন'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRouteManager;