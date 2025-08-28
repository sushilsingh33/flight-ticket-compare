import React, { useState } from 'react';
import { formatDuration, formatTime } from '../utils/helpers';
import '../styles/TicketCard.css';

/**
 * Enhanced TicketCard component with modern UI/UX
 * Features: Price alerts, quick filters, enhanced visual design
 * @param {Object} ticket - Ticket data object
 */
const TicketCard = ({ ticket }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  /**
   * Get airline logo URL with fallback system
   * @param {string} airlineCode - IATA airline code
   * @param {string} airlineName - Airline name for fallback
   */
  const getAirlineLogo = (airlineCode, airlineName) => {
    // Try multiple logo sources with fallbacks
    const logoUrls = [
      // Primary source - Airline logos API
      `https://daisycon.io/images/airline/?width=48&height=48&color=ffffff&iata=${airlineCode}`,
      // Secondary source - Alternative logo service
      `https://logo.clearbit.com/${airlineCode.toLowerCase()}.com`,
      // Tertiary source - Generic airline logo
      `https://via.placeholder.com/48x48/667eea/ffffff?text=${airlineCode}`
    ];

    return logoUrls[0]; // Use the primary source, browser will fallback automatically
  };

  /**
   * Handle image load error with fallback
   * @param {Event} event - Image error event
   * @param {string} airlineCode - Airline code for fallback
   */
  const handleImageError = (event, airlineCode) => {
    // Create a fallback with airline code
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 48, 48);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 48, 48);
    
    // Add airline code text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(airlineCode, 24, 24);
    
    // Set the fallback image
    event.target.src = canvas.toDataURL();
  };

  /**
   * Format price with currency symbol
   * @param {number} price - Price value
   * @param {string} currency - Currency code
   */
  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  /**
   * Get stop information display text
   * @param {number} stops - Number of stops
   */
  const getStopText = (stops) => {
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  /**
   * Get price trend indicator
   */
  const getPriceTrend = () => {
    if (ticket.originalPrice && ticket.originalPrice > ticket.price) {
      const savings = ticket.originalPrice - ticket.price;
      const savingsPercent = Math.round((savings / ticket.originalPrice) * 100);
      return { type: 'decrease', savings, savingsPercent };
    }
    return null;
  };

  /**
   * Calculate and format duration if not provided
   * @param {string} departureTime - Departure time
   * @param {string} arrivalTime - Arrival time
   * @param {string} providedDuration - Duration from ticket data
   */
  const getDuration = (departureTime, arrivalTime, providedDuration) => {
    if (providedDuration && providedDuration !== 'N/A') {
      return formatDuration ? formatDuration(providedDuration) : providedDuration;
    }

    // Calculate duration if not provided
    try {
      const departure = new Date(departureTime);
      const arrival = new Date(arrivalTime);
      const diffMs = arrival.getTime() - departure.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      // If calculation fails, return a default
      return '1h 0m';
    }
  };

  const priceTrend = getPriceTrend();

  return (
    <div className={`ticket-card ${isExpanded ? 'expanded' : ''} ${priceTrend ? 'has-savings' : ''}`}>
      {/* Card Header with Airline Info */}
      <div className="ticket-header">
        <div className="airline-info">
          <img 
            src={getAirlineLogo(ticket.airline.code, ticket.airline.name)} 
            alt={`${ticket.airline.name} logo`}
            className="airline-logo"
            onError={(e) => handleImageError(e, ticket.airline.code)}
          />
          <div className="airline-details">
            <span className="airline-name">{ticket.airline.name}</span>
            <span className="flight-number">{ticket.flightNumber}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="ticket-type">
            <span className="class-badge">{ticket.class}</span>
          </div>
          
          {/* Price Alert Button */}
          <button 
            className="price-alert-btn"
            onClick={() => setShowPriceAlert(!showPriceAlert)}
            title="Set price alert"
          >
            🔔
          </button>
        </div>
      </div>

      {/* Flight Route Information */}
      <div className="flight-route">
        <div className="route-point">
          <div className="airport-code">{ticket.origin.code}</div>
          <div className="airport-name">{ticket.origin.name}</div>
          <div className="departure-time">{formatTime ? formatTime(ticket.departureTime) : ticket.departureTime}</div>
        </div>

        <div className="route-info">
          <div className="flight-duration">
            <span className="duration-text">
              {getDuration(ticket.departureTime, ticket.arrivalTime, ticket.duration)}
            </span>
          </div>
          <div className="route-line">
            <div className="line"></div>
            <div className="plane-icon">✈️</div>
            <div className="line"></div>
          </div>
          <div className="stops-info">
            <span className="stops-text">{getStopText(ticket.stops)}</span>
          </div>
        </div>

        <div className="route-point">
          <div className="airport-code">{ticket.destination.code}</div>
          <div className="airport-name">{ticket.destination.name}</div>
          <div className="arrival-time">{formatTime ? formatTime(ticket.arrivalTime) : ticket.arrivalTime}</div>
        </div>
      </div>

      {/* Layover Information */}
      {ticket.layover && ticket.layover.length > 0 && (
        <div className="layover-info">
          <span className="layover-text">
            Layover in {ticket.layover.join(', ')}
          </span>
        </div>
      )}

      {/* Pricing Section */}
      <div className="pricing-section">
        <div className="price-main">
          <div className="current-price">
            {formatPrice(ticket.price, ticket.currency)}
          </div>
          {priceTrend && (
            <div className="price-savings">
              <span className="savings-badge">
                Save {formatPrice(priceTrend.savings, ticket.currency)} ({priceTrend.savingsPercent}%)
              </span>
              <span className="original-price">
                {formatPrice(ticket.originalPrice, ticket.currency)}
              </span>
            </div>
          )}
        </div>
        
        <div className="price-details">
          <span className="per-person">per person</span>
          <span className="provider">via {ticket.provider}</span>
        </div>
      </div>

      {/* Expandable Section */}
      <div className="expandable-section">
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
          <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
        </button>

        {isExpanded && (
          <div className="expanded-details">
            {/* Amenities */}
            <div className="amenities-section">
              <h4>Included Amenities</h4>
              <div className="amenities-grid">
                {ticket.amenities && ticket.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Baggage Information */}
            {ticket.baggage && (
              <div className="baggage-section">
                <h4>Baggage Allowance</h4>
                <div className="baggage-info">
                  <div className="baggage-item">
                    <span className="baggage-icon">🎒</span>
                    <span className="baggage-text">{ticket.baggage.carryOn}</span>
                  </div>
                  <div className="baggage-item">
                    <span className="baggage-icon">🧳</span>
                    <span className="baggage-text">{ticket.baggage.checkedBags}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Details */}
            <div className="flight-details-section">
              <h4>Flight Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Flight Number</span>
                  <span className="detail-value">{ticket.flightNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">
                    {getDuration(ticket.departureTime, ticket.arrivalTime, ticket.duration)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Stops</span>
                  <span className="detail-value">{getStopText(ticket.stops)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Class</span>
                  <span className="detail-value">{ticket.class}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Alert Modal */}
      {showPriceAlert && (
        <div className="price-alert-modal">
          <div className="modal-content">
            <h3>Set Price Alert</h3>
            <p>Get notified when prices drop for this flight</p>
            <div className="alert-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="email-input"
              />
              <input 
                type="number" 
                placeholder="Target price"
                className="price-input"
              />
              <div className="alert-buttons">
                <button className="set-alert-btn">Set Alert</button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowPriceAlert(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCard;