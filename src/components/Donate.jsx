import React, { useState } from 'react';
import bkashLogo from '../images/bkash.png';
import nagadLogo from '../images/nagad.png';
import rocketLogo from '../images/rocket.png';
import upayLogo from '../images/upay.png';
import './Donate.css';

const Donate = () => {
  const [copyFeedback, setCopyFeedback] = useState('');

  const copyToClipboard = (text, bankName) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${bankName} নম্বর কপি করা হয়েছে!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const bankingInfo = [
    { name: 'বিকাশ', number: '01830794876', type: 'Personal', logo: bkashLogo },
    { name: 'নগদ', number: '01580790310', type: 'Personal', logo: nagadLogo },
    { name: 'রকেট', number: '01830794876', type: 'Personal', logo: rocketLogo },
    { name: 'উপায়', number: 'N/A', type: 'Personal', logo: upayLogo }
  ];

  return (
    <div className="donate-page" style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="donate-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>Buy me a coffee ☕</h2>
        <p style={{ marginTop: '10px', fontSize: '1.1rem', color: 'var(--text-light)' }}>
          Do you want to donate? প্রজেক্টটি বাচিয়ে রাখতে কফি খাওয়ান!
        </p>
      </div>

      <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {bankingInfo.map((bank, index) => (
          <div 
            key={index}
            className="bank-card"
            onClick={() => copyToClipboard(bank.number, bank.name)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'var(--bg-white, #fff)', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}
          >
            <div className="bank-card-content" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="payment-logo-container" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={bank.logo} alt={bank.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div className="bank-info">
                <div className="bank-name" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{bank.name}</div>
                <div className="bank-number" style={{ color: '#f14f29', fontSize: '1.2rem', margin: '5px 0' }}>{bank.number}</div>
                <div className="bank-type" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{bank.type}</div>
              </div>
            </div>
            <button 
              className="copy-btn" 
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(bank.number, bank.name);
              }}
              style={{ background: '#f14f29', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
            >
              কপি
            </button>
          </div>
        ))}
      </div>

      {copyFeedback && (
        <div className="copy-feedback" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '10px 20px', borderRadius: '20px', zIndex: 1000 }}>
          {copyFeedback}
        </div>
      )}
    </div>
  );
};

export default Donate;
