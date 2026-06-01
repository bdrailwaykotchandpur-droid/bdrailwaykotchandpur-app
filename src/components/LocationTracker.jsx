// LocationTracker.js - COMPLETELY HIDDEN from navigation (temporary)
// Code is kept for future re-enable
import React, { useState, useEffect, useCallback } from 'react';
import { locationsAPI } from '../services/api';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
  <path fill="#f14f29" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

const LocationTracker = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [error, setError] = useState(null);

  const fetchTrains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationsAPI.getAllLocations();
      setTrains(data.data || []);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
      setError('ট্রেনের তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrainLocation = useCallback(async (trainId) => {
    try {
      const data = await locationsAPI.getTrainLocation(trainId);
      setLiveLocation(data.data);
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  }, []);

  const handleTrainSelect = useCallback(async (train) => {
    setSelectedTrain(train);
    await fetchTrainLocation(train._id);
  }, [fetchTrainLocation]);

  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-animation"></div>
        <p>ট্রেনের অবস্থান লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button onClick={fetchTrains} className="retry-btn">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="location-tracker-page">
      <div className="page-header">
        <h1>লাইভ ট্রেন লোকেশন ট্র্যাকার</h1>
        <p>ট্রেনের বর্তমান অবস্থান দেখুন</p>
      </div>

      <div className="tracker-container">
        <div className="train-list-panel">
          <h3>সকল ট্রেন</h3>
          <div className="train-list">
            {trains.map(train => (
              <div
                key={train._id}
                className={`train-item ${selectedTrain?._id === train._id ? 'active' : ''}`}
                onClick={() => handleTrainSelect(train)}
              >
                <div className="train-name">{train.name}</div>
                <div className="train-number">নং: {toBengaliDigits(train.number)}</div>
                <div className="train-route">{train.from} → {train.to}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="location-details-panel">
          {selectedTrain ? (
            <>
              <h2>{selectedTrain.name} ({toBengaliDigits(selectedTrain.number)})</h2>
              <div className="location-info">
                <div className="info-card">
                  <span className="info-label">বর্তমান অবস্থান:</span>
                  <span className="info-value">
                    {liveLocation?.currentLocation || selectedTrain.currentLocation || 'তথ্য নেই'}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">পরবর্তী গন্তব্য:</span>
                  <span className="info-value">
                    {liveLocation?.nextStation || selectedTrain.nextStation || 'তথ্য নেই'}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">আগমনের সময়:</span>
                  <span className="info-value">
                    {liveLocation?.nextArrivalTime || selectedTrain.nextArrivalTime || 'তথ্য নেই'}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">স্ট্যাটাস:</span>
                  <span className={`status-badge status-${selectedTrain.status}`}>
                    {selectedTrain.status === 'on-time' ? 'সময়মতো' : 
                     selectedTrain.status === 'delayed' ? 'বিলম্বিত' : 
                     selectedTrain.status === 'early' ? 'জলদি' : 'বাতিল'}
                  </span>
                </div>
              </div>
              <div className="update-note">
                <p>তথ্যটি যাত্রীদের দেওয়া সর্বশেষ আপডেটের ভিত্তিতে দেখানো হচ্ছে</p>
                <p className="hint-text">আপনিও লোকেশন আপডেট জমা দিতে পারেন</p>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>বাম দিক থেকে একটি ট্রেন নির্বাচন করুন</p>
              <p className="hint-text">ট্রেনের বর্তমান অবস্থান দেখতে ক্লিক করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
