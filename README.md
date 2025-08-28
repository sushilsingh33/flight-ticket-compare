# ✈️ Flight Ticket Compare

A modern web application for comparing flight ticket prices across multiple airlines. Built with React and integrated with a flight search API to provide real-time flight search and comparison functionality.

## 🚀 Features

- **Smart Flight Search**: Search for flights using airport codes with autocomplete suggestions
- **Price Comparison**: Compare ticket prices across multiple airlines in one view
- **Real-time API Integration**: Powered by a flight search API for live flight data
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **User-friendly Interface**: Modern, intuitive design with smooth animations
- **Flight Details**: View comprehensive flight information including:
  - Airline details and flight numbers
  - Departure and arrival times
  - Flight duration and stops
  - Baggage information
  - Amenities and travel class options

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern JavaScript (ES6+)
- **Styling**: CSS3 with modern features (Grid, Flexbox, CSS Variables)
- **HTTP Client**: Axios for API requests
- **API**: External flight search API
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser

## 🔧 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd ticket-compare
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root (`ticket-compare/`) with your flight API key. You can also set an optional timeout.
   ```env
   REACT_APP_FLIGHT_API_KEY=your_flightapi_key_here
   REACT_APP_API_TIMEOUT=10000
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 🎯 Usage

### Searching for Flights

1. **Enter Origin**: Type an airport code (e.g., LAX, JFK) or city name
2. **Enter Destination**: Type an airport code (e.g., LHR, CDG) or city name
3. **Select Dates**: Choose departure and return dates (for round-trip)
4. **Choose Options**: Select number of passengers and travel class
5. **Search**: Click "Search Flights" to find available options

### Understanding Results

- **Flight Cards**: Each card shows comprehensive flight information
- **Price Comparison**: Results are sorted by price (lowest first)
- **Flight Details**: View airline, times, duration, and stops
- **Booking**: Click "Book Now" to proceed with booking

## 🔌 API Configuration

The application uses an external flight search API for flight data. Configure your API key via environment variables.

### Environment Variables

- `REACT_APP_FLIGHT_API_KEY` (required): Your flight API key
- `REACT_APP_API_TIMEOUT` (optional): Request timeout in milliseconds (default: 10000)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with grid layout
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Single-column layout with optimized spacing

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Smooth Animations**: Subtle transitions and hover effects
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Dark Mode Support**: Automatic theme detection
- **Loading States**: Visual feedback during API calls

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.



## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── SearchForm.js    # Flight search form
│   ├── TicketCard.js    # Individual flight card
│   ├── LoadingSpinner.js # Loading indicator
│   └── ErrorMessage.js  # Error display
├── services/            # API services
│   └── apiServices.js   # Flight API integration
├── styles/              # CSS stylesheets
│   ├── App.css          # Main app styles
│   ├── SearchForm.css   # Form component styles
│   ├── TicketCard.css   # Card component styles
│   └── LoadingSpinner.css # Spinner styles
├── utils/               # Utility functions
│   └── helpers.js       # Helper functions
└── App.js               # Main application component
```

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Community**: For the amazing framework and ecosystem

## 📞 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Verify your internet connection
3. Ensure the API key is valid and has sufficient quota
4. Open an issue on GitHub with detailed information

---

**Happy flying! ✈️**
