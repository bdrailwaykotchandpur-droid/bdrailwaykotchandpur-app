// TrainLocationFavicon.js - Updates favicon based on train's current location

// Your train icon SVG template
const getTrainIconSVG = (color = '#f14f29') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="${color}" transform="translate(6,3)"
    d="M0 0 C3.96 0 7.92 0 12 0 C12 0.66 12 1.32 12 2 C12.99 2 13.98 2 15 2 C15 7.28 15 12.56 15 18 C14.01 18 13.02 18 12 18 C12 18.66 12 19.32 12 20 C11.34 20 10.68 20 10 20 C10 19.34 10 18.68 10 18 C7.36 18 4.72 18 2 18 C2 18.66 2 19.32 2 20 C1.34 20 0.68 20 0 20 C0 19.34 0 18.68 0 18 C-0.99 18 -1.98 18 -3 18 C-3 12.72 -3 7.44 -3 2 C-2.01 2 -1.02 2 0 2 C0 1.34 0 0.68 0 0 Z M-1 6 C-1 7.65 -1 9.3 -1 11 C3.62 11 8.24 11 13 11 C13 9.35 13 7.7 13 6 C8.38 6 3.76 6 -1 6 Z"
  />
</svg>`;

// Station marker icon
const getStationIconSVG = (stationName, isCurrent = false) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="${isCurrent ? '#f14f29' : '#6c757d'}" stroke="white" stroke-width="2"/>
  <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${stationName.charAt(0)}</text>
</svg>`;

// Create favicon with train at specific station position
const updateFaviconWithTrainPosition = (currentStationIndex, totalStations, stationNames = []) => {
  if (totalStations === 0) return;
  
  // Calculate position percentage (0 to 100)
  const positionPercent = (currentStationIndex / (totalStations - 1)) * 100;
  
  // Create canvas for favicon
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, 64, 64);
  
  // Draw track line (horizontal line representing route)
  ctx.beginPath();
  ctx.moveTo(10, 32);
  ctx.lineTo(54, 32);
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw stations (dots on the line)
  for (let i = 0; i < totalStations; i++) {
    const x = 10 + (i / (totalStations - 1)) * 44;
    ctx.beginPath();
    ctx.arc(x, 32, 4, 0, 2 * Math.PI);
    ctx.fillStyle = i === currentStationIndex ? '#f14f29' : '#adb5bd';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Add station name label (first letter)
    if (stationNames[i] && (i === 0 || i === totalStations - 1 || i === currentStationIndex)) {
      ctx.fillStyle = '#495057';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stationNames[i].charAt(0), x, 45);
    }
  }
  
  // Draw train icon at current position
  const trainX = 10 + (currentStationIndex / (totalStations - 1)) * 44;
  const trainY = 32;
  
  // Load and draw train SVG
  const img = new Image();
  const svgData = getTrainIconSVG('#f14f29');
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svgData);
  
  img.onload = () => {
    ctx.drawImage(img, trainX - 10, trainY - 10, 20, 20);
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  };
};

// Simple version: just update favicon color based on train status
const updateSimpleFavicon = (isMoving = false, delayMinutes = 0) => {
  let color = '#f14f29'; // default orange
  
  if (isMoving) {
    color = '#28a745'; // green for moving
  }
  if (delayMinutes > 15) {
    color = '#dc3545'; // red for heavily delayed
  }
  
  const svg = getTrainIconSVG(color);
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/svg+xml';
  link.rel = 'shortcut icon';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  document.getElementsByTagName('head')[0].appendChild(link);
};

// Advanced: Update favicon with full route visualization
const updateAdvancedFavicon = async (trainId, currentLocation, allStations) => {
  try {
    // Fetch train route
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://bdrailwaykotchandpur.onrender.com'}/api/train-routes/${trainId}`,
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
    );
    const data = await response.json();
    
    if (data.success && data.data && data.data.stations) {
      const stations = data.data.stations;
      const currentIndex = stations.findIndex(s => 
        s.name === currentLocation || s.nameBengali === currentLocation
      );
      
      if (currentIndex !== -1) {
        const stationNames = stations.map(s => s.name);
        updateFaviconWithTrainPosition(currentIndex, stations.length, stationNames);
        return;
      }
    }
    
    // Fallback to simple favicon
    updateSimpleFavicon(true, 0);
  } catch (error) {
    console.error('Error updating advanced favicon:', error);
    updateSimpleFavicon(true, 0);
  }
};

// Auto-update favicon every 10 seconds for moving trains
let faviconInterval = null;

const startFaviconUpdater = (trainId, currentLocation, allStations) => {
  if (faviconInterval) clearInterval(faviconInterval);
  
  faviconInterval = setInterval(() => {
    updateAdvancedFavicon(trainId, currentLocation, allStations);
  }, 10000); // Update every 10 seconds
};

const stopFaviconUpdater = () => {
  if (faviconInterval) {
    clearInterval(faviconInterval);
    faviconInterval = null;
  }
};

export {
  getTrainIconSVG,
  getStationIconSVG,
  updateFaviconWithTrainPosition,
  updateSimpleFavicon,
  updateAdvancedFavicon,
  startFaviconUpdater,
  stopFaviconUpdater
};
