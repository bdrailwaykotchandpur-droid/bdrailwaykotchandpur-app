// LocationSubmit.js - Simple location submission with station selection
import React, { useState, useEffect } from 'react';
import { locationsAPI, trainsAPI } from '../services/api';

// Train icon SVG
const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
  <path fill="#f14f29" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

// ASCII Art
const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'---------------------------------------'`;

const LocationSubmit = () => {
  const [formData, setFormData] = useState({
    trainId: '',
    trainNumber: '',
    trainName: '',
    currentLocation: '',
    nextStation: '',
    arrivalTimeAtNext: '',
    reporterName: '',
    reporterContact: '',
    notes: ''
  });
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedTrainMethod, setSelectedTrainMethod] = useState('select');
  const [trainRoutes, setTrainRoutes] = useState({});

  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  const fetchTrains = async () => {
    try {
      const data = await trainsAPI.getAll();
      setTrains(data.trains || []);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/stations`);
      const data = await response.json();
      if (data.success && data.data) {
        setStations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const fetchTrainRoute = async (trainId) => {
    if (trainRoutes[trainId]) return trainRoutes[trainId];
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes/${trainId}`);
      const data = await response.json();
      if (data.success && data.data && data.data.stations) {
        setTrainRoutes(prev => ({ ...prev, [trainId]: data.data.stations }));
        return data.data.stations;
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
    return [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleTrainSelect = async (e) => {
    const trainId = e.target.value;
    const selectedTrain = trains.find(t => t._id === trainId);
    if (selectedTrain) {
      const routeStations = await fetchTrainRoute(trainId);
      setFormData(prev => ({
        ...prev,
        trainId: selectedTrain._id,
        trainNumber: selectedTrain.number,
        trainName: selectedTrain.name
      }));
    }
  };

  // Get stations for dropdown (unified list)
  const getStationOptions = () => {
    // Combine stations from all trains
    const allStationNames = new Set();
    
    // Add all cities/stations
    stations.forEach(station => {
      allStationNames.add(station.name);
      allStationNames.add(station.nameBengali);
    });
    
    // Also add from trains
    trains.forEach(train => {
      allStationNames.add(train.from);
      allStationNames.add(train.to);
    });
    
    return Array.from(allStationNames).sort();
  };

  const handleManualTrainChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentLocation) {
      setError('বর্তমান অবস্থান লিখুন');
      return;
    }

    if (!formData.nextStation) {
      setError('পরবর্তী গন্তব্য লিখুন');
      return;
    }

    if (!formData.reporterName) {
      setError('আপনার নাম লিখুন');
      return;
    }

    if (selectedTrainMethod === 'select' && !formData.trainId) {
      setError('একটি ট্রেন নির্বাচন করুন');
      return;
    }

    if (selectedTrainMethod === 'manual' && (!formData.trainNumber || !formData.trainName)) {
      setError('ট্রেনের নাম এবং নম্বর লিখুন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submissionData = {
        trainId: formData.trainId,
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        currentLocation: formData.currentLocation,
        nextStation: formData.nextStation,
        arrivalTimeAtNext: formData.arrivalTimeAtNext,
        reporterName: formData.reporterName,
        reporterContact: formData.reporterContact,
        notes: formData.notes
      };

      await locationsAPI.submit(submissionData);

      setSuccess('আপনার লোকেশন আপডেট সফলভাবে জমা হয়েছে! এডমিন রিভিউ এর পরে এটি আপডেট হবে।');
      
      setFormData({
        trainId: '',
        trainNumber: '',
        trainName: '',
        currentLocation: '',
        nextStation: '',
        arrivalTimeAtNext: '',
        reporterName: '',
        reporterContact: '',
        notes: ''
      });

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'লোকেশন আপডেট জমা করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const stationOptions = getStationOptions();

  return (
    <div className="location-submit-page">
      <div className="page-header">

        <h1>লোকেশন আপডেট জমা দিন</h1>
        <p>ট্রেনের বর্তমান অবস্থান ও পরবর্তী গন্তব্য জানান</p>
      </div>

      {success && (
        <div className="message message-success">
          <div className="message-icon">✓</div>
          <div className="message-text">{success}</div>
        </div>
      )}

      {error && (
        <div className="message message-error">
          <div className="message-icon">!</div>
          <div className="message-text">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-group">
          <label className="form-label">ট্রেন নির্বাচনের পদ্ধতি</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="trainMethod"
                value="select"
                checked={selectedTrainMethod === 'select'}
                onChange={() => setSelectedTrainMethod('select')}
              />
              তালিকা থেকে ট্রেন নির্বাচন করুন
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="trainMethod"
                value="manual"
                checked={selectedTrainMethod === 'manual'}
                onChange={() => setSelectedTrainMethod('manual')}
              />
              ম্যানুয়ালি ট্রেনের তথ্য দিন
            </label>
          </div>
        </div>

        {selectedTrainMethod === 'select' && (
          <div className="form-group">
            <label className="form-label">ট্রেন নির্বাচন করুন *</label>
            <select
              className="form-input"
              value={formData.trainId}
              onChange={handleTrainSelect}
              required
            >
              <option value="">-- একটি ট্রেন নির্বাচন করুন --</option>
              {trains.map(train => (
                <option key={train._id} value={train._id}>
                  {train.name} ({train.number}) - {train.from} থেকে {train.to}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTrainMethod === 'manual' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ট্রেনের নাম *</label>
              <input
                type="text"
                name="trainName"
                value={formData.trainName}
                onChange={handleManualTrainChange}
                placeholder="যেমন: সোনার বাংলা এক্সপ্রেস"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ট্রেন নম্বর *</label>
              <input
                type="text"
                name="trainNumber"
                value={formData.trainNumber}
                onChange={handleManualTrainChange}
                placeholder="যেমন: 701"
                className="form-input"
                required
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">বর্তমান অবস্থান *</label>
            <select
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">-- স্টেশন নির্বাচন করুন --</option>
              {stationOptions.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              placeholder="অথবা ম্যানুয়ালি লিখুন"
              className="form-input"
              style={{ marginTop: '8px' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">পরবর্তী গন্তব্য *</label>
            <select
              name="nextStation"
              value={formData.nextStation}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">-- স্টেশন নির্বাচন করুন --</option>
              {stationOptions.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
            <input
              type="text"
              name="nextStation"
              value={formData.nextStation}
              onChange={handleInputChange}
              placeholder="অথবা ম্যানুয়ালি লিখুন"
              className="form-input"
              style={{ marginTop: '8px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">পরবর্তী গন্তব্যে আগমনের সময় (ঐচ্ছিক)</label>
          <input
            type="text"
            name="arrivalTimeAtNext"
            value={formData.arrivalTimeAtNext}
            onChange={handleInputChange}
            placeholder="যেমন: সকাল ১০:৩০, দুপুর ২:১৫"
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">আপনার নাম *</label>
            <input
              type="text"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleInputChange}
              placeholder="আপনার পুরো নাম"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">যোগাযোগের নম্বর (ঐচ্ছিক)</label>
            <input
              type="text"
              name="reporterContact"
              value={formData.reporterContact}
              onChange={handleInputChange}
              placeholder="০১XXXXXXXXX"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="যেমন: ট্রেনটি ১৫ মিনিট লেট, যাত্রী চাপ বেশি ইত্যাদি"
            className="form-textarea"
            rows="3"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'জমা হচ্ছে...' : 'লোকেশন আপডেট জমা দিন'}
        </button>
      </form>

      <div className="form-guidelines">
        <h3>নির্দেশিকা:</h3>
        <ul>
          <li>শুধুমাত্র সঠিক এবং বর্তমান তথ্য জমা দিন</li>
          <li>যাত্রীদের নিরাপত্তার জন্য ভুল তথ্য দিবেন না</li>
          <li>প্রত্যেকটি আপডেট এডমিন রিভিউ এর পর যুক্ত হবে</li>
          <li>জরুরি অবস্থায় সরাসরি রেলওয়ে কর্তৃপক্ষকে জানান</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationSubmit;
