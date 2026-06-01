import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';

const LocationPopup = ({ train, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    trainId: '',
    trainNumber: '',
    trainName: '',
    currentLocation: '',
    nextStation: '',
    arrivalTimeAtNext: '',
    reporterName: '',
    reporterContact: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (train) {
      setFormData({
        trainId: train._id || '',
        trainNumber: train.number || '',
        trainName: train.name || '',
        currentLocation: '',
        nextStation: '',
        arrivalTimeAtNext: '',
        reporterName: '',
        reporterContact: '',
        notes: ''
      });
    }
  }, [train]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentLocation) {
      setError('বর্তমান অবস্থান লিখুন');
      return;
    }
    if (!formData.nextStation) {
      setError('পরবর্তী গন্তব্য লিখুন');
      return;
    }
    if (!formData.reporterName) {
      setError('আপনার নাম লিখুন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submissionData = {
        trainId: formData.trainId,
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        currentLocation: formData.currentLocation,
        nextStation: formData.nextStation,
        arrivalTimeAtNext: formData.arrivalTimeAtNext,
        reporterName: formData.reporterName,
        reporterContact: formData.reporterContact,
        notes: formData.notes
      };

      const response = await locationsAPI.submit(submissionData);
      
      setSuccess('আপনার লোকেশন আপডেট সফলভাবে জমা হয়েছে! এডমিন রিভিউ এর পরে এটি আপডেট হবে।');
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'লোকেশন আপডেট জমা করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 style={{ color: '#f14f29', marginBottom: '20px', textAlign: 'center' }}>
          ট্রেন লোকেশন আপডেট
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          <strong>{formData.trainName}</strong> ({formData.trainNumber})
        </p>

        {success && (
          <div className="message message-success" style={{ marginBottom: '15px' }}>
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="message message-error" style={{ marginBottom: '15px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">বর্তমান অবস্থান *</label>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleChange}
              placeholder="যেমন: ঢাকা, টঙ্গী, গাজীপুর"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">পরবর্তী গন্তব্য *</label>
            <input
              type="text"
              name="nextStation"
              value={formData.nextStation}
              onChange={handleChange}
              placeholder="যেমন: চট্টগ্রাম, সিলেট"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">আগমনের সময়</label>
            <input
              type="text"
              name="arrivalTimeAtNext"
              value={formData.arrivalTimeAtNext}
              onChange={handleChange}
              placeholder="যেমন: সকাল ১০:৩০, দুপুর ২:১৫"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">আপনার নাম *</label>
              <input
                type="text"
                name="reporterName"
                value={formData.reporterName}
                onChange={handleChange}
                placeholder="আপনার পুরো নাম"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">যোগাযোগের নম্বর</label>
              <input
                type="text"
                name="reporterContact"
                value={formData.reporterContact}
                onChange={handleChange}
                placeholder="০১XXXXXXXXX"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">অতিরিক্ত তথ্য</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="যেমন: ট্রেনটি ১৫ মিনিট লেট, যাত্রী চাপ বেশি ইত্যাদি"
              className="form-textarea"
              rows="2"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'জমা হচ্ছে...' : 'লোকেশন আপডেট জমা দিন'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationPopup;
