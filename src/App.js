import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [placeData, setPlaceData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const weatherApiKey = '0015af1c08d543a7ab8190233242810';
  const openCageApiKey = '1d650aad417b4c5f8ba69b46ae635a92'; 

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
            fetchWeatherData(latitude, longitude);
            fetchPlaceData(latitude, longitude);
          },
          (err) => {
            setError("Unable to retrieve your location. Please try again later.");
            setLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lon}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.message);
    } finally {
      setLoading(false); 
    }
  };

  const fetchPlaceData = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lon}&key=${openCageApiKey}`);
      if (response.data.status.code === 200 && response.data.results.length > 0) {
        const place = response.data.results[0]; 
        setPlaceData(place);
      } else {
        console.log('status', response.data.status.message);
      }
    } catch (error) {
      console.error('Error fetching place data:', error);
      setError(error.message);
    } finally {
      setLoading(false); 
    }
  };

  const formatUnixTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const sections = document.querySelectorAll('.animate');

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    sections.forEach(section => {
      observer.observe(section);
    });
  }, []);

  return (
    <>
      <nav className={`navbar ${loading ? 'fade-out' : ''}`}>
        <h1 className="logo">City Info</h1>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li><a href="#location">Location</a></li>
          <li><a href="#weather">Weather</a></li>
          <li><a href="#info">Location Info</a></li>
        </ul>
      </nav>

      <div className="app-container">
        <header>
          <h1>{placeData ? placeData.components.city : 'City Info App'}</h1>
          {error && <p className="error-message shake">Error: {error}</p>} {/* Shake animation for error */}
        </header>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            {location && (
              <section id="location" className="location-info animate">
                <h2>Your Location <i className="fas fa-map-marker-alt"></i></h2>
                <p>Latitude: {location.lat}, Longitude: {location.lon}</p>
              </section>
            )}

            {weatherData && (
              <section id="weather" className="weather-info animate">
                <h2>Current Weather in {weatherData.location.name}, {weatherData.location.region} <i className="fas fa-cloud-sun"></i></h2>
                <img src={weatherData.current.condition.icon} alt="weather icon" className="weather-icon" />
                <p><strong>Temperature:</strong> {weatherData.current.temp_c} °C <i className="fas fa-thermometer-half"></i></p>
                <p><strong>Condition:</strong> {weatherData.current.condition.text}</p>
                <p><strong>Humidity:</strong> {weatherData.current.humidity}% <i className="fas fa-tint"></i></p>
                <p><strong>Wind Speed:</strong> {weatherData.current.wind_kph} kph <i className="fas fa-wind"></i></p>
                <p><strong>Pressure:</strong> {weatherData.current.pressure_mb} mb <i className="fas fa-tachometer-alt"></i></p>
                <p><strong>Feels Like:</strong> {weatherData.current.feelslike_c} °C <i className="fas fa-temperature-high"></i></p>
                <p><strong>Visibility:</strong> {weatherData.current.vis_km} km <i className="fas fa-eye"></i></p>
                <p><strong>Cloud Cover:</strong> {weatherData.current.cloud}% <i className="fas fa-cloud"></i></p>
                <p><strong>UV Index:</strong> {weatherData.current.uv} <i className="fas fa-sun"></i></p>
                <p><strong>Last Updated:</strong> {weatherData.current.last_updated}</p>
              </section>
            )}

            {placeData && (
              <section id="info" className="location-data animate">
                <h2>Location Info <i className="fas fa-info-circle"></i></h2>
                <img src="https://via.placeholder.com/150" alt="City View" className="city-image" />
                <p><strong>Formatted Address:</strong> {placeData.formatted}</p>
                <p><strong>City:</strong> {placeData.components.city || 'N/A'}</p>
                <p><strong>State:</strong> {placeData.components.state || 'N/A'}</p>
                <p><strong>Country:</strong> {placeData.components.country || 'N/A'}</p>
                <p><strong>Postal Code:</strong> {placeData.components.postcode || 'N/A'}</p>
                <p><strong>Calling Code:</strong> {placeData.annotations.callingcode || 'N/A'}</p>
                <p><strong>Currency:</strong> {placeData.annotations.currency.name || 'N/A'} <i className="fas fa-euro-sign"></i></p>
                <p><strong>Timezone:</strong> {placeData.annotations.timezone.name || 'N/A'}</p>
                <p><strong>Sunrise:</strong> {placeData.annotations.sun.rise.apparent ? formatUnixTime(placeData.annotations.sun.rise.apparent) : 'N/A'}</p>
                <p><strong>Sunset:</strong> {placeData.annotations.sun.set.apparent ? formatUnixTime(placeData.annotations.sun.set.apparent) : 'N/A'}</p>
              </section>
            )}
          </>
        )}

        <footer className="footer animate">
          <p>&copy; 2024 Your Company Name</p>
        </footer>
      </div>
    </>
  );
}

export default App;
