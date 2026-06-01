import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { formatToBengaliDate, getRelativeBengaliTime } from '../utils/banglaTimeFormatter';

// Train icon SVG (NO emojis)
const trainIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="#f14f29" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

// News icon SVG
const newsIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="none" stroke="#f14f29" stroke-width="2" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h7v2H7z"/>
</svg>`;

const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'---------------------------------------'`;

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsAPI.getAll();
      
      let newsArray = [];
      if (data && data.success && Array.isArray(data.news)) {
        newsArray = data.news;
      } else if (data && Array.isArray(data)) {
        newsArray = data;
      } else if (data && data.news && Array.isArray(data.news)) {
        newsArray = data.news;
      } else if (data && data.data && Array.isArray(data.data)) {
        newsArray = data.data;
      }
      
      setNews(newsArray);
    } catch (error) {
      console.error('News fetch error:', error);
      setError('খবর লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const openNewsDetail = (newsItem) => {
    setSelectedNews(newsItem);
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-animation"></div>
        <p>খবর লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button onClick={fetchNews} className="retry-btn">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="page-header">

        <h1>রেলওয়ে সংবাদ</h1>
        <p>সর্বশেষ খবর ও আপডেট</p>
        {/* Clock removed from here and moved to global Header */}
        <button onClick={fetchNews} className="refresh-btn">রিফ্রেশ</button>
      </div>

      {/* NO FILTER TABS - Just news grid */}
      <div className="news-grid">
        {news.map((item) => (
          <div key={item._id || item.id} className="news-card" onClick={() => openNewsDetail(item)}>
            <div className="news-image-container">
              {item.image ? (
                <img src={item.image} alt={item.title} className="news-image" />
              ) : (
                <div 
                  className="news-image-placeholder"
                  dangerouslySetInnerHTML={{ __html: newsIconSVG }}
                />
              )}
            </div>

            <div className="news-content">
              <span className="news-date">
                {formatToBengaliDate(item.date || item.createdAt)}
              </span>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-excerpt">
                {item.content ? item.content.substring(0, 100) + '...' : 'কোন বিবরণ নেই...'}
              </p>
            </div>
            <div className="news-footer">
              <span className="news-time">
                {getRelativeBengaliTime(item.createdAt || item.date)}
              </span>
              <button className="read-more-btn">পড়ুন</button>
            </div>
          </div>
        ))}
      </div>

      {selectedNews && (
        <div className="modal-overlay" onClick={closeNewsDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeNewsDetail}>×</button>
            
            <div className="modal-header">
              {selectedNews.image && (
                <div className="modal-image-container">
                  <img src={selectedNews.image} alt={selectedNews.title} className="modal-image" />
                </div>
              )}
              <div className="modal-meta">
                <span className="modal-date">
                  {formatToBengaliDate(selectedNews.date || selectedNews.createdAt)}
                </span>
              </div>
              <h2 className="modal-title">{selectedNews.title}</h2>
            </div>

            <div className="modal-body">
              <div className="modal-full-content">
                <p>{selectedNews.content}</p>
              </div>
            </div>

            <div className="modal-footer">
              <span className="modal-author">- {selectedNews.author || 'রেলওয়ে কর্তৃপক্ষ'}</span>
              <button className="btn btn-secondary" onClick={closeNewsDetail}>
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {news.length === 0 && !loading && (
        <div className="empty-state">
          <div 
            className="empty-icon"
            dangerouslySetInnerHTML={{ __html: newsIconSVG }}
          />
          <p>কোন খবর পাওয়া যায়নি</p>
          <button onClick={fetchNews} className="retry-btn">আবার চেষ্টা করুন</button>
        </div>
      )}
    </div>
  );
};

export default News;
