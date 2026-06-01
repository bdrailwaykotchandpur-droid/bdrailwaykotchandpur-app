import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h2>বাংলাদেশ রেলওয়ে - কোটচাঁদপুর</h2>
      </div>
      <div className="about-content">
        <p>কোটচাঁদপুর রেলওয়ে স্টেশন এর অফিসিয়াল ওয়েবসাইটে স্বাগতম।</p>
        <p>আমাদের লক্ষ্য ডিজিটাল বাংলাদেশ এর অংশ হিসেবে রেলওয়ে সেবাকে আরও সহজলভ্য করা।</p>
        
        <div className="about-features">
          <h3>আমাদের সেবাসমূহ:</h3>
          <ul>
            <li>লাইভ ট্রেন সময়সূচী</li>
            <li>রেলওয়ে সংবাদ ও আপডেট</li>
            <li>স্থানীয় খবর সাবমিশন</li>
            <li>রেলওয়ে মার্চেন্ডাইজ</li>
            <li>২৪/৭ সাপোর্ট সেবা</li>
          </ul>
        </div>
        
        <p className="about-mission">আমরা চাই তথ্য হোক উন্মুক্ত, আপনার রেলওয়ে ভ্রমণ হোক সুন্দর।</p>

        <div className="contact-info">
          <h3>যোগাযোগ</h3>
          <p><strong>ইমেইল:</strong> bdrailwaykotchandpur@gmail.com</p>
          <p><strong>হেল্পলাইন:</strong> ecoophobia@gmail.com</p>
          <p className="time">সকাল ১০ টা হতে বিকাল ৫টা</p>
        </div>

        <div className="coffee-small-section" style={{ background: '#f9f9f9', color: '#333', padding: '10px', borderRadius: '8px', margin: '15px 0', textAlign: 'center', fontSize: '0.9rem' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f14f29' }}>প্রজেক্টটি বাঁচিয়ে রাখতে ডোনেট করুন!</p>
          <p style={{ margin: '4px 0' }}><strong>bKash / Nagad:</strong> 01736733276</p>
          <p style={{ margin: '4px 0' }}><strong>Rocket:</strong> 017367332768</p>
        </div>

        <div className="footer-copyright">
          <p>বাংলাদেশ রেলওয়ে - কোটচাঁদপুর | সর্বস্বত্ব সংরক্ষিত © 2026</p>
          <p>একটি ওপেনসোর্স প্রজেক্ট</p>
        </div>
      </div>
    </div>
  );
};

export default About;
