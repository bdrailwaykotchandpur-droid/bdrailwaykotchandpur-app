import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Station icon
const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const FitBounds = ({ trains }) => {
  const map = useMap();
  React.useEffect(() => {
    if (trains && trains.length > 0) {
      const bounds = L.latLngBounds();
      let hasValidLocation = false;
      
      trains.forEach(train => {
        if (train.location && typeof train.location === 'object') {
          if (train.location.lat && train.location.lng) {
            bounds.extend([train.location.lat, train.location.lng]);
            hasValidLocation = true;
          }
        }
      });
      
      if (hasValidLocation && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Default to Dhaka center
        map.setView([23.8103, 90.4125], 7);
      }
    }
  }, [trains, map]);
  return null;
};

const RailwayMap = ({ trains, stations, onTrainClick }) => {
  const defaultCenter = [23.8103, 90.4125]; // Dhaka

  // Filter trains that have valid location data
  const trainsWithLocation = trains?.filter(train => 
    train.location && 
    typeof train.location === 'object' && 
    train.location.lat && 
    train.location.lng
  ) || [];

  // Filter stations that have valid coordinates
  const stationsWithLocation = stations?.filter(station =>
    station.latitude && station.longitude
  ) || [];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      {/* Base map tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* OpenRailwayMap overlay */}
      <TileLayer
        attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
        opacity={0.5}
      />

      {/* Stations with coordinates */}
      {stationsWithLocation.map((station) => (
        <Marker
          key={station._id}
          position={[station.latitude, station.longitude]}
          icon={stationIcon}
        >
          <Popup>
            <div>
              <strong>{station.nameBengali || station.name}</strong><br />
              {station.name}<br />
              <small>বিভাগ: {station.division || 'N/A'}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Trains with live location */}
      {trainsWithLocation.map((train) => (
        <Marker
          key={train._id}
          position={[train.location.lat, train.location.lng]}
          icon={trainIcon}
          eventHandlers={{
            click: () => onTrainClick && onTrainClick(train)
          }}
        >
          <Popup>
            <div>
              <strong>{train.name}</strong> ({train.number})<br />
              <span>বর্তমান অবস্থান: {train.currentLocation || train.location.station || 'অজানা'}</span><br />
              <span>স্ট্যাটাস: {train.status === 'on-time' ? 'সময়মতো' : train.status === 'delayed' ? 'বিলম্বিত' : 'বাতিল'}</span><br />
              <span>শেষ আপডেট: {train.location.updatedAt ? new Date(train.location.updatedAt).toLocaleString('bn-BD') : 'N/A'}</span>
              <button 
                onClick={() => onTrainClick && onTrainClick(train)}
                style={{
                  marginTop: '8px',
                  padding: '4px 12px',
                  background: '#f14f29',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                বিস্তারিত
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Show message if no trains with location */}
      {trainsWithLocation.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          কোন লাইভ ট্রেন লোকেশন নেই
        </div>
      )}

      <FitBounds trains={trainsWithLocation} />
    </MapContainer>
  );
};

export default RailwayMap;
