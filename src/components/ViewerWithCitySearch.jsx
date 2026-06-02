import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { trainsAPI } from '../services/api';
import { toBengaliDigits, formatToBengaliTime, formatToBengaliDate } from '../utils/banglaTimeFormatter';
import TrainDetailsModal from './TrainDetailsModal';
import RailwayMap from './RailwayMap';
import TrainLocationMap from './TrainLocationMap';
import { parseTimeToMinutes, getCurrentMinutes } from '../utils/trainPositionCalculator';

const trainIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><path fill="#f14f29" transform="translate(6,3)" d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"/></svg>`;
const headerTrainIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#f14f29" transform="translate(6,3)" d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"/></svg>`;

const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'---------------------------------------'`;

const DIVISIONS = [
  { id: 'all', name: 'সব বিভাগ', nameBn: 'সব বিভাগ' },
  { id: 'dhaka', name: 'ঢাকা', nameBn: 'ঢাকা' },
  { id: 'chittagong', name: 'চট্টগ্রাম', nameBn: 'চট্টগ্রাম' },
  { id: 'rajshahi', name: 'রাজশাহী', nameBn: 'রাজশাহী' },
  { id: 'khulna', name: 'খুলনা', nameBn: 'খুলনা' },
  { id: 'barisal', name: 'বরিশাল', nameBn: 'বরিশাল' },
  { id: 'sylhet', name: 'সিলেট', nameBn: 'সিলেট' },
  { id: 'rangpur', name: 'রংপুর', nameBn: 'রংপুর' },
  { id: 'mymensingh', name: 'ময়মনসিংহ', nameBn: 'ময়মনসিংহ' }
];

const getTrainDivision = (train) => {
  const stationName = (train.from || '').toLowerCase();
  if (stationName.includes('ঢাকা') || stationName.includes('dhaka')) return 'dhaka';
  if (stationName.includes('চট্টগ্রাম') || stationName.includes('chittagong')) return 'chittagong';
  if (stationName.includes('রাজশাহী') || stationName.includes('rajshahi')) return 'rajshahi';
  if (stationName.includes('খুলনা') || stationName.includes('khulna')) return 'khulna';
  if (stationName.includes('বরিশাল') || stationName.includes('barisal')) return 'barisal';
  if (stationName.includes('সিলেট') || stationName.includes('sylhet')) return 'sylhet';
  if (stationName.includes('রংপুর') || stationName.includes('rangpur')) return 'rangpur';
  if (stationName.includes('ময়মনসিংহ') || stationName.includes('mymensingh')) return 'mymensingh';
  return 'dhaka';
};

const isPastJourney = (journeyDate) => {
  if (!journeyDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const journey = new Date(journeyDate);
  journey.setHours(0, 0, 0, 0);
  return journey < today;
};

const isOffDayToday = (offDay) => {
  if (!offDay || offDay === 'None' || offDay === '') return false;
  const dayMap = {
    'রবিবার': 'Sunday', 'সোমবার': 'Monday', 'মঙ্গলবার': 'Tuesday',
    'বুধবার': 'Wednesday', 'বৃহস্পতিবার': 'Thursday', 'শুক্রবার': 'Friday', 'শনিবার': 'Saturday'
  };
  const today = new Date();
  const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  return offDay === todayName || dayMap[offDay] === todayName;
};

const formatJourneyDate = (dateString) => {
  if (!dateString) return { formatted: '', isOffDay: false, isToday: false };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { formatted: '', isOffDay: false, isToday: false };
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const bengaliDay = toBengaliDigits(day);
    const bengaliYear = toBengaliDigits(year);
    const suffix = (day >= 1 && day <= 10) ? 'ঠা' : 'ই';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = date < today;
    const isTodayDate = date.toDateString() === today.toDateString();
    return {
      formatted: `${bengaliDay}${suffix} ${bengaliMonths[month]} ${bengaliYear}`,
      isOffDay: isPastDate,
      isToday: isTodayDate,
    };
  } catch {
    return { formatted: '', isOffDay: false, isToday: false };
  }
};

const formatTimeWithSuffix = (timeStr) => (timeStr ? formatToBengaliTime(timeStr) : '—');
const getStatusColor = (status) => {
  switch (status) {
    case 'on-time': return 'status-on-time';
    case 'delayed': return 'status-delayed';
    case 'cancelled': return 'status-cancelled';
    default: return 'status-unknown';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'on-time': return 'সময়মতো';
    case 'delayed': return 'বিলম্বিত';
    case 'cancelled': return 'বাতিল';
    default: return status;
  }
};

const isTrainRunning = (train) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Get departure time - handle both formats
  let depTime = train.departure;
  let arrTime = train.arrival;
  
  // Remove any Bengali period words
  depTime = depTime.replace(/সকাল|দুপুর|বিকাল|সন্ধ্যা|রাত/g, '').trim();
  arrTime = arrTime.replace(/সকাল|দুপুর|বিকাল|সন্ধ্যা|রাত/g, '').trim();
  
  // Parse time (expected format: "07:00" or "7:00")
  const depParts = depTime.split(':');
  const arrParts = arrTime.split(':');
  
  if (depParts.length < 2 || arrParts.length < 2) return false;
  
  let depHour = parseInt(depParts[0], 10);
  let depMin = parseInt(depParts[1], 10);
  let arrHour = parseInt(arrParts[0], 10);
  let arrMin = parseInt(arrParts[1], 10);
  
  // Handle 12-hour format conversion
  if (train.departure.includes('রাত') && depHour !== 12) depHour += 12;
  if (train.departure.includes('দুপুর') && depHour === 12) depHour = 12;
  if (train.departure.includes('বিকাল') && depHour !== 12) depHour += 12;
  if (train.departure.includes('সন্ধ্যা') && depHour !== 12) depHour += 12;
  
  if (train.arrival.includes('রাত') && arrHour !== 12) arrHour += 12;
  if (train.arrival.includes('দুপুর') && arrHour === 12) arrHour = 12;
  if (train.arrival.includes('বিকাল') && arrHour !== 12) arrHour += 12;
  if (train.arrival.includes('সন্ধ্যা') && arrHour !== 12) arrHour += 12;
  
  const departureMinutes = depHour * 60 + depMin;
  const arrivalMinutes = arrHour * 60 + arrMin;
  
  // Handle overnight trains (arrival next day)
  if (arrivalMinutes < departureMinutes) {
    // Train runs overnight
    return currentMinutes >= departureMinutes || currentMinutes <= arrivalMinutes;
  }
  
  return currentMinutes >= departureMinutes && currentMinutes <= arrivalMinutes;
};

const CitySearch = ({ onSearchResults, onClear }) => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`)
      .then(r => r.json())
      .then(d => d.success && setCities(d.data))
      .catch(e => console.error(e));
  }, []);

  const handleSearch = () => {
    if (!fromCity.trim() && !toCity.trim()) return;
    onSearchResults({ from: fromCity.trim(), to: toCity.trim() });
  };

  return (
    <div className="city-search-minimal" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <div className="search-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: 'var(--bg-white, #fff)', padding: '15px 20px', borderRadius: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        <div className="search-input-wrapper" style={{ position: 'relative' }}>
          <select 
            value={fromCity} 
            onChange={e => setFromCity(e.target.value)} 
            style={{ border: 'none', borderBottom: '2px solid #f14f29', borderRadius: '0', padding: '8px 10px', width: '180px', outline: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', fontWeight: '500', fontSize: '0.95rem', color: fromCity ? '#333' : '#6c757d' }}
          >
            <option value="">উৎস (From)</option>
            {cities.map(c => (
              <option key={c._id} value={c.nameBengali}>{c.nameBengali}</option>
            ))}
          </select>
          {/* Custom dropdown arrow icon */}
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f14f29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <span style={{ color: '#6c757d', fontWeight: 'bold' }}>→</span>

        <div className="search-input-wrapper" style={{ position: 'relative' }}>
          <select 
            value={toCity} 
            onChange={e => setToCity(e.target.value)} 
            style={{ border: 'none', borderBottom: '2px solid #f14f29', borderRadius: '0', padding: '8px 10px', width: '180px', outline: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', fontWeight: '500', fontSize: '0.95rem', color: toCity ? '#333' : '#6c757d' }}
          >
            <option value="">গন্তব্য (To)</option>
            {cities.map(c => (
              <option key={c._id} value={c.nameBengali}>{c.nameBengali}</option>
            ))}
          </select>
          {/* Custom dropdown arrow icon */}
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f14f29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <button className="search-btn-minimal" onClick={handleSearch} disabled={!fromCity.trim() && !toCity.trim()} style={{ background: '#f14f29', color: 'white', border: 'none', borderRadius: '50px', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.2s', opacity: (!fromCity.trim() && !toCity.trim()) ? 0.6 : 1 }}>খুঁজুন</button>
        <button className="clear-btn-minimal" onClick={() => { setFromCity(''); setToCity(''); onClear(); }} style={{ background: '#f8f9fa', color: '#6c757d', border: '1px solid #dee2e6', borderRadius: '50px', padding: '10px 25px', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}>মুছুন</button>
      </div>
    </div>
  );
};

const ViewerWithCitySearch = () => {
  const [allTrains, setAllTrains] = useState([]);
  const [displayedTrains, setDisplayedTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [trainSearchTerm, setTrainSearchTerm] = useState('');
  const [routingFrom, setRoutingFrom] = useState('');
  const [routingTo, setRoutingTo] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedTrainForMap, setSelectedTrainForMap] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [stationsList, setStationsList] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const refreshing = useRef(false);

  const fetchStations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`);
      const data = await response.json();
      if (data.success && data.data) {
        setStationsList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const openTrainMap = (train) => {
    setSelectedTrainForMap(train);
  };

  const handleTrainClick = (train) => {
    setSelectedTrain(train);
  };

  const applyFilters = useCallback((trains) => {
    let filtered = trains;
    
    if (divisionFilter !== 'all') {
      filtered = filtered.filter(train => getTrainDivision(train) === divisionFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(train => train.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(train => train.trainType === typeFilter);
    }

    if (trainSearchTerm.trim() !== '') {
      const lowerTerm = trainSearchTerm.toLowerCase();
      filtered = filtered.filter(train => 
        (train.name && train.name.toLowerCase().includes(lowerTerm)) ||
        (train.number && String(train.number).toLowerCase().includes(lowerTerm))
      );
    }
    
    if (routingFrom) {
      filtered = filtered.filter(train => train.from === routingFrom);
    }
    
    if (routingTo) {
      filtered = filtered.filter(train => train.to === routingTo);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      const aTime = parseTimeToMinutes(a.departure) || 0;
      const bTime = parseTimeToMinutes(b.departure) || 0;
      return aTime - bTime;
    });
    
    return sorted;
  }, [divisionFilter, statusFilter, typeFilter, trainSearchTerm, routingFrom, routingTo]);

  const fetchTrains = useCallback(async (silent = false) => {
    if (refreshing.current && !silent) return;
    if (!silent) setLoading(true);
    refreshing.current = true;
    try {
      const data = await trainsAPI.getAll();
      const trainsData = data.trains || [];
      setAllTrains(trainsData);
      setDisplayedTrains(applyFilters(trainsData));
      setError(null);
    } catch (err) {
      console.error(err);
      if (!silent) setError('ট্রেনের তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      if (!silent) setLoading(false);
      refreshing.current = false;
    }
  }, [applyFilters]);

  useEffect(() => {
    fetchTrains(false);
    fetchStations();

    // IP Geolocation for Division Auto-Select
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.region) {
          const region = data.region.toLowerCase();
          if (region.includes('dhaka')) setDivisionFilter('dhaka');
          else if (region.includes('chittagong') || region.includes('chattogram')) setDivisionFilter('chittagong');
          else if (region.includes('rajshahi')) setDivisionFilter('rajshahi');
          else if (region.includes('khulna')) setDivisionFilter('khulna');
          else if (region.includes('barisal') || region.includes('barishal')) setDivisionFilter('barisal');
          else if (region.includes('sylhet')) setDivisionFilter('sylhet');
          else if (region.includes('rangpur')) setDivisionFilter('rangpur');
          else if (region.includes('mymensingh')) setDivisionFilter('mymensingh');
        }
      })
      .catch(err => console.error('Geo IP error', err));
  }, [fetchTrains]);

  useEffect(() => {
    if (allTrains.length > 0) {
      setDisplayedTrains(applyFilters(allTrains));
    }
  }, [applyFilters, allTrains]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (allTrains.length > 0) {
        setDisplayedTrains(applyFilters(allTrains));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [applyFilters, allTrains]);

  const handleStatusFilter = (newFilter) => {
    setStatusFilter(newFilter);
    setIsSearchActive(false);
  };

  const handleTypeFilter = (newFilter) => {
    setTypeFilter(newFilter);
    setIsSearchActive(false);
  };

  const handleDivisionFilter = (divisionId) => {
    setDivisionFilter(divisionId);
  };

  const handleSearchResults = (routes) => {
    if (routes.from || routes.to) {
      setRoutingFrom(routes.from);
      setRoutingTo(routes.to);
      setIsSearchActive(true);
    } else {
      setRoutingFrom('');
      setRoutingTo('');
    }
  };

  const handleClearSearch = () => {
    setTrainSearchTerm('');
    setRoutingFrom('');
    setRoutingTo('');
    setIsSearchActive(false);
    setStatusFilter('all');
    setDivisionFilter('all');
    setTypeFilter('all');
  };

  const toggleLiveMode = () => {
    setLiveMode(!liveMode);
    if (allTrains.length > 0) {
      setTimeout(() => {
        setDisplayedTrains(applyFilters(allTrains));
      }, 0);
    }
  };

  const toggleMap = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  if (loading) return <div className="loading-state"><div className="loading-animation" /><p>লোড হচ্ছে...</p></div>;
  if (error) return <div className="error-state"><p>{error}</p><button onClick={() => fetchTrains(false)} className="retry-btn">আবার চেষ্টা করুন</button></div>;

  return (
    <div className="viewer-page">
      {/* Category Sidebar Overlay & Drawer */}
      {isFilterSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsFilterSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
      )}
      <div className={`filter-sidebar ${isFilterSidebarOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: '2%',
        right: isFilterSidebarOpen ? '2%' : '-350px',
        width: '300px',
        height: '96vh',
        background: 'var(--bg-white, #fff)',
        boxShadow: '-4px 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1001,
        transition: 'right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden'
      }}>
        <div className="sidebar-header" style={{ padding: '24px', background: 'var(--orange-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>ক্যাটাগরি ফিল্টার</h3>
          <button onClick={() => setIsFilterSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer' }}>&times;</button>
        </div>
        <div className="sidebar-content" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => { handleTypeFilter('all'); setIsFilterSidebarOpen(false); }} style={{ padding: '14px 20px', textAlign: 'center', background: typeFilter === 'all' ? 'var(--orange-light)' : '#f8f9fa', color: typeFilter === 'all' ? 'var(--orange-primary)' : '#333', border: typeFilter === 'all' ? '2px solid var(--orange-primary)' : '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem', fontWeight: typeFilter === 'all' ? 'bold' : 'normal', transition: 'all 0.2s' }}>সব ধরন (All)</button>
          <button onClick={() => { handleTypeFilter('intercity'); setIsFilterSidebarOpen(false); }} style={{ padding: '14px 20px', textAlign: 'center', background: typeFilter === 'intercity' ? 'var(--orange-light)' : '#f8f9fa', color: typeFilter === 'intercity' ? 'var(--orange-primary)' : '#333', border: typeFilter === 'intercity' ? '2px solid var(--orange-primary)' : '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem', fontWeight: typeFilter === 'intercity' ? 'bold' : 'normal', transition: 'all 0.2s' }}>আন্তঃনগর (Intercity)</button>
          <button onClick={() => { handleTypeFilter('mail'); setIsFilterSidebarOpen(false); }} style={{ padding: '14px 20px', textAlign: 'center', background: typeFilter === 'mail' ? 'var(--orange-light)' : '#f8f9fa', color: typeFilter === 'mail' ? 'var(--orange-primary)' : '#333', border: typeFilter === 'mail' ? '2px solid var(--orange-primary)' : '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem', fontWeight: typeFilter === 'mail' ? 'bold' : 'normal', transition: 'all 0.2s' }}>মেইল/এক্সপ্রেস (Mail)</button>
          <button onClick={() => { handleTypeFilter('commuter'); setIsFilterSidebarOpen(false); }} style={{ padding: '14px 20px', textAlign: 'center', background: typeFilter === 'commuter' ? 'var(--orange-light)' : '#f8f9fa', color: typeFilter === 'commuter' ? 'var(--orange-primary)' : '#333', border: typeFilter === 'commuter' ? '2px solid var(--orange-primary)' : '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem', fontWeight: typeFilter === 'commuter' ? 'bold' : 'normal', transition: 'all 0.2s' }}>কমিউটার/লোকাল (Commuter)</button>
        </div>
      </div>
      
      <div className="page-header-minimal">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <h1>ট্রেন সময়সূচী - কোটচাঁদপুর</h1>
          <button 
            onClick={() => setIsFilterSidebarOpen(true)}
            style={{ background: 'var(--orange-primary)', color: 'white', border: 'none', borderRadius: '50px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            title="ক্যাটাগরি ফিল্টার"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
        <div className="datetime-minimal">
          {/* Removed clock and icon as per user request */}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <CitySearch onSearchResults={handleSearchResults} onClear={handleClearSearch} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button 
          onClick={() => fetchTrains(false)} 
          style={{ 
            background: '#e2e8f0', 
            color: '#4a5568', 
            border: 'none', 
            padding: '12px 25px', 
            borderRadius: '50px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-5.67"/></svg>
          রিফ্রেশ
        </button>

        <button 
          onClick={toggleLiveMode} 
          className={liveMode ? 'live-mode-active' : ''}
          style={{ 
            background: liveMode ? '#dc3545' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            padding: '12px 25px', 
            borderRadius: '50px', 
            cursor: 'pointer', 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: 'var(--bg-white, #fff)', 
            display: 'inline-block',
            animation: liveMode ? 'pulse 1.5s infinite' : 'none'
          }}></span>
          {liveMode ? 'লাইভ মোড অন' : 'লাইভ মোড অফ'}
        </button>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="ট্রেনের নাম বা নম্বর দিয়ে খুঁজুন..."
          value={trainSearchTerm}
          onChange={(e) => {
            setTrainSearchTerm(e.target.value);
            setIsSearchActive(false);
          }}
          className="search-input-minimal"
          style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto', padding: '12px 20px', borderRadius: '30px', border: '1px solid #dee2e6', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '0.9rem' }}
        />
      </div>

      <div className="division-filter-container" style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {DIVISIONS.map(div => (
          <button key={div.id} onClick={() => handleDivisionFilter(div.id)} style={{ padding: '6px 14px', background: divisionFilter === div.id ? '#f14f29' : '#f8f9fa', color: divisionFilter === div.id ? 'white' : '#495057', border: divisionFilter === div.id ? 'none' : '1px solid #dee2e6', borderRadius: '25px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: divisionFilter === div.id ? '600' : '400', transition: 'all 0.2s' }}>
            {div.nameBn}
          </button>
        ))}
      </div>

      {/* Railway Map */}
      <div className="map-wrapper">
        <div className="map-header" onClick={toggleMap}>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            লাইভ ট্রেন ম্যাপ
          </h3>
          <button className="map-toggle-btn" onClick={toggleMap}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d={isMapExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
          </button>
        </div>
        <div className={`map-container ${isMapExpanded ? 'expanded' : 'collapsed'}`}>
          <RailwayMap 
            trains={displayedTrains}
            stations={stationsList}
            onTrainClick={(train) => {
              setSelectedTrain(train);
              setShowReportModal(true);
            }}
          />
        </div>
      </div>

      <div className="stats-bar-minimal">
        <div className="stats-minimal">
          <span>মোট: {toBengaliDigits(displayedTrains.length)}</span>
          <span className="stat-on">সময়মতো: {toBengaliDigits(allTrains.filter(t => t.status === 'on-time').length)}</span>
          <span className="stat-delay">বিলম্বিত: {toBengaliDigits(allTrains.filter(t => t.status === 'delayed').length)}</span>
        </div>
        {!isSearchActive && (
          <div className="filter-minimal">
            {['all', 'on-time', 'delayed', 'cancelled'].map(f => (
              <button key={f} className={`filter-minimal-btn ${statusFilter === f ? 'active' : ''}`} onClick={() => handleStatusFilter(f)}>
                {f === 'all' ? 'সব' : f === 'on-time' ? 'সময়মতো' : f === 'delayed' ? 'বিলম্বিত' : 'বাতিল'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="table-container-minimal">
        {displayedTrains.length ? (
          <table className="train-table-minimal">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>ট্রেন নং</th>
                <th style={{ textAlign: 'left' }}>ট্রেনের নাম</th>
                <th style={{ textAlign: 'center' }}>যাত্রার তারিখ</th>
                <th style={{ textAlign: 'left' }}>উৎস</th>
                <th style={{ textAlign: 'center' }}>প্রস্থান</th>
                <th style={{ textAlign: 'left' }}>গন্তব্য</th>
                <th style={{ textAlign: 'center' }}>আগমন</th>
                <th style={{ textAlign: 'left' }}>বর্তমান অবস্থান</th>
                <th style={{ textAlign: 'left' }}>পরবর্তী গন্তব্য</th>
                <th style={{ textAlign: 'center' }}>পৌঁছানোর সময়</th>
                <th style={{ textAlign: 'center' }}>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {displayedTrains.map(train => {
                const isOff = isOffDayToday(train.offDay);
                const isToday = !isOff;
                const formattedDate = formatJourneyDate(new Date().toISOString()).formatted;
                const isRunning = liveMode && isTrainRunning(train);
                
                const currentMins = getCurrentMinutes();
                const startMins = parseTimeToMinutes(train.departure);
                const endMins = parseTimeToMinutes(train.arrival);

                // Automatically handles overnight or standard same-day active timelines
                const isTrainCurrentlyLive = startMins !== null && endMins !== null &&
                  (startMins < endMins 
                    ? (currentMins >= startMins && currentMins <= endMins)
                    : (currentMins >= startMins || currentMins <= endMins));
                
                return (
                  <tr key={train._id} onClick={() => handleTrainClick(train)} style={{ cursor: 'pointer' }} className={isOff ? 'off-day' : ''}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#718096' }}>
                      #{toBengaliDigits(train.number)}
                    </td>
                    <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <div className="train-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                        <span style={{ fontWeight: '600', color: '#1a202c' }}>{train.name}</span>
                        
                        {isOff && <span className="offday-badge">বন্ধ</span>}
                        {isRunning && (
                           <div className="live-animation-minimal">
                              <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#dc3545', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                              <span className="live-text" style={{ color: '#dc3545', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                LIVE {train.location?.speed ? `(${Math.round(train.location.speed)} km/h)` : ''}
                              </span>
                            </div>
                        )}
                        <span className={liveMode ? 'live-dot' : ''}></span>

                        {/* AUTOMATED FAVICON ICON LOGIC - Shows up automatically if the train is running right now */}
                        {isTrainCurrentlyLive && (
                          <div className="live-indicator-wrapper" title="এই ট্রেনটি বর্তমানে লাইভ রয়েছে">
                            <svg className="live-train-icon-svg" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            <span className="live-dot"></span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTrainMap(train);
                          }}
                          style={{
                            background: 'var(--orange-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          ম্যাপ
                        </button>
                      </div>
                      
                      {train.latestNote && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNotes(prev => ({
                                ...prev,
                                [train._id]: !prev[train._id]
                              }));
                            }}
                            style={{
                              background: '#fff3cd',
                              color: '#856404',
                              border: '1px solid #ffeeba',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            {expandedNotes[train._id] ? 'নোট বন্ধ করুন' : 'নোট দেখুন'}
                          </button>
                          
                          {expandedNotes[train._id] && (
                            <div style={{
                              marginTop: '6px',
                              padding: '8px',
                              background: '#f8f9fa',
                              borderLeft: '3px solid #ffc107',
                              fontSize: '0.8rem',
                              color: 'var(--text-dark)',
                              borderRadius: '4px',
                              maxWidth: '250px',
                              whiteSpace: 'normal',
                              lineHeight: '1.4'
                            }}>
                              <strong>আপডেট নোট:</strong> {train.latestNote}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isOff ? <span className="offday-text">বন্ধ</span> : isToday ? <span className="today-badge">আজ</span> : <span>{formattedDate}</span>}
                    </td>
                    <td style={{ textAlign: 'left' }}>{train.from}</td>
                    <td style={{ textAlign: 'center' }}><span className="time-badge-minimal">{formatTimeWithSuffix(train.departure)}</span></td>
                    <td style={{ textAlign: 'left' }}>{train.to}</td>
                    <td style={{ textAlign: 'center' }}><span className="time-badge-minimal">{formatTimeWithSuffix(train.arrival)}</span></td>
                    <td style={{ textAlign: 'left' }}>{train.currentLocation || '—'}</td>
                    <td style={{ textAlign: 'left' }}>{train.nextStation || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{train.nextArrivalTime ? formatTimeWithSuffix(train.nextArrivalTime) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-minimal ${getStatusColor(train.status)}`}>{getStatusText(train.status)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-minimal">
            <p>কোন ট্রেন পাওয়া যায়নি</p>
            {isSearchActive && <button onClick={handleClearSearch} className="show-all-minimal">সব ট্রেন দেখুন</button>}
          </div>
        )}
      </div>

      {/* Train Details Modal */}
      {selectedTrain && (
        <TrainDetailsModal 
          train={selectedTrain} 
          onClose={() => setSelectedTrain(null)} 
        />
      )}

      {/* Train Location Map Modal */}
      {selectedTrainForMap && (
        <TrainLocationMap
          train={selectedTrainForMap}
          onClose={() => setSelectedTrainForMap(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-red {
          0% {
            background: #dc3545;
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
          }
          50% {
            background: #ff4444;
            box-shadow: 0 0 0 5px rgba(220, 53, 69, 0);
          }
          100% {
            background: #dc3545;
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        .badge-live {
          background: #dc3545 !important;
          color: white !important;
          font-size: 0.55rem;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 8px;
          display: inline-block;
          animation: pulse-red 1.5s ease-in-out infinite;
        }
        .badge-completed {
          background: #6c757d;
          color: white;
          font-size: 0.55rem;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 8px;
          display: inline-block;
        }
        .badge-offday {
          background: #ffc107;
          color: #856404;
          font-size: 0.55rem;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 8px;
          display: inline-block;
        }
        .map-wrapper {
          margin-bottom: 20px;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          border: 1px solid #e9ecef;
        }
        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f14f29;
          color: white;
          cursor: pointer;
        }
        .map-header h3 {
          margin: 0;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .map-toggle-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .map-toggle-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        .map-container {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .map-container.collapsed {
          height: 0;
        }
        .map-container.expanded {
          height: auto;
        }
        .leaflet-container {
          height: 350px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .leaflet-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewerWithCitySearch;
