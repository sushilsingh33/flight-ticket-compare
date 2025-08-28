import React, { useState, useMemo } from 'react';
import SearchForm from './components/SearchForm';
import TicketCard from './components/TicketCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { searchFlights } from './services/apiServices';
import './styles/App.css';

/**
 * Enhanced App component with advanced filtering and modern UX
 * Features: Advanced filters, sorting, price alerts, and superior design
 */
function App() {
  // State management for search results, loading, and error states
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    stops: 'all',
    airlines: [],
    sortBy: 'price'
  });

  /**
   * Handle search form submission
   * @param {Object} searchParams - Search parameters from the form
   */
  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchParams(searchParams);

    try {
      // Call API service to search for flights
      const results = await searchFlights(searchParams);
      setTickets(results);
      
      // Update price range filter based on actual results
      if (results.length > 0) {
        const prices = results.map(ticket => {
          const price = typeof ticket.price === 'string' 
            ? parseFloat(ticket.price.replace(/[^0-9.]/g, '')) 
            : ticket.price;
          return price || 0;
        });
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setFilters(prev => ({
          ...prev,
          priceRange: [minPrice, maxPrice]
        }));
      }
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters to tickets
   */
  const filteredTickets = useMemo(() => {
    if (!tickets.length) return [];

    let filtered = [...tickets];

    // Filter by price range
    filtered = filtered.filter(ticket => {
      const price = typeof ticket.price === 'string' 
        ? parseFloat(ticket.price.replace(/[^0-9.]/g, '')) 
        : ticket.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Filter by stops
    if (filters.stops !== 'all') {
      filtered = filtered.filter(ticket => {
        const stops = ticket.stops || 0;
        if (filters.stops === 'direct') return stops === 0;
        if (filters.stops === 'one-stop') return stops === 1;
        if (filters.stops === 'multi-stop') return stops > 1;
        return true;
      });
    }

    // Filter by airlines
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(ticket => {
        const airlineName = ticket.airline?.name || ticket.airline;
        return filters.airlines.includes(airlineName);
      });
    }

    // Sort tickets
    filtered.sort((a, b) => {
      const priceA = typeof a.price === 'string' 
        ? parseFloat(a.price.replace(/[^0-9.]/g, '')) 
        : a.price;
      const priceB = typeof b.price === 'string' 
        ? parseFloat(b.price.replace(/[^0-9.]/g, '')) 
        : b.price;
      
      switch (filters.sortBy) {
        case 'price':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'departure':
          return new Date(a.departureTime) - new Date(b.departureTime);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tickets, filters]);

  /**
   * Update filter state
   */
  const updateFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    if (tickets.length > 0) {
      const prices = tickets.map(ticket => {
        const price = typeof ticket.price === 'string' 
          ? parseFloat(ticket.price.replace(/[^0-9.]/g, '')) 
          : ticket.price;
        return price || 0;
      });
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setFilters({
        priceRange: [minPrice, maxPrice],
        stops: 'all',
        airlines: [],
        sortBy: 'price'
      });
    } else {
      setFilters({
        priceRange: [0, 1000],
        stops: 'all',
        airlines: [],
        sortBy: 'price'
      });
    }
  };

  /**
   * Get unique airlines from tickets
   */
  const availableAirlines = useMemo(() => {
    const airlines = [...new Set(tickets.map(ticket => 
      ticket.airline?.name || ticket.airline
    ))];
    return airlines.filter(Boolean).sort();
  }, [tickets]);

  /**
   * Get price range from tickets
   */
  const priceRange = useMemo(() => {
    if (!tickets.length) return [0, 1000];
    
    const prices = tickets.map(ticket => {
      const price = typeof ticket.price === 'string' 
        ? parseFloat(ticket.price.replace(/[^0-9.]/g, '')) 
        : ticket.price;
      return price || 0;
    });
    return [Math.min(...prices), Math.max(...prices)];
  }, [tickets]);

  /**
   * Get search summary text
   */
  const getSearchSummary = () => {
    if (!searchParams) return '';
    
    const { origin, destination, departureDate, tripType, passengers } = searchParams;
    const passengerText = passengers === 1 ? '1 passenger' : `${passengers} passengers`;
    const tripText = tripType === 'one-way' ? 'One-way' : 'Round-trip';
    
    return `${tripText} from ${origin} to ${destination} on ${departureDate} for ${passengerText}`;
  };

  return (
    <div className="app">
      {/* Header section */}
      <header className="app-header">
        <h1>✈️ Flight Ticket Compare</h1>
        <p>Find and compare the best flight deals across multiple airlines</p>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {/* Search form component */}
        <SearchForm onSearch={handleSearch} />

        {/* Results section */}
        <div className="results-section">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          
          {/* Display search results */}
          {hasSearched && !isLoading && !error && (
            <div className="results-container">
              {tickets.length > 0 ? (
                <>
                  <div className="results-header">
                    <h2>Flight Search Results</h2>
                    <p className="search-summary">{getSearchSummary()}</p>
                    <div className="results-stats">
                      <span className="results-count">
                        {filteredTickets.length} of {tickets.length} flights
                      </span>
                      {priceRange[0] !== priceRange[1] && (
                        <span className="price-range">
                          ${Math.round(priceRange[0])} - ${Math.round(priceRange[1])}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filters Section */}
                  <div className="filters-section">
                    <div className="filters-header">
                      <h3>Filters & Sort</h3>
                      <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="filters-grid">
                      {/* Price Range Filter */}
                      <div className="filter-group">
                        <label>Price Range</label>
                        <div className="price-range-slider">
                          <input
                            type="range"
                            className="range-slider"
                            min={priceRange[0]}
                            max={priceRange[1]}
                            value={filters.priceRange[0]}
                            onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                          />
                          <input
                            type="range"
                            className="range-slider"
                            min={priceRange[0]}
                            max={priceRange[1]}
                            value={filters.priceRange[1]}
                            onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                          />
                          <div className="price-display">
                            ${Math.round(filters.priceRange[0])} - ${Math.round(filters.priceRange[1])}
                          </div>
                        </div>
                      </div>

                      {/* Stops Filter */}
                      <div className="filter-group">
                        <label>Stops</label>
                        <div className="stops-filter">
                          <button
                            className={`filter-btn ${filters.stops === 'all' ? 'active' : ''}`}
                            onClick={() => updateFilter('stops', 'all')}
                          >
                            All
                          </button>
                          <button
                            className={`filter-btn ${filters.stops === 'direct' ? 'active' : ''}`}
                            onClick={() => updateFilter('stops', 'direct')}
                          >
                            Direct
                          </button>
                          <button
                            className={`filter-btn ${filters.stops === 'one-stop' ? 'active' : ''}`}
                            onClick={() => updateFilter('stops', 'one-stop')}
                          >
                            1 Stop
                          </button>
                        </div>
                      </div>

                      {/* Airlines Filter */}
                      <div className="filter-group">
                        <label>Airlines</label>
                        <div className="airlines-filter">
                          {availableAirlines.map(airline => (
                            <button
                              key={airline}
                              className={`filter-btn ${filters.airlines.includes(airline) ? 'active' : ''}`}
                              onClick={() => {
                                const newAirlines = filters.airlines.includes(airline)
                                  ? filters.airlines.filter(a => a !== airline)
                                  : [...filters.airlines, airline];
                                updateFilter('airlines', newAirlines);
                              }}
                            >
                              {airline}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div className="filter-group">
                        <label>Sort By</label>
                        <div className="sort-options">
                          <button
                            className={`sort-btn ${filters.sortBy === 'price' ? 'active' : ''}`}
                            onClick={() => updateFilter('sortBy', 'price')}
                          >
                            Price ↑
                          </button>
                          <button
                            className={`sort-btn ${filters.sortBy === 'price-desc' ? 'active' : ''}`}
                            onClick={() => updateFilter('sortBy', 'price-desc')}
                          >
                            Price ↓
                          </button>
                          <button
                            className={`sort-btn ${filters.sortBy === 'duration' ? 'active' : ''}`}
                            onClick={() => updateFilter('sortBy', 'duration')}
                          >
                            Duration
                          </button>
                          <button
                            className={`sort-btn ${filters.sortBy === 'departure' ? 'active' : ''}`}
                            onClick={() => updateFilter('sortBy', 'departure')}
                          >
                            Departure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Cards */}
                  {filteredTickets.length > 0 ? (
                    <div className="tickets-grid">
                      {filteredTickets.map((ticket, index) => (
                        <TicketCard key={ticket.id || index} ticket={ticket} />
                      ))}
                    </div>
                  ) : (
                    <div className="no-filtered-results">
                      <h3>No flights match your filters</h3>
                      <p>Try adjusting your filter criteria to see more results.</p>
                      <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        style={{ marginTop: '1rem' }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No flights found</h3>
                  <p>Try adjusting your search criteria or dates</p>
                  <div className="no-results-suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                      <li>Check if the airport codes are correct</li>
                      <li>Try different dates</li>
                      <li>Consider nearby airports</li>
                      <li>Try a different travel class</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial state - before search */}
          {!hasSearched && !isLoading && (
            <div className="welcome-section">
              <div className="welcome-content">
                <h2>Welcome to Flight Ticket Compare</h2>
                <p>Search for flights and compare prices from multiple airlines to find the best deals.</p>
                <div className="features-grid">
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <h3>Smart Search</h3>
                    <p>Find flights with our intelligent search engine</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💰</span>
                    <h3>Price Comparison</h3>
                    <p>Compare prices across multiple airlines</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <h3>Fast Results</h3>
                    <p>Get instant flight search results</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <h3>Best Deals</h3>
                    <p>Find the most competitive prices</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 Flight Ticket Compare. Compare prices and find the best flight deals.</p>
        <div className="footer-links">
          <span>Powered by Sky Scrapper API</span>
        </div>
      </footer>
    </div>
  );
}

export default App;