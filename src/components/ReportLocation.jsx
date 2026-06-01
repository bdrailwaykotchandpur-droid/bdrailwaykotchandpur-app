import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>আপনি এখানে ক্লিক করেছেন</Popup>
    </Marker>
  );
};

const ReportLocation = ({ train, onSubmit }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLocation) {
      alert('মানচিত্রে ট্রেনের অবস্থান নির্বাচন করুন');
      return;
    }
    if (!reporterName) {
      alert('আপনার নাম লিখুন');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        trainId: train._id,
        trainNumber: train.number,
        trainName: train.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        reporterName,
        reporterContact
      });
      setSelectedLocation(null);
      setReporterName('');
      setReporterContact('');
    } catch (error) {
      console.error('Error submitting location:', error);
      alert('লোকেশন জমা দিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-location-container">
      <h3>{train?.name} - বর্তমান অবস্থান রিপোর্ট করুন</h3>
      <p style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '15px' }}>
        মানচিত্রে ট্রেনের বর্তমান অবস্থানে ক্লিক করুন
      </p>
      
      <div style={{ height: '400px', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={setSelectedLocation} />
        </MapContainer>
      </div>
      
      {selectedLocation && (
        <div style={{ marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
          <strong>নির্বাচিত অবস্থান:</strong><br />
          অক্ষাংশ: {selectedLocation.lat.toFixed(6)}<br />
          দ্রাঘিমাংশ: {selectedLocation.lng.toFixed(6)}
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label">আপনার নাম *</label>
        <input
          type="text"
          className="form-input"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          placeholder="আপনার পুরো নাম"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">যোগাযোগের নম্বর (ঐচ্ছিক)</label>
        <input
          type="text"
          className="form-input"
          value={reporterContact}
          onChange={(e) => setReporterContact(e.target.value)}
          placeholder="০১XXXXXXXXX"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="submit-btn"
      >
        {loading ? 'জমা হচ্ছে...' : 'লোকেশন জমা দিন'}
      </button>
    </div>
  );
};

export default ReportLocation;
