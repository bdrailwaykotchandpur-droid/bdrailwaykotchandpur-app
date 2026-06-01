// trainPositionCalculator.js - Train position calculator with time lock for stations

/**
 * Parse time string (HH:MM) to minutes since midnight
 * Supports both 12-hour (08:30 AM) and 24-hour (08:30) formats
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  
  // Convert any Bengali digits to English digits
  const engDigits = String(timeStr).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
  
  // Detect period modifiers
  let isPM = engDigits.includes('PM') || engDigits.includes('দুপুর') || engDigits.includes('বিকাল') || engDigits.includes('সন্ধ্যা');
  let isAM = engDigits.includes('AM') || engDigits.includes('সকাল');
  let isNight = engDigits.includes('রাত');
  
  // Clean up to just the HH:MM parts
  const cleanTime = engDigits.replace(/সকাল|দুপুর|বিকাল|সন্ধ্যা|রাত|AM|PM/gi, '').trim();
  let [hours, minutes] = cleanTime.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  // 12-hour format adjustments
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  } else if (isNight) {
    // Night is tricky: 12 AM (midnight), 1-5 AM (early morning), 6-11 PM (evening/night)
    if (hours === 12) hours = 0;
    else if (hours >= 6 && hours <= 11) hours += 12;
  }
  
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Get current time in minutes (Bangladesh Time UTC+6)
 */
export const getCurrentMinutes = () => {
  const now = new Date();
  const bangladeshTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  return bangladeshTime.getHours() * 60 + bangladeshTime.getMinutes();
};

/**
 * Get current time string for display
 */
