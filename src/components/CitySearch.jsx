import React, { useState, useEffect, useCallback } from 'react';
import { toBengaliDigits, formatToBengaliTime } from '../utils/banglaTimeFormatter';

// Your train icon
const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
  <path fill="#f14f29" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

const CitySearch = ({ onSearchResults, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('both'); // 'from', 'to', 'both'
  const [cities, setCities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Load cities for autocomplete
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`
        );
        const data = await response.json();
        if (data.success) {
          setCities(data.data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Filter suggestions based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.nameBengali.includes(searchTerm)
    ).slice(0, 8);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, cities]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities/search?city=${encodeURIComponent(searchTerm)}&type=${searchType}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
        if (onSearchResults) {
          onSearchResults(data.data.trains);
        }
      } else {
        setSearchResult(null);
        if (onSearchResults) {
          onSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult(null);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchPerformed(false);
    setSearchResult(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (onClear) {
      onClear();
    }
  };

  const handleSuggestionClick = (city) => {
    setSearchTerm(city.nameBengali);
    setShowSuggestions(false);
    handleSearch();
  };

  const getStatusClass = (status) => {
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

  return (
    <div className="city-search-container">
      <div className="search-header">
        <span className="search-icon" dangerouslySetInnerHTML={{ __html: trainIconSVG }} />
        <h3>শহর অনুযায়ী ট্রেন খুঁজুন</h3>
      </div>
      
      <div className="search-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="শহরের নাম লিখুন (ঢাকা, চট্টগ্রাম, সিলেট...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {showSuggestions && (
            <div className="search-suggestions">
              {suggestions.map(city => (
                <div 
                  key={city._id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(city)}
                >
                  <span className="suggestion-name">{city.nameBengali}</span>
                  <span className="suggestion-division">{city.division}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <select 
          className="search-type-select"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="both">উৎস ও গন্তব্য</option>
          <option value="from">শুধু উৎস থেকে</option>
          <option value="to">শুধু গন্তব্যে</option>
        </select>
        
        <button 
          className="search-btn" 
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? 'খোঁজা হচ্ছে...' : 'খুঁজুন'}
        </button>
        
        {searchPerformed && (
          <button className="clear-btn" onClick={handleClear}>
           মুছুন 
          </button>
        )}
      </div>
      
      {searchPerformed && searchResult && (
        <div className="search-results">
          <div className="results-header">
            <span dangerouslySetInnerHTML={{ __html: trainIconSVG }} />
            <strong>"{searchResult.cityBengali}"</strong> {' '}
            {searchType === 'from' ? 'থেকে ছেড়ে যাওয়া' : 
             searchType === 'to' ? 'এ গন্তব্যে যাওয়া' : 
             'সাথে সম্পর্কিত'} {' '}
            <strong>{toBengaliDigits(searchResult.total)}</strong> টি ট্রেন পাওয়া গেছে
          </div>
          
          {searchResult.trains.length > 0 ? (
            <div className="search-trains-list">
              {searchResult.trains.map(train => (
                <div key={train._id} className="search-train-item">
                  <div className="train-basic-info">
                    <span className="train-name">{train.name}</span>
                    <span className="train-number">নং: {toBengaliDigits(train.number)}</span>
                  </div>
                  <div className="train-route-info">
                    <span className="route-from">{train.from}</span>
                    <span className="route-arrow">→</span>
                    <span className="route-to">{train.to}</span>
                  </div>
                  <div className="train-time-info">
                    <span>প্রস্থান: {formatToBengaliTime(train.departure)}</span>
                    <span>আগমন: {formatToBengaliTime(train.arrival)}</span>
                  </div>
                  <div className="train-status">
                    <span className={`status-badge ${getStatusClass(train.status)}`}>
                      {getStatusText(train.status)}
                    </span>
                    {train.currentLocation && (
                      <span className="current-location">বর্তমান: {train.currentLocation}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>কোন ট্রেন পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
      
      <style jsx="true">{`
        .city-search-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }
        
        .search-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .search-header svg {
          width: 24px;
          height: 24px;
        }
        
        .search-header h3 {
          color: #f14f29;
          margin: 0;
          font-size: 1rem;
        }
        
        .search-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .search-input-wrapper {
          flex: 1;
          position: relative;
          min-width: 200px;
        }
        
        .search-input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #dee2e6;
          border-radius: 25px;
          font-size: 0.9rem;
          font-family: 'Hind Siliguri', sans-serif;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #f14f29;
        }
        
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          z-index: 100;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          padding: 8px 15px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .suggestion-item:hover {
          background: #fff5f0;
        }
        
        .suggestion-name {
          font-weight: 500;
          color: #212529;
        }
        
        .suggestion-division {
          font-size: 0.7rem;
          color: #6c757d;
        }
        
        .search-type-select {
          padding: 10px 15px;
          border: 1px solid #dee2e6;
          border-radius: 25px;
          background: white;
          font-family: 'Hind Siliguri', sans-serif;
          cursor: pointer;
        }
        
        .search-btn, .clear-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Hind Siliguri', sans-serif;
        }
        
        .search-btn {
          background: #f14f29;
          color: white;
        }
        
        .search-btn:hover:not(:disabled) {
          background: #e03e1a;
        }
        
        .search-btn:disabled {
          background: #adb5bd;
          cursor: not-allowed;
        }
        
        .clear-btn {
          background: #6c757d;
          color: white;
        }
        
        .clear-btn:hover {
          background: #5a6268;
        }
        
        .search-results {
          margin-top: 20px;
          border-top: 1px solid #e9ecef;
          padding-top: 15px;
        }
        
        .results-header {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .results-header svg {
          width: 18px;
          height: 18px;
        }
        
        .search-trains-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .search-train-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .train-basic-info {
          display: flex;
          flex-direction: column;
        }
        
        .train-name {
          font-weight: 700;
          color: #212529;
          font-size: 0.9rem;
        }
        
        .train-number {
          font-size: 0.7rem;
          color: #6c757d;
        }
        
        .train-route-info {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
        }
        
        .route-arrow {
          color: #f14f29;
        }
        
        .train-time-info {
          display: flex;
          gap: 10px;
          font-size: 0.7rem;
          color: #6c757d;
        }
        
        .train-status {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .current-location {
          font-size: 0.7rem;
          color: #f14f29;
        }
        
        .no-results {
          text-align: center;
          padding: 20px;
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .search-controls {
            flex-direction: column;
          }
          
          .search-input-wrapper {
            width: 100%;
          }
          
          .search-type-select, .search-btn, .clear-btn {
            width: 100%;
          }
          
          .search-train-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CitySearch;