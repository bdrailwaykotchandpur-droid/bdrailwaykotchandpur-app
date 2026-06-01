import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTrain, FaNewspaper, FaDonate, FaInfoCircle } from 'react-icons/fa';
import './BottomTabs.css';

const BottomTabs = () => {
  return (
    <div className="bottom-tabs">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'tab-item active' : 'tab-item')} title="হোম">
        <FaHome className="tab-icon" />
        <span className="tab-label">হোম</span>
      </NavLink>
      <NavLink to="/ticket" className={({ isActive }) => (isActive ? 'tab-item active' : 'tab-item')} title="ট্রেন">
        <FaTrain className="tab-icon" />
        <span className="tab-label">ট্রেন</span>
      </NavLink>
      <NavLink to="/news" className={({ isActive }) => (isActive ? 'tab-item active' : 'tab-item')} title="খবর">
        <FaNewspaper className="tab-icon" />
        <span className="tab-label">খবর</span>
      </NavLink>
      <NavLink to="/donate" className={({ isActive }) => (isActive ? 'tab-item active' : 'tab-item')} title="ডোনেশন">
        <FaDonate className="tab-icon" />
        <span className="tab-label">ডোনেশন</span>
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => (isActive ? 'tab-item active' : 'tab-item')} title="সম্পর্কে">
        <FaInfoCircle className="tab-icon" />
        <span className="tab-label">সম্পর্কে</span>
      </NavLink>
    </div>
  );
};

export default BottomTabs;
