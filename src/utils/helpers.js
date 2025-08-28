/**
 * Utility functions for data validation, formatting, and common operations
 */

/**
 * Validate search form parameters
 * @param {Object} searchParams - Form data to validate
 * @returns {Object} Object containing validation errors
 */
export const validateSearchParams = (searchParams) => {
  const errors = {};

  // Validate origin
  if (!searchParams.origin || searchParams.origin.trim().length < 2) {
    errors.origin = 'Please enter a valid origin city or airport';
  }

  // Validate destination
  if (!searchParams.destination || searchParams.destination.trim().length < 2) {
    errors.destination = 'Please enter a valid destination city or airport';
  }

  // Check if origin and destination are the same
  if (searchParams.origin && searchParams.destination && 
      searchParams.origin.toLowerCase().trim() === searchParams.destination.toLowerCase().trim()) {
    errors.destination = 'Destination must be different from origin';
  }

  // Validate departure date
  if (!searchParams.departureDate) {
    errors.departureDate = 'Please select a departure date';
  } else {
    const departureDate = new Date(searchParams.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (departureDate < today) {
      errors.departureDate = 'Departure date must be today or in the future';
    }
  }

  // Validate return date for round-trip
  if (searchParams.tripType === 'round-trip') {
    if (!searchParams.returnDate) {
      errors.returnDate = 'Please select a return date';
    } else if (searchParams.departureDate) {
      const departureDate = new Date(searchParams.departureDate);
      const returnDate = new Date(searchParams.returnDate);

      if (returnDate <= departureDate) {
        errors.returnDate = 'Return date must be after departure date';
      }
    }
  }

  // Validate passengers
  if (searchParams.passengers < 1 || searchParams.passengers > 9) {
    errors.passengers = 'Number of passengers must be between 1 and 9';
  }

  return errors;
};

/**
 * Format flight duration from minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format time string for display
 * @param {string} timeString - ISO time string or time in HH:MM format
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString) => {
  try {
    if (!timeString) return 'N/A';

    let date;
    
    // Handle ISO date string
    if (timeString.includes('T') || timeString.includes('Z')) {
      date = new Date(timeString);
    } else {
      // Handle time-only string (HH:MM)
      const [hours, minutes] = timeString.split(':');
      date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
    }

    // Format to 12-hour time with AM/PM
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'N/A';
  }
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string or date string
 * @returns {string} Formatted date string (e.g., "Mon, Jan 15")
 */
export const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Calculate the number of days between two dates
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {number} Number of days between dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sort tickets by various criteria
 * @param {Array} tickets - Array of ticket objects
 * @param {string} sortBy - Sort criteria ('price', 'duration', 'departure', 'arrival')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted tickets array
 */
export const sortTickets = (tickets, sortBy = 'price', order = 'asc') => {
  if (!tickets || !Array.isArray(tickets)) return [];

  const sortedTickets = [...tickets];

  sortedTickets.sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;
      case 'duration':
        valueA = a.duration;
        valueB = b.duration;
        break;
      case 'departure':
        valueA = new Date(a.departureTime).getTime();
        valueB = new Date(b.departureTime).getTime();
        break;
      case 'arrival':
        valueA = new Date(a.arrivalTime).getTime();
        valueB = new Date(b.arrivalTime).getTime();
        break;
      default:
        valueA = a.price;
        valueB = b.price;
    }

    if (order === 'desc') {
      return valueB - valueA;
    }
    return valueA - valueB;
  });

  return sortedTickets;
};

/**
 * Filter tickets based on criteria
 * @param {Array} tickets - Array of ticket objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered tickets array
 */
export const filterTickets = (tickets, filters) => {
  if (!tickets || !Array.isArray(tickets)) return [];
  if (!filters || Object.keys(filters).length === 0) return tickets;

  return tickets.filter(ticket => {
    // Price range filter
    if (filters.minPrice && ticket.price < filters.minPrice) return false;
    if (filters.maxPrice && ticket.price > filters.maxPrice) return false;

    // Duration filter
    if (filters.maxDuration && ticket.duration > filters.maxDuration) return false;

    // Stops filter
    if (filters.directOnly && ticket.stops > 0) return false;
    if (filters.maxStops && ticket.stops > filters.maxStops) return false;

    // Airline filter
    if (filters.airlines && filters.airlines.length > 0) {
      if (!filters.airlines.includes(ticket.airline.code)) return false;
    }

    // Time of day filter (departure)
    if (filters.departureTime) {
      const departureHour = new Date(ticket.departureTime).getHours();
      const timeSlot = getTimeSlot(departureHour);
      if (filters.departureTime !== timeSlot) return false;
    }

    return true;
  });
};

/**
 * Get time slot for a given hour
 * @param {number} hour - Hour in 24-hour format
 * @returns {string} Time slot ('morning', 'afternoon', 'evening', 'night')
 */
export const getTimeSlot = (hour) => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Generate unique ID for components
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID string
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a string is a valid airport code (3 letters)
 * @param {string} code - Airport code to validate
 * @returns {boolean} True if valid airport code
 */
export const isValidAirportCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z]{3}$/.test(code.toUpperCase());
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Get relative time string (e.g., "in 2 hours", "3 days ago")
 * @param {string} dateString - Date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);

    if (Math.abs(diffInSeconds) < 60) return 'now';

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
      if (count > 0) {
        const prefix = diffInSeconds > 0 ? 'in' : '';
        const suffix = diffInSeconds < 0 ? 'ago' : '';
        const plural = count > 1 ? 's' : '';
        return `${prefix} ${count} ${interval.label}${plural} ${suffix}`.trim();
      }
    }

    return 'now';
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'N/A';
  }
};

/**
 * Get airport suggestions for autocomplete
 * @param {string} query - Search query
 * @returns {Promise<Array>} Promise resolving to array of airport suggestions
 */
export const getAirportSuggestions = async (query) => {
  try {
    // Return empty array - no hardcoded airport data
    // In a real application, this would call an airport API
    console.log('Airport suggestions requested for:', query);
    return [];

  } catch (error) {
    console.error('Airport suggestion error:', error);
    return [];
  }
};