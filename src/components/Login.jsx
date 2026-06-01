import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Login = () => {
  const [activeForm, setActiveForm] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    adminKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      window.location.href = '/';
    }
  }, []);

  const showForm = (formType) => {
    setActiveForm(formType);
    setError('');
    setSuccess('');
    setFormData({
      username: '', email: '', password: '', confirmPassword: '',
      fullName: '', adminKey: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('ইমেইল এবং পাসওয়ার্ড প্রয়োজন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        email: formData.email.trim(),
        password: formData.password
      });

      setSuccess('লগইন সফল!');
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', response.token);

      if (response.user.role === 'admin') {
        localStorage.setItem('adminAuthenticated', 'true');
      }

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (err) {
      setError(err.message || 'লগইন করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('সমস্ত ফিল্ড পূরণ করুন');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim()
      };

      if (formData.adminKey) {
        userData.adminKey = formData.adminKey;
      }

      await authAPI.register(userData);

      setSuccess('রেজিস্ট্রেশন সফল! এখন লগইন করুন।');
      setTimeout(() => {
        setActiveForm('login');
        setFormData({
          email: formData.email,
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          adminKey: ''
        });
      }, 2000);

    } catch (err) {
      setError(err.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>বাংলাদেশ রেলওয়ে</h1>
          <p>সুরক্ষিত অ্যাকাউন্টে প্রবেশ করুন</p>

        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeForm === 'login' ? 'active' : ''}`}
            onClick={() => showForm('login')}
            disabled={loading}
          >
            লগইন
          </button>
          <button 
            className={`tab ${activeForm === 'signup' ? 'active' : ''}`}
            onClick={() => showForm('signup')}
            disabled={loading}
          >
            নিবন্ধন
          </button>
        </div>

        {success && <div className="message message-success">{success}</div>}
        {error && <div className="message message-error">{error}</div>}

        {activeForm === 'login' && (
          <div className="form-container active">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ইমেইল ঠিকানা"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="পাসওয়ার্ড"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>
            </form>
          </div>
        )}

        {activeForm === 'signup' && (
          <div className="form-container active">
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="পুরো নাম"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="ব্যবহারকারীর নাম"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ইমেইল ঠিকানা"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="পাসওয়ার্ড"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                  required 
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'নিবন্ধন করুন'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;