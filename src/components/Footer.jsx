import React, { useState } from 'react';

// Import images from src/images/
import bkashLogo from '../images/bkash.png';
import nagadLogo from '../images/nagad.png';
import rocketLogo from '../images/rocket.png';
import upayLogo from '../images/upay.png';

const Footer = () => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');

  const copyToClipboard = (text, itemName = '') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setCopiedItem(itemName);
    setTimeout(() => {
      setCopyFeedback(false);
      setCopiedItem('');
    }, 2000);
  };

  const handleEmailClick = (e) => {
    e.preventDefault();
    copyToClipboard('bdrailwaykotchandpur@gmail.com', 'ইমেইল');
  };

  const handlePhoneClick = (e) => {
    e.preventDefault();
    copyToClipboard('ecoophobia@gmail.com', 'ইমেইল এড্রেস');
  };

  const handleDonationClick = (e) => {
    e.preventDefault();
    setShowDonation(prev => !prev);
    setShowAbout(false);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setShowAbout(!showAbout);
    setShowDonation(false);
  };

  const handleBankCopy = (bankNumber, bankName) => {
    copyToClipboard(bankNumber, `${bankName} নম্বর`);
  };

  // Banking data with imported images
  const bankingInfo = [
    {
      name: 'বিকাশ',
      number: '01830794876',
      type: 'Personal',
      logo: bkashLogo
    },
    {
      name: 'নগদ',
      number: '01580790310',
      type: 'Personal',
      logo: nagadLogo
    },
    {
      name: 'রকেট',
      number: '01830794876',
      type: 'Personal',
      logo: rocketLogo
    },
    {
      name: 'উপায়',
      number: 'N/A',
      type: 'Personal',
      logo: upayLogo
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-buttons">
          <button className="footer-btn" onClick={handleEmailClick}>
            ইমেইল
            <div className="details-box">
              <div className="details-content">
                <div className="details-title">ইমেইল ঠিকানা</div>
                <div className="email-text">bdrailwaykotchandpur@gmail.com</div>
                <p>যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের ইমেইল করুন</p>
                <div className="hint-text">ক্লিক করে ইমেইল ঠিকানা কপি করুন</div>
              </div>
            </div>
          </button>

          <button className="footer-btn" onClick={handlePhoneClick}>
            হেল্পলাইন
            <div className="details-box">
              <div className="details-content">
                <div className="details-title">সকাল ১০ টা হতে বিকাল ৫টা</div>
                <div className="phone-text">ecoophobia@gmail.com</div>
                <p>যেকোনো জরুরি সমস্যা বা তথ্যের জন্য ইমেইল করুন</p>
                <div className="hint-text">ক্লিক করে ইমেইল এড্রেস কপি করুন</div>
              </div>
            </div>
          </button>

          <button className="footer-btn" onClick={handleDonationClick}>
            ডোনেশন
            <div className="details-box">
              <div className="details-content">
                <div className="details-title">সাপোর্ট করুন</div>
                <p>আমাদের প্রজেক্ট বাচিয়ে রাখতে ডোনেশান করুন</p>
                <div className="hint-text">ক্লিক করে ডোনেশন তথ্য দেখুন</div>
              </div>
            </div>
          </button>

          <button className="footer-btn" onClick={handleAboutClick}>
            আমাদের সম্পর্কে
            <div className="details-box">
              <div className="details-content">
                <div className="details-title">বাংলাদেশ রেলওয়ে</div>
                <p>কোটচাঁদপুর রেলওয়ে স্টেশন এর অফিসিয়াল ওয়েবসাইট</p>
                <div className="hint-text">ক্লিক করে আমাদের সম্পর্কে জানুন</div>
              </div>
            </div>
          </button>
        </div>

        {showDonation && (
          <div className="donation-section">
            <h4>প্রজেক্টটি বাচিয়ে রাখতে ডোনেশান করুন</h4>
            <p className="donation-subtitle">আপনার যেকোনো পরিমাণের ডোনেশান আমাদের সাহায্য করবে</p>
            
            <div className="banking-numbers-grid">
              {bankingInfo.map((bank, index) => (
                <div 
                  key={index}
                  className="bank-card"
                  onClick={() => handleBankCopy(bank.number, bank.name)}
                >
                  <div className="bank-card-content">
                    <div className="payment-logo-container">
                      <img 
                        src={bank.logo} 
                        alt={bank.name}
                        className="payment-logo"
                      />
                    </div>
                    
                    <div className="bank-info">
                      <div className="bank-name">{bank.name}</div>
                      <div className="bank-number">{bank.number}</div>
                      <div className="bank-type">{bank.type}</div>
                    </div>
                  </div>
                  
                  <div className="copy-hint">কপি করতে ক্লিক করুন</div>
                </div>
              ))}
            </div>

            <div className="donation-note">
              <p>
                <strong>গুরুত্বপূর্ণ:</strong> ডোনেশন করার পর রেফারেন্স হিসেবে "BDRAILWAY" লিখুন। 
                ডোনেশন রিসিপ্টের জন্য উপরের ইমেইলে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        )}

        {showAbout && (
          <div className="about-section">
            <h4>বাংলাদেশ রেলওয়ে - কোটচাঁদপুর</h4>
            <div className="about-content">
              <p>কোটচাঁদপুর রেলওয়ে স্টেশন এর অফিসিয়াল ওয়েবসাইটে স্বাগতম।</p>
              <p>আমাদের লক্ষ্য ডিজিটাল বাংলাদেশ এর অংশ হিসেবে রেলওয়ে সেবাকে আরও সহজলভ্য করা।</p>
              
              <div className="about-features">
                <h5>আমাদের সেবাসমূহ:</h5>
                <ul>
                  <li>লাইভ ট্রেন সময়সূচী</li>
                  <li>রেলওয়ে সংবাদ ও আপডেট</li>
                  <li>স্থানীয় খবর সাবমিশন</li>
                  <li>রেলওয়ে মার্চেন্ডাইজ</li>
                  <li>২৪/৭ সাপোর্ট সেবা</li>
                </ul>
              </div>
              
              <p className="about-mission">আমরা চাই তথ্য হোক উন্মুক্ত, আপনার রেলওয়ে ভ্রমণ হোক সুন্দর।</p>
            </div>
          </div>
        )}

        <div className="footer-text">
          <p>বাংলাদেশ রেলওয়ে - কোটচাঁদপুর | সর্বস্বত্ব সংরক্ষিত © 2026</p>
          <p>একটি ওপেনসোর্স প্রজেক্ট</p>
        </div>
      </div>

      {copyFeedback && (
        <div className="copy-feedback">
           {copiedItem} সফল ভাবে কপি করা হয়েছে!
        </div>
      )}
    </footer>
  );
};

export default Footer;
