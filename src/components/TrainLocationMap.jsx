import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom train icon
const trainIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const TrainLocationMap = ({ train, onClose }) => {
  // Default center - Dhaka if no location
  const defaultCenter = [23.8103, 90.4125];
  
  // Use train's location if available, otherwise default
  const trainPosition = train?.location?.lat && train?.location?.lng 
    ? [train.location.lat, train.location.lng]
    : defaultCenter;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h3 style={{ color: '#f14f29', marginBottom: '5px' }}>
          {train?.name} ({train?.number})
        </h3>
        <p style={{ marginBottom: '15px', fontSize: '0.8rem', color: '#6c757d' }}>
          {train?.from} → {train?.to}
        </p>
        
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
          <MapContainer
            center={trainPosition}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={trainPosition} icon={trainIcon}>
              <Popup>
                <div>
                  <strong>{train?.name}</strong><br />
                  {train?.number}<br />
                  {train?.currentLocation ? (
                    <>বর্তমান অবস্থান: {train?.currentLocation}</>
                  ) : (
                    <>অবস্থান: {trainPosition[0].toFixed(4)}, {trainPosition[1].toFixed(4)}</>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6c757d' }}>
            <strong>বর্তমান অবস্থান:</strong> {train?.currentLocation || 'তথ্য নেই'}
          </p>
          <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#6c757d' }}>
            <strong>পরবর্তী গন্তব্য:</strong> {train?.nextStation || 'তথ্য নেই'} | 
            <strong> পৌঁছানোর সময়:</strong> {train?.nextArrivalTime || '—'}
          </p>
        </div>
        
        <button
          onClick={onClose}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            background: '#f14f29',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer'
          }}
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};

export default TrainLocationMap;
