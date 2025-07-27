import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const LocationMap = () => {
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Center coordinates for Ravi Yoga Center in Quthbullapur, Hyderabad
  const center = {
    lat: 17.5018, // Latitude for Quthbullapur, Hyderabad
    lng: 78.4574  // Longitude for Quthbullapur, Hyderabad
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    scaleControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  const handleMapLoad = () => {
    console.log('Map loaded successfully');
    setIsLoading(false);
  };

  const handleMapError = (error) => {
    console.error('Error loading map:', error);
    setMapError('Unable to load the map. Please try again later.');
    setIsLoading(false);
  };

  // Log the API key (first few characters) for debugging
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'Not found');
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {mapError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{mapError}</span>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            onError={handleMapError}
            loadingElement={<div>Loading...</div>}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              options={mapOptions}
              onLoad={handleMapLoad}
              onError={handleMapError}
            >
              <Marker
                position={center}
                title="Ravi Yoga Center"
                animation={window.google?.maps?.Animation?.DROP}
              />
            </GoogleMap>
          </LoadScript>
        )}
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Ravi Yoga Center</h3>
        <p className="text-gray-600">
          Sri Durga Estates ground<br />
          Quthbullapur, Hyderabad<br />
          Telangana 500067
        </p>
        <a
          href="https://maps.google.com/?q=17.5018,78.4574"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default LocationMap; 