import React, { useState, useEffect, useRef } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

// SVG Icons matching your design system
const importIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12"/></svg>`;
const dbIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3z"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"/></svg>`;

const AdminDataImport = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // States to keep track of the files chosen from your computer
  const [stationFile, setStationFile] = useState(null);
  const [trainFile, setTrainFile] = useState(null);
  
  // Refs to manually clear file inputs
  const stationFileInputRef = useRef(null);
  const trainFileInputRef = useRef(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const jwtToken = token || localStorage.getItem('token');
      const response = await fetch('https://bdrailwaykotchandpur.onrender.com/api/import/status', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setStatusData(data.data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  // Helper function to read the local file text directly inside your browser
  const readJsonFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve(json);
        } catch (err) {
          reject(new Error('ফাইলটি সঠিক JSON ফরম্যাটে নেই।'));
        }
      };
      reader.onerror = () => reject(new Error('ফাইলটি পড়তে সমস্যা হয়েছে।'));
      reader.readAsText(file);
    });
  };

  const handleStationUpload = async (e) => {
    e.preventDefault();
    if (!stationFile) {
      setMessage({ type: 'error', text: 'দয়া করে একটি স্টেশন JSON ফাইল নির্বাচন করুন।' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const parsedJson = await readJsonFile(stationFile);
      const stationsArray = Array.isArray(parsedJson) ? parsedJson : parsedJson.stations;

      if (!stationsArray || !Array.isArray(stationsArray)) {
        throw new Error('JSON ফাইলের ভেতরে স্টেশন তালিকা (Array) পাওয়া যায়নি।');
      }

      const jwtToken = token || localStorage.getItem('token');
      const response = await fetch('https://bdrailwaykotchandpur.onrender.com/api/import/json-stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ stations: stationsArray })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `স্টেশন ইম্পোর্ট সফল! নতুন যুক্ত: ${toBengaliDigits(data.stats.inserted)}, আপডেট: ${toBengaliDigits(data.stats.updated)}` });
        setStationFile(null);
        if (stationFileInputRef.current) stationFileInputRef.current.value = "";
        e.target.reset();
        fetchStatus();
      } else {
        throw new Error(data.message || 'সার্ভার প্রসেসিং ব্যর্থ হয়েছে।');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTrainUpload = async (e) => {
    e.preventDefault();
    if (!trainFile) {
      setMessage({ type: 'error', text: 'দয়া করে একটি ট্রেন JSON ফাইল নির্বাচন করুন।' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const parsedJson = await readJsonFile(trainFile);
      const trainsArray = Array.isArray(parsedJson) ? parsedJson : parsedJson.trains;

      if (!trainsArray || !Array.isArray(trainsArray)) {
        throw new Error('JSON ফাইলের ভেতরে ট্রেন তালিকা (Array) পাওয়া যায়নি।');
      }

      const jwtToken = token || localStorage.getItem('token');
      const response = await fetch('https://bdrailwaykotchandpur.onrender.com/api/import/json-trains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ trains: trainsArray })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `ট্রেন ইম্পোর্ট সফল! নতুন যুক্ত: ${toBengaliDigits(data.stats.inserted)}, আপডেট: ${toBengaliDigits(data.stats.updated)}` });
        setTrainFile(null);
        if (trainFileInputRef.current) trainFileInputRef.current.value = "";
        e.target.reset();
        fetchStatus();
      } else {
        throw new Error(data.message || 'সার্ভার প্রসেসিং ব্যর্থ হয়েছে।');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-city-manager">
    <h3>বাল্ক ডাটা জেসন ইম্পোর্ট (JSON File Upload)</h3>

    {message.text && (
      <div className={`import-message import-message-${message.type}`}>
      {message.text}
      </div>
    )}

    {statusData && (
      <div className="diagnostic-status-bar">
      <div className="diagnostic-card">
      <div className="diagnostic-icon-wrapper" dangerouslySetInnerHTML={{ __html: dbIcon }} />
      <div className="diagnostic-info">
      <span className="diagnostic-label">মোট স্টেশন সংখ্যা</span>
      <span className="diagnostic-value">{toBengaliDigits(statusData.stationCount || 0)} টি</span>
      </div>
      </div>
      <div className="diagnostic-card">
      <div className="diagnostic-icon-wrapper" dangerouslySetInnerHTML={{ __html: dbIcon }} />
      <div className="diagnostic-info">
      <span className="diagnostic-label">মোট ট্রেন সময়সূচী</span>
      <span className="diagnostic-value">{toBengaliDigits(statusData.trainCount || 0)} টি</span>
      </div>
      </div>
      </div>
    )}

    <div className="import-grid">

    {/* Module Area 1: Local Station File Input Picker */}
    <div className="upload-card">
    <h4 className="upload-card-title">
    ১. স্টেশন ডাটা ফাইল আপলোড
    </h4>
    <form onSubmit={handleStationUpload}>
    <div className="form-group">
    <label className="form-label">কম্পিউটার থেকে জেসন ফাইল নির্বাচন করুন (.json)</label>
    <input
    type="file"
    accept=".json"
    ref={stationFileInputRef}
    onChange={(e) => setStationFile(e.target.files[0])}
    className="form-input"
    style={{ padding: '8px 0' }}
    />
    </div>
    <button
    type="submit"
    disabled={loading || !stationFile}
    className="submit-btn"
    >
    <span dangerouslySetInnerHTML={{ __html: importIcon }} />
    {loading ? 'প্রসেস হচ্ছে...' : 'স্টেশন ফাইল আপলোড করুন'}
    </button>
    </form>
    </div>

    {/* Module Area 2: Local Train File Input Picker */}
    <div className="upload-card">
    <h4 className="upload-card-title">
    ২. ট্রেন রুট সময়সূচী আপলোড
    </h4>
    <form onSubmit={handleTrainUpload}>
    <div className="form-group">
    <label className="form-label">কম্পিউটার থেকে জেসন ফাইল নির্বাচন করুন (.json)</label>
    <input
    type="file"
    accept=".json"
    ref={trainFileInputRef}
    onChange={(e) => setTrainFile(e.target.files[0])}
    className="form-input"
    style={{ padding: '8px 0' }}
    />
    </div>
    <button
    type="submit"
    disabled={loading || !trainFile}
    className="submit-btn"
    >
    <span dangerouslySetInnerHTML={{ __html: importIcon }} />
    {loading ? 'প্রসেস হচ্ছে...' : 'ট্রেন ফাইল আপলোড করুন'}
    </button>
    </form>
    </div>

    </div>

    <div className="instruction-box">
    <h4>গুরুত্বপূর্ণ নির্দেশনা:</h4>
    <ul className="instruction-list">
    <li>আপলোড করার পূর্বে নিশ্চিত করুন ফাইল ফরম্যাটটি আমরা পূর্বে ডিজাইন করা <strong>stations_demo.json</strong> অথবা <strong>trains_demo.json</strong> স্ট্রাকচারের সাথে মিলছে।</li>
    <li>প্রতিটি স্টেশনের জন্য অবশ্যই সঠিক <strong>latitude</strong> এবং <strong>longitude</strong> মান থাকতে হবে, অন্যথায় লাইভ ট্র্যাকিং ম্যাপ কাজ করবে না।</li>
    <li>বিদ্যমান স্টেশন কোড বা ট্রেন নম্বর দিয়ে ফাইল আপলোড করলে ডাটাবেজে থাকা পূর্বের ডাটা স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে (Upsert Pattern)।</li>
    </ul>
    </div>
    </div>
  );
};

export default AdminDataImport;
