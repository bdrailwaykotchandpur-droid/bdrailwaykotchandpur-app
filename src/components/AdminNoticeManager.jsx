import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminNoticeManager = ({ token }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    noticeType: 'info',
    showPopup: true,
    endDate: '',
    image: null
  });

  const noticeTypes = [
    { value: 'info', label: 'তথ্য', color: '#17a2b8' },
    { value: 'warning', label: 'সতর্কতা', color: '#ffc107' },
    { value: 'emergency', label: 'জরুরি', color: '#dc3545' },
    { value: 'success', label: 'সফলতা', color: '#28a745' }
  ];

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('noticeType', formData.noticeType);
    formDataToSend.append('showPopup', formData.showPopup);
    if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
    if (formData.image) formDataToSend.append('image', formData.image);
    
    try {
      const url = editingNotice 
        ? `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/admin/${editingNotice._id}`
        : `${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/admin`;
      
      const response = await fetch(url, {
        method: editingNotice ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      
      const data = await response.json();
      if (data.success) {
        alert(editingNotice ? 'নোটিশ আপডেট করা হয়েছে' : 'নোটিশ তৈরি করা হয়েছে');
        setShowForm(false);
        setEditingNotice(null);
        setFormData({ title: '', content: '', noticeType: 'info', showPopup: true, endDate: '', image: null });
        setImagePreview(null);
        fetchNotices();
      }
    } catch (error) {
      console.error('Error saving notice:', error);
      alert('নোটিশ সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/notices/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('নোটিশ মুছে ফেলা হয়েছে');
        fetchNotices();
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('নোটিশ মুছতে সমস্যা হয়েছে');
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      noticeType: notice.noticeType,
      showPopup: notice.showPopup,
      endDate: notice.endDate ? notice.endDate.split('T')[0] : '',
      image: null
    });
    if (notice.imageUrl) {
      setImagePreview(notice.imageUrl);
    }
    setShowForm(true);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="admin-notice-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#f14f29' }}>নোটিশ ম্যানেজমেন্ট</h3>
        <button
          onClick={() => { setShowForm(!showForm); setEditingNotice(null); setFormData({ title: '', content: '', noticeType: 'info', showPopup: true, endDate: '', image: null }); setImagePreview(null); }}
          className="submit-btn"
          style={{ width: 'auto', padding: '8px 20px' }}
        >
          {showForm ? 'বাতিল' : '+ নতুন নোটিশ'}
        </button>
      </div>

      {showForm && (
        <div className="notice-form" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4>{editingNotice ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ তৈরি করুন'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">শিরোনাম *</label>
              <input type="text" name="title" className="form-input" value={formData.title} onChange={handleInputChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">বিবরণ *</label>
              <ReactQuill 
                value={formData.content} 
                onChange={handleQuillChange} 
                modules={quillModules}
                theme="snow"
                style={{ backgroundColor: 'white', marginBottom: '15px' }}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">নোটিশের ধরন</label>
                <select name="noticeType" className="form-input" value={formData.noticeType} onChange={handleInputChange}>
                  {noticeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">শেষ তারিখ (ঐচ্ছিক)</label>
                <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">ছবি (ঐচ্ছিক)</label>
              <input type="file" className="form-input" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="showPopup" checked={formData.showPopup} onChange={handleInputChange} />
                পপআপ আকারে দেখান
              </label>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'সংরক্ষণ করা হচ্ছে...' : (editingNotice ? 'আপডেট করুন' : 'নোটিশ তৈরি করুন')}
            </button>
          </form>
        </div>
      )}

      <div className="notices-list">
        {loading && !showForm ? (
          <p>লোড হচ্ছে...</p>
        ) : notices.length === 0 ? (
          <p>কোন নোটিশ নেই</p>
        ) : (
          notices.map(notice => (
            <div key={notice._id} className="notice-card" style={{ background: 'white', borderRadius: '10px', padding: '15px', marginBottom: '10px', borderLeft: `4px solid ${noticeTypes.find(t => t.value === notice.noticeType)?.color || '#f14f29'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '5px' }}>{notice.title}</h4>
                  <div style={{ marginBottom: '8px', color: '#6c757d', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: notice.content }}></div>
                  {notice.imageUrl && (
                    <img src={notice.imageUrl} alt={notice.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '8px' }}>
                    <span>ধরন: {noticeTypes.find(t => t.value === notice.noticeType)?.label}</span>
                    <span style={{ marginLeft: '15px' }}>পপআপ: {notice.showPopup ? 'হ্যাঁ' : 'না'}</span>
                    <span style={{ marginLeft: '15px' }}>স্ট্যাটাস: {notice.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                  </div>
                </div>
                <div>
                  <button className="edit-btn" onClick={() => handleEdit(notice)} style={{ marginRight: '8px' }}>সম্পাদনা</button>
                  <button className="delete-btn" onClick={() => handleDelete(notice._id)}>মুছুন</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNoticeManager;