// Bengali time formatter utilities

/**
 * Convert English digits to Bengali digits
 */
export const toBengaliDigits = (input) => {
  if (input === null || input === undefined) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return input.toString().replace(/\d/g, (digit) => bengaliDigits[digit]);
};

/**
 * Format date to Bengali date string
 */
export const formatToBengaliDate = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return dateObj.toLocaleDateString('bn-BD', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format time string to Bengali time format
 */
export const formatToBengaliTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return '';

  try {
    let hours, minutes;

    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [time, modifier] = timeString.split(' ');
      [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      [hours, minutes] = timeString.split(':').map(Number);
    }

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return timeString;
    }

    const displayHours = hours % 12 || 12;
    
    let bengaliPeriod;
    if (hours >= 4 && hours < 12) {
      bengaliPeriod = 'সকাল';
    } else if (hours >= 12 && hours < 16) {
      bengaliPeriod = 'দুপুর';
    } else if (hours >= 16 && hours < 19) {
      bengaliPeriod = 'বিকাল';
    } else {
      bengaliPeriod = 'রাত';
    }

    const formattedHours = toBengaliDigits(displayHours);
    const formattedMinutes = toBengaliDigits(minutes.toString().padStart(2, '0'));

    return `${formattedHours}:${formattedMinutes} ${bengaliPeriod}`;

  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Get relative time in Bengali
 */
export const getRelativeBengaliTime = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'এক্ষুনি';
    if (diffMins < 60) return `${toBengaliDigits(diffMins)} মিনিট আগে`;
    if (diffHours < 24) return `${toBengaliDigits(diffHours)} ঘন্টা আগে`;
    if (diffDays < 7) return `${toBengaliDigits(diffDays)} দিন আগে`;

    return formatToBengaliDate(date);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

// Default export for convenience
export default {
  formatToBengaliTime,
  formatToBengaliDate,
  getRelativeBengaliTime,
  toBengaliDigits
};