export const getCurrentTimeString = () => {
  const now = new Date();
  const bangladeshTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  const hours = bangladeshTime.getHours();
  const minutes = bangladeshTime.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get all stations with their scheduled times
 * Returns full station list including source and destination
 */
export const getFullStationSchedule = (train, stations) => {
  if (!stations || stations.length === 0) return [];
  
  // Build complete station list with times
  const fullSchedule = [];
  
  // Add source station (departure time)
  fullSchedule.push({
    name: train.from,
    nameBengali: train.from,
    type: 'source',
    sequence: 0,
    arrivalTime: null,
    departureTime: train.departure,
    timeMinutes: parseTimeToMinutes(train.departure),
    isCurrentLocation: false
  });
  
  // Add intermediate stations
  stations.forEach((station, idx) => {
    fullSchedule.push({
      name: station.stationName,
      nameBengali: station.stationNameBengali || station.stationName,
      type: 'intermediate',
      sequence: idx + 1,
      arrivalTime: station.arrivalTime,
      departureTime: station.departureTime,
      timeMinutes: parseTimeToMinutes(station.arrivalTime || station.departureTime),
      isCurrentLocation: false
    });
  });
  
  // Add destination station (arrival time)
  fullSchedule.push({
    name: train.to,
    nameBengali: train.to,
    type: 'destination',
    sequence: stations.length + 1,
    arrivalTime: train.arrival,
    departureTime: null,
    timeMinutes: parseTimeToMinutes(train.arrival),
    isCurrentLocation: false
  });
  
  return fullSchedule;
};

/**
 * Calculate current train position based on time lock at each station
 * Train stays at each station for its scheduled duration
 */
export const calculateTrainPositionWithTimeLock = (train, stations) => {
  if (!stations || stations.length === 0) return 0;
  if (!train) return 0;
  
  const currentMinutes = getCurrentMinutes();
  const fullSchedule = getFullStationSchedule(train, stations);
  
  // If before first station departure - at source
  const firstStationTime = fullSchedule[0]?.timeMinutes;
  if (firstStationTime !== null && currentMinutes < firstStationTime) {
    return 0;
  }
  
  // If after last station arrival - at destination
  const lastStationTime = fullSchedule[fullSchedule.length - 1]?.timeMinutes;
  if (lastStationTime !== null && currentMinutes >= lastStationTime) {
    return fullSchedule.length - 1;
  }
  
  // Find current station based on time lock
  for (let i = 0; i < fullSchedule.length - 1; i++) {
    const currentStation = fullSchedule[i];
    const nextStation = fullSchedule[i + 1];
    
    const currentTime = currentStation.timeMinutes;
    const nextTime = nextStation.timeMinutes;
    
    if (currentTime !== null && nextTime !== null) {
      // If current time is between this station's time and next station's time
      if (currentMinutes >= currentTime && currentMinutes < nextTime) {
        // Check if train is at station (within arrival/departure window)
        if (currentStation.arrivalTime && currentStation.departureTime) {
          const arrivalMinutes = parseTimeToMinutes(currentStation.arrivalTime);
          const departureMinutes = parseTimeToMinutes(currentStation.departureTime);
          
          if (arrivalMinutes !== null && departureMinutes !== null) {
            // If during station halt time (between arrival and departure)
            if (currentMinutes >= arrivalMinutes && currentMinutes < departureMinutes) {
              return i; // Train is at this station
            }
          }
        }
        
        // Train is between stations
        // Calculate progress between stations
        const totalDuration = nextTime - currentTime;
        const elapsed = currentMinutes - currentTime;
        const progress = elapsed / totalDuration;
        
        // Return fractional position for smooth animation
        return i + progress;
      }
    }
  }
  
  return 0;
};

/**
 * Calculate current train position (simple version for UI)
 * Returns station index (0 = source, last = destination)
 */
export const calculateTrainPosition = (train, stations) => {
  const position = calculateTrainPositionWithTimeLock(train, stations);
  // Round to nearest integer for station index
  return Math.round(position);
};

/**
 * Get current station name based on train position
 */
export const getCurrentStation = (train, stations) => {
  if (!stations || stations.length === 0) {
    return train?.currentLocation || 'স্টেশনে';
  }
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const stationIndex = Math.floor(position);
  
  if (fullSchedule[stationIndex]) {
    return fullSchedule[stationIndex].nameBengali || fullSchedule[stationIndex].name;
  }
  return train?.currentLocation || stations[0]?.nameBengali || 'স্টেশনে';
};

/**
 * Get current station object with details
 */
export const getCurrentStationDetails = (train, stations) => {
  if (!stations || stations.length === 0) return null;
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const stationIndex = Math.floor(position);
  const isAtStation = Math.abs(position - stationIndex) < 0.1;
  
  if (fullSchedule[stationIndex]) {
    return {
      ...fullSchedule[stationIndex],
      isAtStation: isAtStation,
      progress: position - stationIndex
    };
  }
  return null;
};

/**
 * Get next station name
 */
export const getNextStation = (train, stations) => {
  if (!stations || stations.length === 0) {
    return train?.nextStation || 'গন্তব্য';
  }
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const currentIndex = Math.floor(position);
  
  // Check if train is exactly at a station and has departure time
  const isAtStation = Math.abs(position - currentIndex) < 0.1;
  const currentStation = fullSchedule[currentIndex];
  
  // If at station and has departure time, and current time is before departure
  if (isAtStation && currentStation && currentStation.departureTime) {
    const currentMinutes = getCurrentMinutes();
    const departureMinutes = parseTimeToMinutes(currentStation.departureTime);
    if (departureMinutes !== null && currentMinutes < departureMinutes) {
      // Still at this station, haven't departed yet
      if (currentIndex + 1 < fullSchedule.length) {
        const nextStation = fullSchedule[currentIndex + 1];
        return nextStation.nameBengali || nextStation.name;
      }
    }
  }
  
  // Otherwise, get next station from current position
  if (currentIndex + 1 < fullSchedule.length) {
    const nextStation = fullSchedule[currentIndex + 1];
    return nextStation.nameBengali || nextStation.name;
  }
  
  return train?.nextStation || 'গন্তব্য';
};

/**
 * Get estimated arrival time at next station
 */
export const getEstimatedArrival = (train, stations) => {
  if (!stations || stations.length === 0) {
    return train?.nextArrivalTime || '';
  }
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const currentIndex = Math.floor(position);
  
  if (currentIndex + 1 < fullSchedule.length) {
    const nextStation = fullSchedule[currentIndex + 1];
    if (nextStation.arrivalTime) {
      return nextStation.arrivalTime;
    }
  }
  return train?.nextArrivalTime || '';
};

/**
 * Check if train is currently moving (between stations)
 */
export const isTrainMoving = (train, stations) => {
  if (!stations || stations.length === 0) return false;
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const currentIndex = Math.floor(position);
  const isAtStation = Math.abs(position - currentIndex) < 0.1;
  
  // Train is moving if:
  // 1. Not exactly at a station
  // 2. Between departure time of current station and arrival time of next station
  // 3. Train status is on-time
  
  if (isAtStation) return false;
  
  const currentMinutes = getCurrentMinutes();
  const departureTime = parseTimeToMinutes(train?.departure);
  const arrivalTime = parseTimeToMinutes(train?.arrival);
  const isWithinJourney = currentMinutes > (departureTime || 0) && currentMinutes < (arrivalTime || 0);
  const isOnTime = train?.status === 'on-time';
  
  return isWithinJourney && isOnTime;
};

/**
 * Check if train is currently halted at a station
 */
export const isTrainHalted = (train, stations) => {
  if (!stations || stations.length === 0) return false;
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const currentIndex = Math.floor(position);
  const isAtStation = Math.abs(position - currentIndex) < 0.1;
  
  if (!isAtStation) return false;
  
  const fullSchedule = getFullStationSchedule(train, stations);
  const currentStation = fullSchedule[currentIndex];
  
  if (currentStation && currentStation.arrivalTime && currentStation.departureTime) {
    const currentMinutes = getCurrentMinutes();
    const arrivalMinutes = parseTimeToMinutes(currentStation.arrivalTime);
    const departureMinutes = parseTimeToMinutes(currentStation.departureTime);
    
    if (arrivalMinutes !== null && departureMinutes !== null) {
      return currentMinutes >= arrivalMinutes && currentMinutes < departureMinutes;
    }
  }
  
  return false;
};

/**
 * Get station halt duration in minutes
 */
export const getStationHaltDuration = (station) => {
  if (!station.arrivalTime || !station.departureTime) return 0;
  
  const arrival = parseTimeToMinutes(station.arrivalTime);
  const departure = parseTimeToMinutes(station.departureTime);
  
  if (arrival === null || departure === null) return 0;
  
  let duration = departure - arrival;
  if (duration < 0) duration += 1440;
  
  return duration;
};

/**
 * Get progress percentage for UI (0-100)
 */
export const getProgressPercentage = (train, stations) => {
  if (!stations || stations.length === 0) return 0;
  
  const position = calculateTrainPositionWithTimeLock(train, stations);
  const fullSchedule = getFullStationSchedule(train, stations);
  const maxIndex = fullSchedule.length - 1;
  
  return (position / maxIndex) * 100;
};

/**
 * Get delay status
 */
export const getDelayStatus = (train) => {
  if (!train) return { isDelayed: false, delayMinutes: 0 };
  
  if (train.status === 'delayed' && train.delay) {
    return {
      isDelayed: true,
      delayMinutes: train.delay,
      newArrivalTime: addMinutesToTime(train.arrival, train.delay)
    };
  }
  
  return {
    isDelayed: false,
    delayMinutes: 0,
    newArrivalTime: train.arrival
  };
};

/**
 * Add minutes to a time string
 */
const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr) return timeStr;
  
  let totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes === null) return timeStr;
  
  totalMinutes += minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Default export
export default {
  parseTimeToMinutes,
  getCurrentMinutes,
  getCurrentTimeString,
  getFullStationSchedule,
  calculateTrainPosition,
  calculateTrainPositionWithTimeLock,
  getCurrentStation,
  getCurrentStationDetails,
  getNextStation,
  getEstimatedArrival,
  isTrainMoving,
  isTrainHalted,
  getStationHaltDuration,
  getProgressPercentage,
  getDelayStatus
};