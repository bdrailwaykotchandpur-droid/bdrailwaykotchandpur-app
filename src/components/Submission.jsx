import React, { useState } from 'react';
import { submissionsAPI } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Submission = () => {
  const [formData, setFormData] = useState({
    headline: '',
    newsContent: '',
    reporterName: '',
    reporterLocation: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const asciiArt = `___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'''---------------------------------------'`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('শুধুমাত্র ইমেজ ফাইল আপলোড করুন (PNG, JPG, JPEG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('ইমেজের সাইজ ৫MB এর কম হতে হবে');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.headline || !formData.newsContent || !formData.reporterName || !formData.reporterLocation) {
    setError('সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন');
    return;
  }

  if (formData.headline.length < 10) {
    setError('হেডলাইন কমপক্ষে ১০ অক্ষরের হতে হবে');
    return;
  }

  if (formData.newsContent.length < 50) {
    setError('খবরের কন্টেন্ট কমপক্ষে ৫০ অক্ষরের হতে হবে');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Create submission data object - MUST match backend expectations
    const submissionData = {
      headline: formData.headline,
      newsContent: formData.newsContent,
      reporterName: formData.reporterName,
      reporterLocation: formData.reporterLocation,
      image: imagePreview || ''
    };

    console.log('📤 Sending submission:', submissionData);
    
    const response = await submissionsAPI.create(submissionData);
    
    console.log('✅ Submission response:', response);
    
    setSuccess('আপনার সাবমিশন সফলভাবে জমা হয়েছে! এডমিন রিভিউ এর পর এটি প্রকাশিত হবে।');
    
    // Reset form
    setFormData({
      headline: '',
      newsContent: '',
      reporterName: '',
      reporterLocation: '',
      image: null
    });
    setImagePreview(null);
    
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
    
    setTimeout(() => {
      setSuccess('');
    }, 5000);

  } catch (err) {
    console.error('❌ Submission error:', err);
    setError(err.message || 'সাবমিশন জমা করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="submission-page">
      <div className="page-header">
        <h1>খবর সাবমিশন</h1>
        <p>আপনার স্থানীয় খবর ও আপডেট আমাদের সাথে শেয়ার করুন</p>

      </div>

      {success && (
        <div className="message message-success">
          <div className="message-icon">✅</div>
          <div className="message-text">{success}</div>
        </div>
      )}

      {error && (
        <div className="message message-error">
          <div className="message-icon">❌</div>
          <div className="message-text">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-group">
          <label htmlFor="headline" className="form-label">
            খবরের হেডলাইন *
          </label>
          <input
            type="text"
            id="headline"
            name="headline"
            value={formData.headline}
            onChange={handleInputChange}
            placeholder="খবরের হেডলাইন লিখুন (ন্যূনতম ১০ অক্ষর)"
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '40px' }}>
          <label htmlFor="newsContent" className="form-label">
            খবরের বিস্তারিত *
          </label>
          <ReactQuill 
            value={formData.newsContent} 
            onChange={(value) => setFormData(prev => ({ ...prev, newsContent: value }))} 
            theme="snow"
            placeholder="খবরের সম্পূর্ণ বিবরণ লিখুন (ন্যূনতম ৫০ অক্ষর)"
            style={{ backgroundColor: 'var(--bg-white, #fff)', marginBottom: '15px', minHeight: '150px' }}
          />
          <div className="char-count" style={{ marginTop: '45px' }}>
            {formData.newsContent.replace(/<[^>]+>/g, '').length} / 50+ অক্ষর
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="form-group">
          <label className="form-label">
            ছবি যোগ করুন (ঐচ্ছিক)
          </label>
          <div className="file-input-container">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              disabled={loading}
            />
            <label htmlFor="image-upload" className="file-input-label">
              <span className="file-input-text">
                {formData.image ? 'ছবি পরিবর্তন করুন' : 'ছবি সিলেক্ট করুন'}
              </span>
              <span className="file-input-hint">PNG, JPG, JPEG (সর্বোচ্চ ৫MB)</span>
            </label>
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="reporter-info">
          <div className="form-group">
            <label htmlFor="reporterName" className="form-label">
              রিপোর্টারের নাম *
            </label>
            <input
              type="text"
              id="reporterName"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleInputChange}
              placeholder="আপনার পুরো নাম"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reporterLocation" className="form-label">
              অবস্থান *
            </label>
            <input
              type="text"
              id="reporterLocation"
              name="reporterLocation"
              value={formData.reporterLocation}
              onChange={handleInputChange}
              placeholder="আপনার বর্তমান অবস্থান/স্টেশন"
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className={`submit-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                জমা হচ্ছে...
              </>
            ) : (
              'খবর জমা দিন'
            )}
          </button>
        </div>
      </form>

      <div className="form-guidelines">
        <h3>সাবমিশন গাইডলাইন:</h3>
        <ul>
          <li>শুধুমাত্র সঠিক এবং যাচাইকৃত তথ্য জমা দিন</li>
          <li>অপমানজনক বা আপত্তিকর কন্টেন্ট জমা দিবেন না</li>
          <li>রাজনৈতিক বা ধর্মীয় বিষয় এড়িয়ে চলুন</li>
          <li>ব্যক্তিগত তথ্য প্রকাশ থেকে বিরত থাকুন</li>
          <li>ছবি যোগ করলে সেটি সম্পর্কিত হতে হবে</li>
          <li>সাবমিশন এডমিন রিভিউ এর পর প্রকাশিত হবে</li>
          <li>জরুরি খবরের জন্য সরাসরি কর্তৃপক্ষকে জানান</li>
        </ul>
      </div>
    </div>
  );
};

export default Submission;
