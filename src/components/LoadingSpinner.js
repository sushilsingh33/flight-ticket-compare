import React from 'react';
import '../styles/LoadingSpinner.css';

/**
 * LoadingSpinner component to show loading state during API calls
 * Provides visual feedback to users while waiting for search results
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loading-text">
        <h3>Searching for the best deals...</h3>
        <p>We're comparing prices across multiple providers</p>
      </div>
      <div className="loading-steps">
        <div className="step active">🔍 Searching flights</div>
        <div className="step">💰 Comparing prices</div>
        <div className="step">📋 Preparing results</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;