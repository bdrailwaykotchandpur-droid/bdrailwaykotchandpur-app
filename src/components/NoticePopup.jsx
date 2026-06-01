import React, { useState, useEffect } from 'react';

// SVG Icons (no emojis)
const INFO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

const WARNING_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 19h20L12 2z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

const EMERGENCY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

const SUCCESS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const NoticePopup = ({ notice, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const getTypeStyles = (type) => {
    switch(type) {
      case 'warning':
        return { borderColor: '#ffc107', icon: WARNING_ICON, bgColor: '#fff8e7' };
      case 'emergency':
        return { borderColor: '#dc3545', icon: EMERGENCY_ICON, bgColor: '#fff5f5' };
      case 'success':
        return { borderColor: '#28a745', icon: SUCCESS_ICON, bgColor: '#f0fff4' };
      default:
        return { borderColor: '#f14f29', icon: INFO_ICON, bgColor: '#fff7ed' };
    }
  };

  const typeStyle = getTypeStyles(notice.noticeType);

  if (!isVisible) return null;

  return (
    <div className="notice-popup-overlay" onClick={onClose}>
      <div 
        className="notice-popup-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          borderTop: `4px solid ${typeStyle.borderColor}`,
          backgroundColor: typeStyle.bgColor
        }}
      >
        <button className="notice-popup-close" onClick={onClose}>
          <span dangerouslySetInnerHTML={{ __html: CLOSE_ICON }} />
        </button>
        
        {notice.imageUrl && (
          <div className="notice-popup-image">
            <img src={notice.imageUrl} alt={notice.title} />
          </div>
        )}
        
        <div className="notice-popup-header">
          <span 
            className="notice-popup-icon"
            style={{ color: typeStyle.borderColor }}
            dangerouslySetInnerHTML={{ __html: typeStyle.icon }}
          />
          <h3 className="notice-popup-title">{notice.title}</h3>
        </div>
        
        <div className="notice-popup-body">
          <div dangerouslySetInnerHTML={{ __html: notice.content }}></div>
        </div>
        
        <div className="notice-popup-footer">
          <button className="notice-popup-btn" onClick={onClose}>
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;