import React from 'react';

/**
 * ErrorMessage component to display error messages to users
 * Provides user-friendly error feedback with helpful suggestions
 * Sanitizes error messages to prevent exposure of sensitive information
 * @param {string|Error} error - Error message or Error object to display
 * @param {boolean} enableConsoleLog - Whether to log errors to console (default: false)
 */
const ErrorMessage = ({ error, enableConsoleLog = false }) => {
  /**
   * Sanitize URLs to remove API keys and sensitive parameters
   * @param {string} url - URL that might contain sensitive information
   * @returns {string} - Sanitized URL safe for logging
   */
  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    
    try {
      const urlObj = new URL(url);
      
      // Replace API key in path segments with placeholder
      const pathSegments = urlObj.pathname.split('/');
      const sanitizedSegments = pathSegments.map(segment => {
        // Check if segment looks like an API key (long alphanumeric string)
        if (/^[a-zA-Z0-9]{20,}$/.test(segment)) {
          return '[API_KEY_REDACTED]';
        }
        return segment;
      });
      
      urlObj.pathname = sanitizedSegments.join('/');
      
      // Remove sensitive query parameters
      const sensitiveParams = ['key', 'api_key', 'apikey', 'token', 'secret', 'auth'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      
      return urlObj.toString();
    } catch (e) {
      // If URL parsing fails, try basic string replacement
      return url.replace(/\/[a-zA-Z0-9]{20,}\//g, '/[API_KEY_REDACTED]/');
    }
  };

  /**
   * Sanitize error object to remove sensitive information from all properties
   * @param {any} errorObj - Error object or any object that might contain sensitive data
   * @returns {any} - Sanitized object safe for logging
   */
  const sanitizeErrorObject = (errorObj) => {
    if (!errorObj || typeof errorObj !== 'object') return errorObj;
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(errorObj)) {
      if (typeof value === 'string') {
        if (key.toLowerCase() === 'url') {
          sanitized[key] = sanitizeUrl(value);
        } else {
          sanitized[key] = sanitizeString(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeErrorObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  };

  /**
   * Sanitize string to remove sensitive patterns
   * @param {string} str - String that might contain sensitive information
   * @returns {string} - Sanitized string
   */
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Replace API keys and tokens with placeholders
    return str
      .replace(/\/[a-zA-Z0-9]{20,}\//g, '/[API_KEY_REDACTED]/')
      .replace(/[?&](api_?key|key|token|secret)=[^&\s]+/gi, '$1=[REDACTED]')
      .replace(/sk-[a-zA-Z0-9]+/gi, '[API_KEY_REDACTED]')
      .replace(/pk_[a-zA-Z0-9]+/gi, '[API_KEY_REDACTED]')
      .replace(/AIza[a-zA-Z0-9_-]+/gi, '[API_KEY_REDACTED]');
  };

  /**
   * Sanitize error message to remove sensitive information
   * @param {string|Error} error - Raw error message or Error object
   * @returns {string} - Sanitized error message safe for display
   */
  const sanitizeErrorMessage = (error) => {
    let message = '';
    
    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      // Handle error objects with status codes (like axios errors)
      if (error.status === 403) {
        return 'Access denied. Your API quota may have been exceeded.';
      } else if (error.status === 401) {
        return 'Authentication failed. Please check your credentials.';
      } else if (error.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      } else if (error.status >= 500) {
        return 'Server error. Please try again later.';
      } else if (error.message) {
        message = error.message;
      } else {
        message = 'An unexpected error occurred';
      }
    } else {
      message = 'An unexpected error occurred';
    }

    // Convert to lowercase for pattern matching
    const lowerMessage = message.toLowerCase();
    
    // Patterns that might contain sensitive information
    const sensitivePatterns = [
      /api[_\s-]?key/gi,
      /token/gi,
      /secret/gi,
      /password/gi,
      /auth/gi,
      /bearer/gi,
      /key[\s]*[:=]/gi,
      /[a-zA-Z0-9]{32,}/g, // Long alphanumeric strings (potential keys)
      /sk-[a-zA-Z0-9]+/gi,  // OpenAI-style keys
      /pk_[a-zA-Z0-9]+/gi,  // Stripe-style keys
      /AIza[a-zA-Z0-9_-]+/gi, // Google API keys
    ];

    // Check if message contains sensitive patterns
    const containsSensitive = sensitivePatterns.some(pattern => 
      pattern.test(message)
    );

    if (containsSensitive) {
      // Log sanitized error securely if enabled
      if (enableConsoleLog && typeof console !== 'undefined') {
        const sanitizedError = sanitizeErrorObject(error);
        console.warn('Sanitized error:', sanitizedError);
      }
      
      // Return generic message for sensitive errors
      if (lowerMessage.includes('api') || lowerMessage.includes('key')) {
        return 'API authentication error. Please check your configuration.';
      }
      if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
        return 'Network connection error. Please try again.';
      }
      return 'A configuration error occurred. Please contact support.';
    }

    // For non-sensitive errors, still log sanitized version if enabled
    if (enableConsoleLog && typeof console !== 'undefined') {
      const sanitizedError = sanitizeErrorObject(error);
      console.info('Error details (sanitized):', sanitizedError);
    }

    // Clean up common error prefixes while preserving useful information
    message = message
      .replace(/^Error:\s*/i, '')
      .replace(/^TypeError:\s*/i, '')
      .replace(/^ReferenceError:\s*/i, '')
      .replace(/^SyntaxError:\s*/i, '')
      .replace(/^NetworkError:\s*/i, 'Network error: ')
      .trim();

    // Return sanitized message or fallback
    return message || 'An unexpected error occurred';
  };

  /**
   * Get appropriate icon based on error type
   * @param {string} message - Error message
   */
  const getErrorIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return '🌐';
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return '🔍';
    }
    if (lowerMessage.includes('timeout')) {
      return '⏱️';
    }
    if (lowerMessage.includes('authentication') || lowerMessage.includes('unauthorized')) {
      return '🔒';
    }
    if (lowerMessage.includes('configuration')) {
      return '⚙️';
    }
    return '⚠️';
  };

  /**
   * Get helpful suggestion based on error type
   * @param {string} message - Error message
   */
  const getErrorSuggestion = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return 'Please check your internet connection and try again.';
    }
    if (lowerMessage.includes('not found')) {
      return 'Try adjusting your search criteria or check your spelling.';
    }
    if (lowerMessage.includes('timeout')) {
      return 'The search is taking longer than usual. Please try again.';
    }
    if (lowerMessage.includes('authentication') || lowerMessage.includes('api')) {
      return 'There was an authentication issue. Please refresh the page or contact support.';
    }
    if (lowerMessage.includes('configuration')) {
      return 'There appears to be a configuration issue. Please contact support for assistance.';
    }
    return 'Please try again or contact support if the problem persists.';
  };

  // Sanitize the error message
  const sanitizedMessage = sanitizeErrorMessage(error);

  return (
    <div className="error-container">
      <div className="error-message">
        <div className="error-icon">
          {getErrorIcon(sanitizedMessage)}
        </div>
        <div className="error-content">
          <h3>Oops! Something went wrong</h3>
          <p className="error-text">{sanitizedMessage}</p>
          <p className="error-suggestion">{getErrorSuggestion(sanitizedMessage)}</p>
        </div>
      </div>
      
      {/* Troubleshooting tips */}
      <div className="error-tips">
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Check that your origin and destination are spelled correctly</li>
          <li>Try using airport codes (e.g., LAX, JFK, LHR)</li>
          <li>Make sure your travel dates are in the future</li>
          <li>Refresh the page and try again</li>
          <li>Clear your browser cache if issues persist</li>
        </ul>
      </div>
    </div>
  );
};

// Inline styles for the error component
const styles = `
.error-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #fed7d7;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-content h3 {
  color: #e53e3e;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.error-text {
  color: #4a5568;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  word-wrap: break-word;
  max-width: 100%;
}

.error-suggestion {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.error-tips {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.error-tips h4 {
  color: #2d3748;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.error-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #4a5568;
}

.error-tips li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .error-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .error-message {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .error-icon {
    align-self: center;
  }
}
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ErrorMessage;