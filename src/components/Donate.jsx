import React, { useState } from 'react';
import bkashLogo from '../images/bkash.png';
import nagadLogo from '../images/nagad.png';
import rocketLogo from '../images/rocket.png';
import upayLogo from '../images/upay.png';
import './Donate.css';

const Donate = () => {
  const [copyFeedback, setCopyFeedback] = useState('');
  const [trxId, setTrxId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [submitStatus, setSubmitStatus] = useState('');

  const copyToClipboard = (text, bankName) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${bankName} নম্বর কপি করা হয়েছে!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const bankingInfo = [
    { name: 'বিকাশ', number: '01830794876', type: 'Personal', logo: bkashLogo, id: 'bKash' },
    { name: 'নগদ', number: '01580790310', type: 'Personal', logo: nagadLogo, id: 'Nagad' },
    { name: 'রকেট', number: '01830794876', type: 'Personal', logo: rocketLogo, id: 'Rocket' },
    { name: 'উপায়', number: 'N/A', type: 'Personal', logo: upayLogo, id: 'Upay' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trxId || !amount) {
      setSubmitStatus('দয়া করে ট্রানজ্যাকশন আইডি এবং পরিমাণ দিন');
      return;
    }
    
    // Simulate API submission
    setSubmitStatus('অপেক্ষা করুন...');
    setTimeout(() => {
      setSubmitStatus('আপনার ডোনেশন সফলভাবে সাবমিট হয়েছে! এডমিন যাচাই করে দেখবে।');
      setTrxId('');
      setAmount('');
    }, 1500);
  };

  return (
    <div className="donate-page">
      <div className="donate-header">
        <h2>ডোনেশন করুন</h2>
        <p>প্রজেক্টটি বাচিয়ে রাখতে আপনার যেকোনো পরিমাণের ডোনেশান আমাদের সাহায্য করবে</p>
      </div>

      <div className="payment-methods">
        {bankingInfo.map((bank, index) => (
          <div 
            key={index}
            className="bank-card"
            onClick={() => copyToClipboard(bank.number, bank.name)}
          >
            <div className="bank-card-content">
              <div className="payment-logo-container">
                <img src={bank.logo} alt={bank.name} className="payment-logo" />
              </div>
              <div className="bank-info">
                <div className="bank-name">{bank.name}</div>
                <div className="bank-number">{bank.number}</div>
                <div className="bank-type">{bank.type}</div>
              </div>
            </div>
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(bank.number, bank.name)}
            >
              কপি
            </button>
          </div>
        ))}
      </div>

      {copyFeedback && <div className="copy-feedback">{copyFeedback}</div>}

      <div className="donation-form-section">
        <h3>ডোনেশন নিশ্চিত করুন</h3>
        <p>টাকা পাঠানোর পর নিচের ফর্মটি পূরণ করুন</p>
        
        <form onSubmit={handleSubmit} className="donation-form">
          <div className="form-group">
            <label>পেমেন্ট মেথড</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="bKash">বিকাশ</option>
              <option value="Nagad">নগদ</option>
              <option value="Rocket">রকেট</option>
              <option value="Upay">উপায়</option>
            </select>
          </div>

          <div className="form-group">
            <label>পরিমাণ (টাকা)</label>
            <input 
              type="number" 
              placeholder="উদাঃ 100" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>ট্রানজ্যাকশন আইডি (TrxID)</label>
            <input 
              type="text" 
              placeholder="উদাঃ 8J3A9M2C" 
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-donation-btn">সাবমিট করুন</button>
          
          {submitStatus && (
            <div className={`submit-status ${submitStatus.includes('সফল') ? 'success' : 'error'}`}>
              {submitStatus}
            </div>
          )}
        </form>
      </div>

      <div className="donation-note">
        <p>
          <strong>গুরুত্বপূর্ণ:</strong> ডোনেশন করার পর রেফারেন্স হিসেবে "BDRAILWAY" লিখুন। 
          ডোনেশন রিসিপ্টের জন্য bdrailwaykotchandpur@gmail.com এ যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
};

export default Donate;
