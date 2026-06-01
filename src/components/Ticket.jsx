import React, { useState, useEffect } from 'react';

const Ticket = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'''---------------------------------------'`;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeError(true);
      }
    }, 10000); // 10 second timeout for iframe loading

    return () => clearTimeout(timer);
  }, [iframeLoaded]);

  const handleIframeLoad = () => setIframeLoaded(true);
  const handleIframeError = () => setIframeError(true);

  return (
    <div className="ticket-page">
      <div className="page-header">
        <h1>বাংলাদেশ রেলওয়ে ই-টিকেট</h1>
        <p>সরাসরি বাংলাদেশ রেলওয়ের অফিসিয়াল ওয়েবসাইট থেকে টিকেট কাটুন</p>

      </div>

      <div className="ticket-content">
        <div className="guidelines-panel">
          <h3>টিকেট কেনার সাধারণ নির্দেশিকা:</h3>
          <div className="guidelines-list">
            <div className="guideline-item">
              <strong>ধাপ ১:</strong> অফিসিয়াল ওয়েবসাইটে ভিজিট করুন
            </div>
            <div className="guideline-item">
              <strong>ধাপ ২:</strong> রেজিস্ট্রেশন করুন অথবা লগইন করুন
            </div>
            <div className="guideline-item">
              <strong>ধাপ ৩:</strong> যাত্রা পরিকল্পনা করুন (উৎস, গন্তব্য, তারিখ)
            </div>
            <div className="guideline-item">
              <strong>ধাপ ৪:</strong> পছন্দের ট্রেন এবং সিট নির্বাচন করুন
            </div>
            <div className="guideline-item">
              <strong>ধাপ ৫:</strong> যাত্রীর তথ্য দিন
            </div>
            <div className="guideline-item">
              <strong>ধাপ ৬:</strong> পেমেন্ট সম্পন্ন করুন
            </div>
            <div className="guideline-item">
              <strong>ধাপ ৭:</strong> টিকেট কনফার্মেশন সংগ্রহ করুন
            </div>
          </div>

          <div className="important-notes">
            <h4>গুরুত্বপূর্ণ নোট:</h4>
            <ul>
              <li>টিকেট কাটার সময় সমস্ত তথ্য সঠিকভাবে দিন</li>
              <li>যাত্রার কমপক্ষে ১ ঘন্টা আগে স্টেশনে পৌঁছান</li>
              <li>ই-টিকেটের প্রিন্ট বা মোবাইল স্ক্রিনশট সঙ্গে রাখুন</li>
              <li>যাত্রীর জাতীয় আইডি কার্ড সঙ্গে রাখুন</li>
              <li>যেকোনো সমস্যায় কল করুন: <strong>১৬১০৩</strong></li>
            </ul>
          </div>

          <div className="official-links">
            <h4>অফিসিয়াল লিঙ্ক:</h4>
            <div className="link-item">
              <a href="https://eticket.railway.gov.bd" target="_blank" rel="noopener noreferrer">
                https://eticket.railway.gov.bd
              </a>
            </div>
            <div className="link-item">
              <a href="https://railway.gov.bd" target="_blank" rel="noopener noreferrer">
                https://railway.gov.bd
              </a>
            </div>
          </div>
        </div>

        <div className="browser-container">
          <div className="browser-header">
            <div className="browser-controls">
              <span className="browser-btn red"></span>
              <span className="browser-btn yellow"></span>
              <span className="browser-btn green"></span>
            </div>
            <div className="browser-url">
              <span>https://eticket.railway.gov.bd</span>
            </div>
          </div>

          <div className="iframe-container">
            {!iframeLoaded && (
              <div className="iframe-loading">
                <div className="loading-spinner"></div>
                <p>টিকেটিং সাইট লোড হচ্ছে...</p>
              </div>
            )}

            {iframeError ? (
              <div className="iframe-error">
                <div className="error-icon">[!]</div>
                <h3>সাইট লোড করতে সমস্যা হচ্ছে</h3>
                <p>সরাসরি ভিজিট করুন:</p>
                <a
                  href="https://eticket.railway.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direct-link-btn"
                >
                  https://eticket.railway.gov.bd
                </a>
              </div>
            ) : (
              <iframe
                src="https://eticket.railway.gov.bd"
                title="Bangladesh Railway E-Ticket"
                className="ticket-iframe"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ opacity: iframeLoaded ? 1 : 0 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;