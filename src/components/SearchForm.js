import React, { useState } from 'react';
import { validateSearchParams } from '../utils/helpers';
import '../styles/SearchForm.css';

/**
 * SearchForm component for user input collection
 * Handles form validation and submission
 * @param {Function} onSearch - Callback function to handle search submission
 */
const SearchForm = ({ onSearch }) => {
  // Form state management
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'one-way',
    passengers: 1,
    travelClass: 'economy'
  });

  const [errors, setErrors] = useState({});

  /**
   * Handle input field changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };



  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateSearchParams(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and submit search
    setErrors({});
    onSearch(formData);
  };

  /**
   * Get minimum date (today) for date inputs
   */
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  /**
   * Get minimum return date (departure date)
   */
  const getMinReturnDate = () => {
    return formData.departureDate || getMinDate();
  };

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <h2>✈️ Search Flight Tickets</h2>
        
        {/* Trip type selection */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tripType">Trip Type</label>
            <select
              id="tripType"
              name="tripType"
              value={formData.tripType}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="one-way">One Way</option>
              <option value="round-trip">Round Trip</option>
            </select>
          </div>
        </div>

        {/* Origin and Destination */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origin">From</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              placeholder="Enter airport code (e.g., LAX, JFK)"
              className={`form-input ${errors.origin ? 'error' : ''}`}
            />
            {errors.origin && <span className="error-text">{errors.origin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="destination">To</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Enter airport code (e.g., LHR, CDG)"
              className={`form-input ${errors.destination ? 'error' : ''}`}
            />
            {errors.destination && <span className="error-text">{errors.destination}</span>}
          </div>
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="departureDate">Departure Date</label>
            <input
              type="date"
              id="departureDate"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleInputChange}
              min={getMinDate()}
              className={`form-input ${errors.departureDate ? 'error' : ''}`}
            />
            {errors.departureDate && <span className="error-text">{errors.departureDate}</span>}
          </div>

          {formData.tripType === 'round-trip' && (
            <div className="form-group">
              <label htmlFor="returnDate">Return Date</label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={getMinReturnDate()}
                className={`form-input ${errors.returnDate ? 'error' : ''}`}
              />
              {errors.returnDate && <span className="error-text">{errors.returnDate}</span>}
            </div>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="passengers">Passengers</label>
            <select
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              className="form-input"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="travelClass">Travel Class</label>
            <select
              id="travelClass"
              name="travelClass"
              value={formData.travelClass}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button type="submit" className="search-button">
          🔍 Search Flights
        </button>
      </form>
    </div>
  );
};

export default SearchForm;