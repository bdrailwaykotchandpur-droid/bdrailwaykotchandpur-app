import React, { useState, useEffect } from 'react';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';

const AdminCityManager = ({ token }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameBengali: '',
    division: 'Dhaka',
    code: '',
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const divisionBengali = {
    'Dhaka': 'ঢাকা',
    'Chittagong': 'চট্টগ্রাম',
    'Rajshahi': 'রাজশাহী',
    'Khulna': 'খুলনা',
    'Barisal': 'বরিশাল',
    'Sylhet': 'সিলেট',
    'Rangpur': 'রংপুর',
    'Mymensingh': 'ময়মনসিংহ'
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities/admin/all`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities/${editingId}`
        : `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'শহর আপডেট হয়েছে' : 'শহর যোগ করা হয়েছে' });
        resetForm();
        fetchCities();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'সংরক্ষণ করতে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    setFormData({
      name: city.name,
      nameBengali: city.nameBengali,
      division: city.division,
      code: city.code || '',
      order: city.order || 0
    });
    setEditingId(city._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('এই শহরটি মুছে ফেলতে চান?')) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'শহর মুছে ফেলা হয়েছে' });
        fetchCities();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'মুছে ফেলতে সমস্যা হয়েছে' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameBengali: '',
      division: 'Dhaka',
      code: '',
      order: 0
    });
    setEditingId(null);
  };

  return (
    <div className="admin-city-manager">
      <h3>শহর ব্যবস্থাপনা</h3>
      
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="city-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">শহরের নাম (ইংরেজি) *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">শহরের নাম (বাংলা) *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nameBengali}
              onChange={(e) => setFormData({...formData, nameBengali: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">বিভাগ *</label>
            <select
              className="form-input"
              value={formData.division}
              onChange={(e) => setFormData({...formData, division: e.target.value})}
            >
              {divisions.map(div => (
                <option key={div} value={div}>{divisionBengali[div]} ({div})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">কোড (সংক্ষিপ্ত নাম)</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="যথা: DHA, CGP"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {editingId ? 'আপডেট করুন' : 'শহর যোগ করুন'}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              বাতিল করুন
            </button>
          )}
        </div>
      </form>
      
      <div className="cities-list">
        <h4>শহরের তালিকা ({toBengaliDigits(cities.length)})</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>বাংলা নাম</th>
              <th>ইংরেজি নাম</th>
              <th>বিভাগ</th>
              <th>কোড</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => (
              <tr key={city._id}>
                <td>{city.nameBengali}</td>
                <td>{city.name}</td>
                <td>{divisionBengali[city.division]} ({city.division})</td>
                <td>{city.code || '—'}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(city)}>সম্পাদনা</button>
                  <button className="delete-btn" onClick={() => handleDelete(city._id)}>মুছুন</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCityManager;
