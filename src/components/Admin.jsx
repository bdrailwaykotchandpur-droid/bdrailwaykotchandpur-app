import React, { useState, useEffect } from 'react';
import { adminAPI, trainsAPI, productsAPI, submissionsAPI, newsAPI, locationsAPI } from '../services/api';
import { toBengaliDigits } from '../utils/banglaTimeFormatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AdminNoticeManager from './AdminNoticeManager';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Icons = {
  train: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
  product: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
  submission: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h7v2H7z"/></svg>',
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
  delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  approve: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  reject: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  refresh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  logout: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  import: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12"/></svg>',
  collapse: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
  expand: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg>',
  news: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  location: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/></svg>'
};

const COLORS = ['#f14f29', '#ff8c42', '#28a745', '#dc3545', '#17a2b8', '#ffc107'];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [trainComments, setTrainComments] = useState([]);
  const [trainCommentsLoading, setTrainCommentsLoading] = useState(false);

  // Collapsible Sections State
  const [sections, setSections] = useState({
    addTrain: true,
    trainList: true,
    products: true,
    submissions: true,
    news: true,
    locationUpdates: true,
    users: true,
    trainComments: true,
    notices: true,
  });

  // Train Management
  const [trains, setTrains] = useState([]);
  const [trainSearchTerm, setTrainSearchTerm] = useState('');
  const [trainForm, setTrainForm] = useState({
    name: '', number: '', journeyDate: new Date().toISOString().split('T')[0], from: '', to: '', departure: '', arrival: '', status: 'on-time',
    currentLocation: '', nextStation: '', nextArrivalTime: ''
  });

  // Edit Train Popup State
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);

  // Route Management State - Advanced with Times
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRouteTrain, setSelectedRouteTrain] = useState(null);
  const [routeStations, setRouteStations] = useState([]);
  const [newStationName, setNewStationName] = useState('');
  const [newStationArrival, setNewStationArrival] = useState('');
  const [newStationDeparture, setNewStationDeparture] = useState('');

  // Stations List for Dropdowns
  const [stationsList, setStationsList] = useState([]);

  // Location Updates State
  const [locationUpdates, setLocationUpdates] = useState([]);
  const [locationFilter, setLocationFilter] = useState('pending');

  // Product Management
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: 'food', description: '', stock: 0, isAvailable: true
  });
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);

  // Submission Management
  const [submissions, setSubmissions] = useState([]);
  const [submissionFilter, setSubmissionFilter] = useState('all');
  
  // News Management
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'general' });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const toggleSection = (sectionName) => {
    setSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const checkAuthentication = () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const adminAuth = localStorage.getItem('adminAuthenticated');

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        if (adminAuth === 'true' || parsedUser?.role === 'admin') {
          setIsAdminAuthenticated(true);
          localStorage.setItem('adminAuthenticated', 'true');
          loadAllData();
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Authentication check failed');
    }
  };

  const loadAllData = async () => {
    await fetchStats();
    await fetchTrains();
    await fetchProducts();
    await fetchSubmissions();
    await fetchNewsList();
    await fetchLocationUpdates();
    await fetchStations();
    await fetchTrainComments();
  };

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getStats();
      const statsData = data.stats || data;
      setStats(statsData);
      
      if (statsData) {
        setChartData([
          { name: 'ব্যবহারকারী', value: statsData.users || 0 },
          { name: 'ট্রেন', value: statsData.trains || 0 },
          { name: 'খবর', value: statsData.news || 0 },
          { name: 'সাবমিশন', value: statsData.submissions || 0 },
          { name: 'পণ্য', value: statsData.products || 0 }
        ]);
        
        setPieData([
          { name: 'পেন্ডিং', value: statsData.pendingSubmissions || 0 },
          { name: 'অনুমোদিত', value: (statsData.submissions || 0) - (statsData.pendingSubmissions || 0) }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load dashboard stats');
    }
  };

  const fetchTrains = async () => {
    try {
      const data = await trainsAPI.getAll();
      setTrains(data.trains || []);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/cities`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success && data.data) {
        setStationsList(data.data);
      } else if (Array.isArray(data)) {
        setStationsList(data);
      } else {
        setStationsList([]);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setStationsList([]);
    }
  };
  const fetchTrainComments = async () => {
  setTrainCommentsLoading(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/admin/all`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      setTrainComments(data.data);
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  } finally {
    setTrainCommentsLoading(false);
  }
};
const deleteTrainComment = async (id) => {
  if (!window.confirm('আপনি কি এই মন্তব্যটি মুছে ফেলতে চান?')) return;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/admin/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      setSuccess('মন্তব্য মুছে ফেলা হয়েছে!');
      fetchTrainComments();
      setTimeout(() => setSuccess(''), 3000);
    }
  } catch (error) {
    setError('মন্তব্য মুছতে ব্যর্থ হয়েছে');
  }
};

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await submissionsAPI.getAll();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchNewsList = async () => {
    try {
      const data = await newsAPI.getAll();
      if (data && data.success && Array.isArray(data.news)) {
        setNewsList(data.news);
      } else if (Array.isArray(data)) {
        setNewsList(data);
      } else {
        setNewsList([]);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const fetchLocationUpdates = async () => {
    try {
      let data;
      if (locationFilter === 'pending') {
        data = await locationsAPI.getPendingUpdates();
      } else {
        data = await locationsAPI.getAllUpdates(locationFilter);
      }
      setLocationUpdates(data.data || []);
    } catch (error) {
      console.error('Failed to fetch location updates:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Import Functions
  const handleImportStations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/import/stations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        await fetchStations();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ইম্পোর্ট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleImportTrains = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/import/trains`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        await fetchTrains();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('ইম্পোর্ট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!trainForm.name || !trainForm.number || !trainForm.from || !trainForm.to || !trainForm.departure || !trainForm.arrival) {
        setError('সব ফিল্ড পূরণ করুন');
        setLoading(false);
        return;
      }
      
      const trainData = {
        name: trainForm.name,
        number: trainForm.number,
        journeyDate: trainForm.journeyDate,
        from: trainForm.from,
        to: trainForm.to,
        departure: trainForm.departure,
        arrival: trainForm.arrival,
        status: trainForm.status,
        currentLocation: trainForm.currentLocation,
        nextStation: trainForm.nextStation,
        nextArrivalTime: trainForm.nextArrivalTime
      };
      
      await trainsAPI.create(trainData);
      setSuccess('ট্রেন সফলভাবে যোগ করা হয়েছে!');
      setTrainForm({ 
        name: '', number: '', journeyDate: new Date().toISOString().split('T')[0], from: '', to: '', 
        departure: '', arrival: '', status: 'on-time',
        currentLocation: '', nextStation: '', nextArrivalTime: '' 
      });
      await fetchTrains();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Train creation error:', err);
      setError(err.message || 'ট্রেন যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrain = async (id) => {
    if (!window.confirm('আপনি কি এই ট্রেনটি মুছে ফেলতে চান?')) return;
    
    try {
      await trainsAPI.delete(id);
      setSuccess('ট্রেন মুছে ফেলা হয়েছে!');
      await fetchTrains();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('ট্রেন মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  const handleOpenEditPopup = (train) => {
    setEditingTrain({ ...train });
    setShowEditPopup(true);
  };

  const handleEditTrainChange = (e) => {
    const { name, value } = e.target;
    setEditingTrain(prev => ({ ...prev, [name]: value }));
  };

const handleUpdateTrain = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await trainsAPI.update(editingTrain._id, {
      currentLocation: editingTrain.currentLocation,
      nextStation: editingTrain.nextStation,
      nextArrivalTime: editingTrain.nextArrivalTime,
      status: editingTrain.status,
      delay: editingTrain.delay,
      from: editingTrain.from,
      to: editingTrain.to,
      scheduleText: editingTrain.scheduleText  // ADD THIS LINE
    });
    setSuccess('ট্রেনের তথ্য আপডেট করা হয়েছে!');
    await fetchTrains();
    setShowEditPopup(false);
    setEditingTrain(null);
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError('আপডেট করতে ব্যর্থ হয়েছে');
  } finally {
    setLoading(false);
  }
};
// Update all trains to today's journey date
const handleUpdateAllJourneyDates = async () => {
  if (!window.confirm('সকল ট্রেনের যাত্রার তারিখ আজকে আপডেট করতে চান?\n\nএটি সকল ট্রেনের তারিখ আজকে সেট করবে।')) {
    return;
  }
  
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains`);
    const data = await response.json();
    const trains = data.trains || [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updatedCount = 0;
    
    for (const train of trains) {
      const journeyDate = new Date(train.journeyDate);
      journeyDate.setHours(0, 0, 0, 0);
      
      if (journeyDate < today) {
        const updateRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains/${train._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...train,
            journeyDate: new Date().toISOString()
          })
        });
        
        if (updateRes.ok) {
          updatedCount++;
        }
      }
    }
    
    setSuccess(`${updatedCount} টি ট্রেনের তারিখ আজকে আপডেট করা হয়েছে!`);
    await fetchTrains(); // Refresh the train list
    setTimeout(() => setSuccess(''), 3000);
    
  } catch (err) {
    console.error('Error updating journey dates:', err);
    setError('তারিখ আপডেট করতে সমস্যা হয়েছে');
    setTimeout(() => setError(''), 3000);
  } finally {
    setLoading(false);
  }
};

// Delete all trains
const handleDeleteAllTrains = async () => {
  if (!window.confirm('আপনি কি নিশ্চিত যে আপনি সকল ট্রেন মুছতে চান? এই অ্যাকশনটি অপরিবর্তনীয়!')) {
    return;
  }
  
  const secondConfirm = window.confirm('সত্যিই কি ডাটাবেজ থেকে সমস্ত ট্রেন ডিলিট করবেন?');
  if (!secondConfirm) return;
  
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/trains/all`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      setSuccess('সকল ট্রেন সফলভাবে মুছে ফেলা হয়েছে!');
      await fetchTrains();
    } else {
      throw new Error('Failed to delete trains');
    }
  } catch (err) {
    console.error('Error deleting all trains:', err);
    setError('ট্রেন মুছতে সমস্যা হয়েছে');
  } finally {
    setLoading(false);
  }
};

  // Advanced Route Management Functions
  const openRouteModal = async (train) => {
    setSelectedRouteTrain(train);
    setRouteStations(train.intermediateStations || []);
    setShowRouteModal(true);
  };

  const addStationWithTimes = () => {
    if (!newStationName.trim()) return;
    
    setRouteStations([
      ...routeStations,
      {
        stationName: newStationName,
        stationNameBengali: newStationName,
        sequence: routeStations.length + 1,
        arrivalTime: newStationArrival,
        departureTime: newStationDeparture,
        distanceFromSource: (routeStations.length + 1) * 10
      }
    ]);
    setNewStationName('');
    setNewStationArrival('');
    setNewStationDeparture('');
  };

  const removeStationFromRoute = (index) => {
    const updated = routeStations.filter((_, i) => i !== index);
    const reordered = updated.map((station, idx) => ({
      ...station,
      sequence: idx + 1
    }));
    setRouteStations(reordered);
  };

  const updateStationTime = (index, field, value) => {
    const updated = [...routeStations];
    updated[index][field] = value;
    setRouteStations(updated);
  };

  const saveRouteStations = async () => {
    if (!selectedRouteTrain) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            trainId: selectedRouteTrain._id,
            trainNumber: selectedRouteTrain.number,
            sourceStation: selectedRouteTrain.from,
            destinationStation: selectedRouteTrain.to,
            intermediateStations: routeStations,
            totalStations: routeStations.length + 2
          })
        }
      );
      
      
      const data = await response.json();
      if (data.success) {
        setSuccess('রুট সফলভাবে সংরক্ষণ করা হয়েছে');
        const updatedTrains = trains.map(t => 
          t._id === selectedRouteTrain._id 
            ? { ...t, intermediateStations: routeStations }
            : t
        );
        setTrains(updatedTrains);
        setShowRouteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setError('রুট সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLocation = async (id) => {
    if (!window.confirm('আপনি কি এই লোকেশন আপডেটটি অনুমোদন করতে চান?')) return;
    setLoading(true);
    try {
      await locationsAPI.approveUpdate(id);
      setSuccess('লোকেশন আপডেট অনুমোদিত এবং ট্রেন আপডেট করা হয়েছে!');
      await fetchLocationUpdates();
      await fetchStats();
      await fetchTrains();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('অনুমোদন করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLocation = async (id) => {
    const reason = prompt('প্রত্যাখ্যানের কারণ লিখুন:');
    if (!reason) return;
    if (!window.confirm('আপনি কি এই লোকেশন আপডেটটি প্রত্যাখ্যান করতে চান?')) return;
    setLoading(true);
    try {
      await locationsAPI.rejectUpdate(id, reason);
      setSuccess('লোকেশন আপডেট প্রত্যাখ্যান করা হয়েছে!');
      await fetchLocationUpdates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('প্রত্যাখ্যান করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!productForm.name || !productForm.price) {
        setError('পণ্যের নাম এবং মূল্য প্রয়োজন');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('stock', productForm.stock);
      formData.append('isAvailable', productForm.isAvailable);
      if (productImage) {
        formData.append('image', productImage);
      }
      
      await productsAPI.create(formData);
      setSuccess('পণ্য সফলভাবে যোগ করা হয়েছে!');
      setProductForm({ name: '', price: '', category: 'food', description: '', stock: 0, isAvailable: true });
      setProductImage(null);
      setProductImagePreview(null);
      await fetchProducts();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Product creation error:', err);
      setError(err.message || 'পণ্য যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) return;
    
    try {
      await productsAPI.delete(id);
      setSuccess('পণ্য মুছে ফেলা হয়েছে!');
      await fetchProducts();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('পণ্য মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  const handleUpdateSubmissionStatus = async (id, status) => {
    setLoading(true);
    try {
      await submissionsAPI.update(id, { status });
      setSuccess(`সাবমিশন ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!`);
      await fetchSubmissions();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Status update error:', err);
      setError('স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!newsForm.title || !newsForm.content) {
        setError('শিরোনাম এবং বিস্তারিত প্রয়োজন');
        setLoading(false);
        return;
      }
      
      const formData = {
        title: newsForm.title,
        content: newsForm.content,
        category: newsForm.category,
        author: user?.fullName || 'বাংলাদেশ রেলওয়ে'
      };
      
      await newsAPI.create(formData);
      setSuccess('নিউজ সফলভাবে যোগ করা হয়েছে!');
      setNewsForm({ title: '', content: '', category: 'general' });
      await fetchNewsList();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('News creation error:', err);
      setError(err.message || 'নিউজ যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteNews = async (id) => {
    if (!window.confirm('আপনি কি এই নিউজটি মুছে ফেলতে চান?')) return;
    
    try {
      await newsAPI.delete(id);
      setSuccess('নিউজ মুছে ফেলা হয়েছে!');
      await fetchNewsList();
      await fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('নিউজ মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  const getFilteredSubmissions = () => {
    if (submissionFilter === 'all') return submissions;
    return submissions.filter(s => s.status === submissionFilter);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'পেন্ডিং';
      case 'approved': return 'অনুমোদিত';
      case 'rejected': return 'প্রত্যাখ্যাত';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };
  const [allComments, setAllComments] = useState([]);

const fetchComments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) setAllComments(data.data);
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

const deleteComment = async (id) => {
  if (!window.confirm('এই মন্তব্য মুছে ফেলতে চান?')) return;
  try {
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/comments/admin/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchComments();
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

  // Filter trains by search term
  const filteredTrains = trains.filter(train => 
    train.name.toLowerCase().includes(trainSearchTerm.toLowerCase()) ||
    train.number.toLowerCase().includes(trainSearchTerm.toLowerCase()) ||
    train.from.toLowerCase().includes(trainSearchTerm.toLowerCase()) ||
    train.to.toLowerCase().includes(trainSearchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <h2>লগইন প্রয়োজন</h2>
          <p>অনুগ্রহ করে প্রথমে লগইন করুন</p>
          <a href="/login" className="login-btn">লগইন পেজে যান</a>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <h2>এডমিন এক্সেস</h2>
          <p>শুধুমাত্র অনুমোদিত এডমিনরা এক্সেস করতে পারবেন</p>
          <div className="user-info">
            <p>লগইন করেছেন: <strong>{user?.fullName}</strong></p>
            <p>ইমেইল: {user?.email}</p>
            <p className="hint-text">এই অ্যাকাউন্টে এডমিন অনুমতি নেই</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span dangerouslySetInnerHTML={{ __html: Icons.logout }}></span>
            লগআউট
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* THE NEW V4 LAYOUT: TWO BOXES */}
      <div className="admin-v4-layout">
        
        {/* LEFT SIDEBAR BOX */}
        <div className="admin-v4-sidebar">
          <div className="admin-v4-sidebar-header">
            <h2>এডমিন প্যানেল</h2>
          </div>
          
          <div className="admin-v4-user-info">
            <strong>{user?.fullName}</strong>
          </div>
          <div className="admin-v4-user-info" style={{marginBottom: '15px'}}>
            <span className="user-role">এডমিন</span>
          </div>
          
          <nav className="admin-v4-nav">
            <button className={`admin-v4-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.refresh }}></span> ড্যাশবোর্ড
            </button>
            <button className={`admin-v4-nav-item ${activeTab === 'trains' ? 'active' : ''}`} onClick={() => setActiveTab('trains')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.train }}></span> ট্রেন ও রুট
            </button>
            <button className={`admin-v4-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.product }}></span> পণ্য
            </button>
            <button className={`admin-v4-nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.news }}></span> খবর ও নোটিশ
            </button>
            <button className={`admin-v4-nav-item ${activeTab === 'interactions' ? 'active' : ''}`} onClick={() => setActiveTab('interactions')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.users }}></span> ব্যবহারকারী ও মন্তব্য
            </button>
            <button className={`admin-v4-nav-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
              <span dangerouslySetInnerHTML={{ __html: Icons.import }}></span> ডাটা ইম্পোর্ট
            </button>
            
            <button className="admin-v4-nav-item" onClick={handleLogout} style={{ marginTop: '20px', color: '#f14f29' }}>
              <span dangerouslySetInnerHTML={{ __html: Icons.logout }}></span> লগআউট
            </button>
          </nav>
        </div>
        
        {/* RIGHT MAIN CONTENT BOX */}
        <div className="admin-v4-main-content">
          <div className="admin-v4-topbar">
            <button onClick={loadAllData} className="refresh-btn" disabled={loading} style={{ background: '#f8f9fa', border: 'none', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              <span dangerouslySetInnerHTML={{ __html: Icons.refresh }}></span>
              {loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
            </button>
          </div>
          
          <div className="admin-v4-content-inner">
        {error && (
          <div className="message message-error">
            <div className="message-icon">!</div>
            <div className="message-text">{error}</div>
          </div>
        )}
        
        {success && (
          <div className="message message-success">
            <div className="message-icon">✓</div>
            <div className="message-text">{success}</div>
          </div>
        )}
        
        {/* DASHBOARD SECTION */}
        {activeTab === 'dashboard' && stats && (
          <div className="admin-section">
            <h3>ড্যাশবোর্ড</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>মোট ব্যবহারকারী</h4>
                <div className="stat-number">{toBengaliDigits(stats.users || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>সক্রিয় ট্রেন</h4>
                <div className="stat-number">{toBengaliDigits(stats.trains || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>খবর</h4>
                <div className="stat-number">{toBengaliDigits(stats.news || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>সাবমিশন</h4>
                <div className="stat-number">{toBengaliDigits(stats.submissions || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>পণ্য</h4>
                <div className="stat-number">{toBengaliDigits(stats.products || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>পেন্ডিং সাবমিশন</h4>
                <div className="stat-number">{toBengaliDigits(stats.pendingSubmissions || 0)}</div>
              </div>
            </div>
            <div style={{ marginTop: '30px', background: 'var(--bg-white, #fff)', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>সিস্টেম ওভারভিউ</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#f14f29" name="পরিমাণ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '30px', background: 'var(--bg-white, #fff)', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>সাবমিশন স্ট্যাটাস</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* IMPORT BUTTONS SECTION */}
        <div className="admin-section" style={{ display: activeTab === "system" ? "block" : "none" }}>
          <h3>ডাটা ইম্পোর্ট</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleImportStations} 
              disabled={loading}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: Icons.import }}></span>
              স্টেশন ইম্পোর্ট
            </button>
            <button 
              onClick={handleImportTrains} 
              disabled={loading}
              style={{
                background: '#f14f29',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: Icons.import }}></span>
              ট্রেন ইম্পোর্ট
            </button>
          </div>
        </div>
        
        {/* ADD TRAIN SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "trains" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('addTrain')}
          >
            <h3 style={{ margin: 0 }}>ট্রেন যোগ করুন</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.addTrain ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.addTrain && (
            <div className="form-container" style={{ marginTop: '15px' }}>
              <form onSubmit={handleTrainSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ট্রেনের নাম *</label>
                    <input type="text" className="form-input" value={trainForm.name} onChange={(e) => setTrainForm({...trainForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ট্রেন নম্বর *</label>
                    <input type="text" className="form-input" value={trainForm.number} onChange={(e) => setTrainForm({...trainForm, number: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">যাত্রার তারিখ *</label>
                    <input type="date" className="form-input" value={trainForm.journeyDate} onChange={(e) => setTrainForm({...trainForm, journeyDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">স্ট্যাটাস</label>
                    <select className="form-input" value={trainForm.status} onChange={(e) => setTrainForm({...trainForm, status: e.target.value})}>
                      <option value="on-time">সময়মতো</option>
                      <option value="delayed">বিলম্বিত</option>
                      <option value="early">জলদি</option>
                      <option value="cancelled">বাতিল</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">উৎস (From) *</label>
                    <select 
                      className="form-input" 
                      value={trainForm.from} 
                      onChange={(e) => setTrainForm({...trainForm, from: e.target.value})}
                    >
                      <option value="">-- স্টেশন নির্বাচন করুন --</option>
                      {stationsList.map((station) => (
                        <option key={station._id || station.code} value={station.name}>
                          {station.nameBengali} ({station.name})
                        </option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }}
                      placeholder="অথবা ম্যানুয়ালি লিখুন"
                      value={trainForm.from} 
                      onChange={(e) => setTrainForm({...trainForm, from: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">গন্তব্য (To) *</label>
                    <select 
                      className="form-input" 
                      value={trainForm.to} 
                      onChange={(e) => setTrainForm({...trainForm, to: e.target.value})}
                    >
                      <option value="">-- স্টেশন নির্বাচন করুন --</option>
                      {stationsList.map((station) => (
                        <option key={station._id || station.code} value={station.name}>
                          {station.nameBengali} ({station.name})
                        </option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }}
                      placeholder="অথবা ম্যানুয়ালি লিখুন"
                      value={trainForm.to} 
                      onChange={(e) => setTrainForm({...trainForm, to: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">প্রস্থান সময় *</label>
                    <input type="time" className="form-input time-input" value={trainForm.departure} onChange={(e) => setTrainForm({...trainForm, departure: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">আগমন সময় *</label>
                    <input type="time" className="form-input time-input" value={trainForm.arrival} onChange={(e) => setTrainForm({...trainForm, arrival: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">বর্তমান অবস্থান</label>
                    <select 
                      className="form-input" 
                      value={trainForm.currentLocation} 
                      onChange={(e) => setTrainForm({...trainForm, currentLocation: e.target.value})}
                    >
                      <option value="">-- স্টেশন নির্বাচন করুন --</option>
                      {stationsList.map((station) => (
                        <option key={station._id || station.code} value={station.name}>
                          {station.nameBengali} ({station.name})
                        </option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }}
                      placeholder="অথবা ম্যানুয়ালি লিখুন"
                      value={trainForm.currentLocation} 
                      onChange={(e) => setTrainForm({...trainForm, currentLocation: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">পরবর্তী গন্তব্য</label>
                    <select 
                      className="form-input" 
                      value={trainForm.nextStation} 
                      onChange={(e) => setTrainForm({...trainForm, nextStation: e.target.value})}
                    >
                      <option value="">-- স্টেশন নির্বাচন করুন --</option>
                      {stationsList.map((station) => (
                        <option key={station._id || station.code} value={station.name}>
                          {station.nameBengali} ({station.name})
                        </option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ marginTop: '8px' }}
                      placeholder="অথবা ম্যানুয়ালি লিখুন"
                      value={trainForm.nextStation} 
                      onChange={(e) => setTrainForm({...trainForm, nextStation: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">পরবর্তী গন্তব্যে আগমনের সময়</label>
                  <input type="time" className="form-input time-input" value={trainForm.nextArrivalTime} onChange={(e) => setTrainForm({...trainForm, nextArrivalTime: e.target.value})} />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'যোগ করা হচ্ছে...' : 'ট্রেন যোগ করুন'}
                </button>
              </form>
            </div>
          )}
        </div>
                  <div className="admin-section" style={{ display: activeTab === 'news' ? 'block' : 'none' }}>
            <div className="section-header" onClick={() => toggleSection('notices')}>
              <h3>নোটিশ ম্যানেজমেন্ট</h3>
              <div className={`toggle-icon ${sections.notices ? 'expanded' : 'collapsed'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d={sections.notices ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"} />
                </svg>
              </div>
            </div>
            
            {sections.notices && (
              <AdminNoticeManager token={localStorage.getItem('token')} />
            )}
          </div>
        
        {/* TRAIN LIST SECTION - COLLAPSIBLE WITH SEARCH */}
        <div className="admin-section" style={{ display: activeTab === "trains" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('trainList')}
          >
            <h3 style={{ margin: 0 }}>ট্রেনের তালিকা ({toBengaliDigits(trains.length)})</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.trainList ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.trainList && (
            <>
              {/* Search Box */}
              <div style={{ margin: '15px 0', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ট্রেনের নাম, নম্বর, উৎস বা গন্তব্য অনুসন্ধান করুন..."
                  value={trainSearchTerm}
                  onChange={(e) => setTrainSearchTerm(e.target.value)}
                  style={{ flex: 1 }}
                />

              </div>
              {/* UPDATE JOURNEY DATES BUTTON */}
            <div className="admin-section" style={{ display: activeTab === 'trains' ? 'block' : 'none' }}>
              <h3>ট্রেনের তারিখ আপডেট</h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleUpdateAllJourneyDates} 
                  disabled={loading}
                  style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: Icons.refresh }}></span>
                  সকল ট্রেনের তারিখ আজকে সেট করুন
                </button>
                <button 
                  onClick={handleDeleteAllTrains} 
                  disabled={loading}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  সকল ট্রেন মুছুন
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '8px' }}>
                এই বাটন সকল ট্রেনের যাত্রার তারিখ আজকের তারিখে আপডেট করবে। 
                এর ফলে "সমাপ্ত" স্ট্যাটাস চলে যাবে এবং "লাইভ" কাজ করবে।
              </p>
            </div>
            {/* TRAIN COMMENTS SECTION */}
<div className="admin-section" style={{ display: activeTab === "interactions" ? "block" : "none" }}>
  <div className="section-header" onClick={() => toggleSection('trainComments')}>
    <h3>ট্রেন সম্পর্কে মন্তব্য ({trainComments.length})</h3>
    <div className={`toggle-icon ${sections.trainComments ? 'expanded' : 'collapsed'}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d={sections.trainComments ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"} />
      </svg>
    </div>
  </div>
  
              {sections.trainComments && (
                <div style={{ marginTop: '15px' }}>
                  {trainCommentsLoading ? (
                    <p>লোড হচ্ছে...</p>
                  ) : trainComments.length === 0 ? (
                    <p>কোন মন্তব্য নেই</p>
                  ) : (
                    trainComments.map(comment => (
                      <div key={comment._id} style={{
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '15px',
                        marginBottom: '10px',
                        borderLeft: '3px solid #f14f29'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <strong>{comment.nickname || 'বেনামী'}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#6c757d', marginLeft: '10px' }}>
                              ট্রেন ID: {comment.trainId}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#dc3545', marginLeft: '10px' }}>
                              {comment.status === 'pending' ? '(পেন্ডিং)' : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteTrainComment(comment._id)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '0.7rem'
                            }}
                          >
                            মুছুন
                          </button>
                        </div>
                        <p style={{ margin: '8px 0', color: '#495057' }}>{comment.comment}</p>
                        {comment.photo && (
                          <img 
                            src={comment.photo} 
                            alt="comment" 
                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', marginTop: '8px' }}
                          />
                        )}
                        <div style={{ fontSize: '0.65rem', color: '#6c757d', marginTop: '8px' }}>
                          {new Date(comment.createdAt).toLocaleString('bn-BD')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

              <div className="form-group">
                <label className="form-label">সময়সূচী ও বিশেষ তথ্য</label>
                <textarea 
                  name="scheduleText"
                  className="form-textarea" 
                  rows="6"
                  placeholder="যেমন:
              স্টেশন: ঢাকা → টঙ্গী → গাজীপুর → ময়মনসিংহ
              ছুটির দিন: শুক্রবার
              বিশেষ কোচ: এসি সিট, স্নিগ্ধা
              বিঃদ্রঃ: যাত্রার ১ ঘন্টা আগে স্টেশনে উপস্থিত থাকুন"
                  value={editingTrain?.scheduleText || ''} 
                  onChange={handleEditTrainChange}
                />
                <small className="input-hint">এখানে ট্রেনের সম্পূর্ণ সময়সূচী, স্টেশন তালিকা, ছুটির দিন, বিশেষ কোচ এবং অন্যান্য তথ্য লিখুন</small>
              </div>
              
              <div className="data-table-container">
                {filteredTrains.length === 0 ? (
                  <p>কোন ট্রেন পাওয়া যায়নি।</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>নাম</th>
                        <th>নং</th>
                        <th>তারিখ</th>
                        <th>উৎস</th>
                        <th>গন্তব্য</th>
                        <th>প্রস্থান</th>
                        <th>আগমন</th>
                        <th>বর্তমান অবস্থান</th>
                        <th>পরবর্তী গন্তব্য</th>
                        <th>মধ্যবর্তী স্টেশন</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrains.map((train) => (
                        <tr key={train._id}>
                          <td>{train.name}</td>
                          <td>{toBengaliDigits(train.number)}</td>
                          <td>{train.journeyDate ? new Date(train.journeyDate).toLocaleDateString('bn-BD') : '—'}</td>
                          <td>{train.from}</td>
                          <td>{train.to}</td>
                          <td>{train.departure}</td>
                          <td>{train.arrival}</td>
                          <td>{train.currentLocation || '—'}</td>
                          <td>{train.nextStation || '—'}</td>
                          <td>
                            <button 
                              className="route-btn"
                              onClick={() => openRouteModal(train)}
                              style={{
                                background: '#f14f29',
                                color: 'white',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.7rem'
                              }}
                            >
                              {train.intermediateStations?.length || 0} টি স্টেশন
                            </button>
                          </td>
                          <td>
                            <span className={`status-badge status-${train.status}`}>
                              {train.status === 'on-time' ? 'সময়মতো' : train.status === 'delayed' ? 'বিলম্বিত' : train.status === 'early' ? 'জলদি' : 'বাতিল'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="edit-btn" onClick={() => handleOpenEditPopup(train)}>সম্পাদনা</button>
                            <button className="delete-btn" onClick={() => handleDeleteTrain(train._id)}>মুছুন</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* PRODUCTS SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "products" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('products')}
          >
            <h3 style={{ margin: 0 }}>পণ্য ম্যানেজমেন্ট</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.products ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.products && (
            <>
              <div className="form-container">
                <h4>নতুন পণ্য যোগ করুন</h4>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">পণ্যের নাম *</label>
                      <input type="text" className="form-input" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">মূল্য (৳) *</label>
                      <input type="number" className="form-input" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ক্যাটাগরি</label>
                      <select className="form-input" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}>
                        <option value="food">খাবার</option>
                        <option value="beverage">পানীয়</option>
                        <option value="service">সেবা</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">স্টক</label>
                      <input type="number" className="form-input" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">বিবরণ</label>
                    <textarea className="form-textarea" rows="3" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">পণ্যের ছবি</label>
                    <input type="file" className="form-input" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProductImage(file);
                        setProductImagePreview(URL.createObjectURL(file));
                      }
                    }} />
                    {productImagePreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={productImagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'যোগ করা হচ্ছে...' : 'পণ্য যোগ করুন'}
                  </button>
                </form>
              </div>
              <div className="data-table-container">
                <h4>পণ্যের তালিকা ({toBengaliDigits(products.length)})</h4>
                {products.length === 0 ? (
                  <p>কোন পণ্য নেই। উপরের ফর্ম ব্যবহার করে পণ্য যোগ করুন।</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>নাম</th>
                        <th>মূল্য</th>
                        <th>ক্যাটাগরি</th>
                        <th>স্টক</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>৳ {toBengaliDigits(product.price)}</td>
                          <td>{product.category === 'food' ? 'খাবার' : product.category === 'beverage' ? 'পানীয়' : product.category === 'service' ? 'সেবা' : 'অন্যান্য'}</td>
                          <td>{toBengaliDigits(product.stock)}</td>
                          <td>{product.isAvailable ? '✓ উপলব্ধ' : '✗ অনুপলব্ধ'}</td>
                          <td>
                            <button className="delete-btn" onClick={() => handleDeleteProduct(product._id)}>মুছুন</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* SUBMISSIONS SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "interactions" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('submissions')}
          >
            <h3 style={{ margin: 0 }}>সাবমিশন ম্যানেজমেন্ট</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.submissions ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.submissions && (
            <>
              <div className="filter-buttons">
                <button className={`filter-btn ${submissionFilter === 'all' ? 'active' : ''}`} onClick={() => setSubmissionFilter('all')}>সব ({toBengaliDigits(submissions.length)})</button>
                <button className={`filter-btn ${submissionFilter === 'pending' ? 'active' : ''}`} onClick={() => setSubmissionFilter('pending')}>পেন্ডিং ({toBengaliDigits(submissions.filter(s => s.status === 'pending').length)})</button>
                <button className={`filter-btn ${submissionFilter === 'approved' ? 'active' : ''}`} onClick={() => setSubmissionFilter('approved')}>অনুমোদিত ({toBengaliDigits(submissions.filter(s => s.status === 'approved').length)})</button>
                <button className={`filter-btn ${submissionFilter === 'rejected' ? 'active' : ''}`} onClick={() => setSubmissionFilter('rejected')}>প্রত্যাখ্যাত ({toBengaliDigits(submissions.filter(s => s.status === 'rejected').length)})</button>
              </div>
              {getFilteredSubmissions().length === 0 ? (
                <p>কোন সাবমিশন নেই</p>
              ) : (
                <div className="submissions-list">
                  {getFilteredSubmissions().map((sub) => (
                    <div key={sub._id} className="submission-card">
                      <div className="submission-header">
                        <h4>{sub.headline}</h4>
                        <span className={`status-badge ${getStatusClass(sub.status)}`}>{getStatusText(sub.status)}</span>
                      </div>
                      <p className="submission-content">{sub.newsContent?.substring(0, 200)}...</p>
                      <div className="submission-meta">
                        <span>রিপোর্টার: {sub.reporterName}</span>
                        <span>অবস্থান: {sub.reporterLocation}</span>
                        <span>তারিখ: {new Date(sub.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                      {sub.status === 'pending' && (
                        <div className="submission-actions">
                          <button className="approve-btn" onClick={() => handleUpdateSubmissionStatus(sub._id, 'approved')} disabled={loading}>অনুমোদন করুন</button>
                          <button className="reject-btn" onClick={() => handleUpdateSubmissionStatus(sub._id, 'rejected')} disabled={loading}>প্রত্যাখ্যান করুন</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* NEWS SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "news" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('news')}
          >
            <h3 style={{ margin: 0 }}>নিউজ ম্যানেজমেন্ট</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.news ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.news && (
            <>
              <div className="form-container">
                <h4>নতুন নিউজ যোগ করুন</h4>
                <form onSubmit={handleNewsSubmit}>
                  <div className="form-group">
                    <label className="form-label">শিরোনাম *</label>
                    <input type="text" className="form-input" value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ক্যাটাগরি</label>
                    <select className="form-input" value={newsForm.category} onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}>
                      <option value="general">সাধারণ</option>
                      <option value="schedule">সময়সূচী পরিবর্তন</option>
                      <option value="service">সেবা সম্পর্কিত</option>
                      <option value="emergency">জরুরি</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '40px' }}>
                    <label className="form-label">বিস্তারিত *</label>
                    <ReactQuill 
                      value={newsForm.content} 
                      onChange={(value) => setNewsForm({...newsForm, content: value})} 
                      theme="snow"
                      style={{ backgroundColor: 'var(--bg-white, #fff)', minHeight: '150px', marginBottom: '15px' }}
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? 'যোগ করা হচ্ছে...' : 'নিউজ যোগ করুন'}
                  </button>
                </form>
              </div>
              <div className="data-table-container" style={{ marginTop: '30px' }}>
                <h4>নিউজের তালিকা ({toBengaliDigits(newsList.length)})</h4>
              {newsList.length === 0 ? (
                <p>কোন নিউজ নেই।</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>শিরোনাম</th>
                      <th>ক্যাটাগরি</th>
                      <th>তারিখ</th>
                      <th>স্ট্যাটাস</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsList.map((news) => (
                      <tr key={news._id}>
                        <td>{news.title}</td>
                        <td>{news.category}</td>
                        <td>{new Date(news.createdAt).toLocaleDateString('bn-BD')}</td>
                        <td><span className={`status-badge ${news.isActive ? 'status-approved' : 'status-rejected'}`}>{news.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span></td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteNews(news._id)}>মুছুন</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            </>
          )}
        </div>
        
        {/* LOCATION UPDATES SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "interactions" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('locationUpdates')}
          >
            <h3 style={{ margin: 0 }}>লোকেশন আপডেট ম্যানেজমেন্ট</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.locationUpdates ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.locationUpdates && (
            <>
              <div className="filter-buttons">
                <button className={`filter-btn ${locationFilter === 'pending' ? 'active' : ''}`} onClick={() => { setLocationFilter('pending'); fetchLocationUpdates(); }}>পেন্ডিং ({toBengaliDigits(locationUpdates.filter(u => u.status === 'pending').length)})</button>
                <button className={`filter-btn ${locationFilter === 'approved' ? 'active' : ''}`} onClick={() => { setLocationFilter('approved'); fetchLocationUpdates(); }}>অনুমোদিত ({toBengaliDigits(locationUpdates.filter(u => u.status === 'approved').length)})</button>
                <button className={`filter-btn ${locationFilter === 'rejected' ? 'active' : ''}`} onClick={() => { setLocationFilter('rejected'); fetchLocationUpdates(); }}>প্রত্যাখ্যাত ({toBengaliDigits(locationUpdates.filter(u => u.status === 'rejected').length)})</button>
              </div>
              {locationUpdates.length === 0 ? (
                <p>কোন লোকেশন আপডেট নেই</p>
              ) : (
                <div className="submissions-list">
                  {locationUpdates.map((update) => (
                    <div key={update._id} className="submission-card">
                      <div className="submission-header">
                        <h4>ট্রেন: {update.trainName} ({update.trainNumber})</h4>
                        <span className={`status-badge ${update.status === 'pending' ? 'status-pending' : update.status === 'approved' ? 'status-approved' : 'status-rejected'}`}>
                          {update.status === 'pending' ? 'পেন্ডিং' : update.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                        </span>
                      </div>
                      <div className="submission-content">
                        <p><strong>বর্তমান অবস্থান:</strong> {update.currentLocation}</p>
                        <p><strong>পরবর্তী গন্তব্য:</strong> {update.nextStation}</p>
                        {update.arrivalTimeAtNext && <p><strong>আগমনের সময়:</strong> {update.arrivalTimeAtNext}</p>}
                        <p><strong>রিপোর্টার:</strong> {update.reporterName}</p>
                        {update.reporterContact && <p><strong>যোগাযোগ:</strong> {update.reporterContact}</p>}
                        {update.notes && <p><strong>অতিরিক্ত তথ্য:</strong> {update.notes}</p>}
                        <p><strong>জমার তারিখ:</strong> {new Date(update.createdAt).toLocaleString('bn-BD')}</p>
                      </div>
                      {update.status === 'pending' && (
                        <div className="submission-actions">
                          <button className="approve-btn" onClick={() => handleApproveLocation(update._id)} disabled={loading}>অনুমোদন করুন</button>
                          <button className="reject-btn" onClick={() => handleRejectLocation(update._id)} disabled={loading}>প্রত্যাখ্যান করুন</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* USERS SECTION - COLLAPSIBLE */}
        <div className="admin-section" style={{ display: activeTab === "interactions" ? "block" : "none" }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => toggleSection('users')}
          >
            <h3 style={{ margin: 0 }}>ব্যবহারকারী ম্যানেজমেন্ট</h3>
            <span dangerouslySetInnerHTML={{ __html: sections.users ? Icons.collapse : Icons.expand }} />
          </div>
          
          {sections.users && (
            <div className="placeholder-content">
              <p>ব্যবহারকারী ম্যানেজমেন্ট সিস্টেম শীঘ্রই আসছে...</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>

      {/* Edit Train Popup */}
      {showEditPopup && editingTrain && (
        <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEditPopup(false)}>×</button>
            <h3 style={{ color: '#f14f29', marginBottom: '20px', textAlign: 'center' }}>ট্রেন তথ্য সম্পাদনা করুন</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}><strong>{editingTrain.name}</strong> ({editingTrain.number})</p>
            <form onSubmit={handleUpdateTrain}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">উৎস (From)</label>
                  <select name="from" className="form-input" value={editingTrain?.from || ''} onChange={handleEditTrainChange}>
                    <option value="">-- স্টেশন নির্বাচন করুন --</option>
                    {stationsList.map((station) => (
                      <option key={station._id || station.code} value={station.name}>
                        {station.nameBengali} ({station.name})
                      </option>
                    ))}
                  </select>
                  <input type="text" name="from" className="form-input" style={{ marginTop: '8px' }} placeholder="অথবা ম্যানুয়ালি লিখুন" value={editingTrain?.from || ''} onChange={handleEditTrainChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">গন্তব্য (To)</label>
                  <select name="to" className="form-input" value={editingTrain?.to || ''} onChange={handleEditTrainChange}>
                    <option value="">-- স্টেশন নির্বাচন করুন --</option>
                    {stationsList.map((station) => (
                      <option key={station._id || station.code} value={station.name}>
                        {station.nameBengali} ({station.name})
                      </option>
                    ))}
                  </select>
                  <input type="text" name="to" className="form-input" style={{ marginTop: '8px' }} placeholder="অথবা ম্যানুয়ালি লিখুন" value={editingTrain?.to || ''} onChange={handleEditTrainChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">বর্তমান অবস্থান</label>
                <select name="currentLocation" className="form-input" value={editingTrain?.currentLocation || ''} onChange={handleEditTrainChange}>
                  <option value="">-- স্টেশন নির্বাচন করুন --</option>
                  {stationsList.map((station) => (
                    <option key={station._id || station.code} value={station.name}>
                      {station.nameBengali} ({station.name})
                    </option>
                  ))}
                </select>
                <input type="text" name="currentLocation" className="form-input" style={{ marginTop: '8px' }} placeholder="অথবা ম্যানুয়ালি লিখুন" value={editingTrain?.currentLocation || ''} onChange={handleEditTrainChange} />
              </div>
              <div className="form-group">
                <label className="form-label">পরবর্তী গন্তব্য</label>
                <select name="nextStation" className="form-input" value={editingTrain?.nextStation || ''} onChange={handleEditTrainChange}>
                  <option value="">-- স্টেশন নির্বাচন করুন --</option>
                  {stationsList.map((station) => (
                    <option key={station._id || station.code} value={station.name}>
                      {station.nameBengali} ({station.name})
                    </option>
                  ))}
                </select>
                <input type="text" name="nextStation" className="form-input" style={{ marginTop: '8px' }} placeholder="অথবা ম্যানুয়ালি লিখুন" value={editingTrain?.nextStation || ''} onChange={handleEditTrainChange} />
              </div>
              <div className="form-group">
                <label className="form-label">পরবর্তী গন্তব্যে আগমনের সময়</label>
                <input type="time" name="nextArrivalTime" className="form-input time-input" value={editingTrain?.nextArrivalTime || ''} onChange={handleEditTrainChange} />
              </div>
              <div className="form-group">
                <label className="form-label">স্ট্যাটাস</label>
                <select name="status" className="form-input" value={editingTrain?.status || 'on-time'} onChange={handleEditTrainChange}>
                  <option value="on-time">সময়মতো</option>
                  <option value="delayed">বিলম্বিত</option>
                  <option value="early">জলদি</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">স্ট্যাটাস নোট (ঐচ্ছিক)</label>
                <input type="text" name="statusNote" className="form-input" placeholder="যেমন: ২ ঘণ্টা লেট, স্টেশনে দাঁড়িয়ে আছে" value={editingTrain?.statusNote || ''} onChange={handleEditTrainChange} />
              </div>
              <div className="form-group">
                <label className="form-label">বিলম্ব (মিনিট)</label>
                <input type="number" name="delay" className="form-input" value={editingTrain?.delay || 0} onChange={handleEditTrainChange} />
              </div>
              <div className="form-group" style={{ marginBottom: '40px' }}>
                <label className="form-label">সময়সূচী (Schedule)</label>
                <ReactQuill 
                  value={editingTrain?.scheduleText || ''} 
                  onChange={(value) => setEditingTrain(prev => ({ ...prev, scheduleText: value }))} 
                  theme="snow"
                  style={{ backgroundColor: 'var(--bg-white, #fff)', minHeight: '150px', marginBottom: '15px' }}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '20px' }}>{loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Route Stations Modal with Times */}
      {showRouteModal && selectedRouteTrain && (
        <div className="modal-overlay" onClick={() => setShowRouteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setShowRouteModal(false)}>×</button>
            
            <h3 style={{ color: '#f14f29', marginBottom: '10px' }}>
              {selectedRouteTrain.name} - রুট স্টেশন পরিচালনা
            </h3>
            <p style={{ marginBottom: '20px', fontSize: '0.8rem', color: '#6c757d' }}>
              {selectedRouteTrain.from} → {selectedRouteTrain.to}
            </p>
            
            {/* Add Station with Time */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>নতুন স্টেশন যোগ করুন</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select
                  className="form-input"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  style={{ flex: 2 }}
                >
                  <option value="">-- স্টেশন নির্বাচন করুন --</option>
                  {stationsList && stationsList.length > 0 ? (
                    stationsList.map((station) => (
                      <option key={station._id || station.code} value={station.name}>
                        {station.nameBengali || station.name} ({station.name})
                      </option>
                    ))
                  ) : (
                    <option disabled>লোড হচ্ছে...</option>
                  )}
                </select>
                <input
                  type="text"
                  className="form-input"
                  placeholder="অথবা ম্যানুয়ালি"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: '#6c757d' }}>আগমনের সময়</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStationArrival}
                    onChange={(e) => setNewStationArrival(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: '#6c757d' }}>প্রস্থানের সময়</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStationDeparture}
                    onChange={(e) => setNewStationDeparture(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={addStationWithTimes}
                style={{
                  width: '100%',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                স্টেশন যোগ করুন
              </button>
            </div>
            
            {/* Stations List with Editable Times */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '0.9rem' }}>মধ্যবর্তী স্টেশনগুলি</h4>
              {routeStations.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                  কোন মধ্যবর্তী স্টেশন যোগ করা হয়নি
                </p>
              ) : (
                routeStations.map((station, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#fff7ed',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '10px',
                      borderLeft: '3px solid #f14f29'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: '#f14f29' }}>{index + 1}.</strong>{' '}
                        {station.stationNameBengali || station.stationName}
                      </div>
                      <button
                        onClick={() => removeStationFromRoute(index)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.65rem', color: '#6c757d' }}>আগমন</label>
                        <input
                          type="time"
                          className="form-input"
                          value={station.arrivalTime || ''}
                          onChange={(e) => updateStationTime(index, 'arrivalTime', e.target.value)}
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.65rem', color: '#6c757d' }}>প্রস্থান</label>
                        <input
                          type="time"
                          className="form-input"
                          value={station.departureTime || ''}
                          onChange={(e) => updateStationTime(index, 'departureTime', e.target.value)}
                          style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={saveRouteStations}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#f14f29',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'রুট সংরক্ষণ করুন'}
              </button>
              <button
                onClick={() => setShowRouteModal(false)}
                style={{
                  flex: 1,
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
