import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Button } from './ui/button';
import WeatherEffects from './WeatherEffects';
import 'ol/ol.css';

const INDIA_CENTER = [81.9629, 22.5937];
const INDIA_ZOOM = 5;

const getCoordinatesForCity = (cityName) => {
  const cityCoordinates = {
    'mumbai': [72.8777, 19.0760],
    'delhi': [77.1025, 28.7041],
    'bangalore': [77.5946, 12.9716],
    'hyderabad': [78.4867, 17.3850],
    'chennai': [80.2707, 13.0827],
    'kolkata': [88.3639, 22.5726],
    'ahmedabad': [72.5714, 23.0225],
    'pune': [73.8567, 18.5204],
    'jaipur': [75.7873, 26.9124],
    'lucknow': [80.9462, 26.8467],
  };
  
  const normalizedCityName = cityName.toLowerCase();
  return cityCoordinates[normalizedCityName] || INDIA_CENTER;
};

const extractWeatherPattern = (query) => {
  const weatherPatterns = {
    'thunderstorm': /thunder|lightning|storm/i,
    'rain': /rain|rainfall|rainy|drizzle/i,
    'snow': /snow|snowfall|blizzard/i,
    'fog': /fog|mist|haze/i,
    'wind': /wind|breeze|gale/i,
    'sunny': /sunny|sunshine|clear sky/i,
    'cloudy': /cloud|cloudy|overcast/i,
    'hot': /hot|heat|temperature/i,
    'cold': /cold|chill|freezing/i,
  };

  for (const [pattern, regex] of Object.entries(weatherPatterns)) {
    if (regex.test(query)) {
      return pattern;
    }
  }

  return 'default';
};

const MapView = ({ location, query, onClose }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [weatherPattern, setWeatherPattern] = useState('default');
  const [mapLocation, setMapLocation] = useState(INDIA_CENTER);
  
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        maxZoom: 19,
        constrainResolution: true,
      }),
      controls: [],
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && location) {
      const coordinates = getCoordinatesForCity(location);
      setMapLocation(coordinates);
      
      mapRef.current.getView().animate({
        center: fromLonLat(coordinates),
        zoom: 9,
        duration: 1000,
      });

      const pattern = extractWeatherPattern(query);
      setWeatherPattern(pattern);
    }
  }, [location, query]);

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        duration: 1000,
      });
    }
  };
  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-green-300">Map View</h2>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetView}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Reset View
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Close Map
            </Button>
          </div>
        </div>
        
        <div className="relative flex-1 m-3 md:m-4 overflow-hidden rounded-lg border border-slate-700/30">
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 rounded-lg overflow-hidden"
          />
          <WeatherEffects pattern={weatherPattern} location={mapLocation} />
        </div>
      </div>
    </div>
  );
};

export default MapView;
