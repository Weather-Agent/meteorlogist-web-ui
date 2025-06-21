import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { Button } from './ui/button';
import WeatherEffects from './WeatherEffects';
import 'ol/ol.css';

const INDIA_CENTER = [78.9629, 22.5937];
const INDIA_ZOOM = 5;

const getCoordinatesForCity = (cityName = '') => {
  if (!cityName) return INDIA_CENTER;
  
  const cityCoordinates = {
    'mumbai': [72.8777, 19.0760],
    'delhi': [77.1025, 28.7041],
    'bangalore': [77.5946, 12.9716],
    'bengaluru': [77.5946, 12.9716],
    'hyderabad': [78.4867, 17.3850],
    'chennai': [80.2707, 13.0827],
    'kolkata': [88.3639, 22.5726],
    'ahmedabad': [72.5714, 23.0225],
    'pune': [73.8567, 18.5204],
    'jaipur': [75.7873, 26.9124],
    'lucknow': [80.9462, 26.8467],
    'new york': [-74.0060, 40.7128],
    'los angeles': [-118.2437, 34.0522],
    'chicago': [-87.6298, 41.8781],
    'houston': [-95.3698, 29.7604],
    'phoenix': [-112.0740, 33.4484],
    'philadelphia': [-75.1652, 39.9526],
    'san antonio': [-98.4936, 29.4241],
    'san diego': [-117.1611, 32.7157],
    'dallas': [-96.7970, 32.7767],
    'san jose': [-121.8863, 37.3382],
    'austin': [-97.7431, 30.2672],
    'san francisco': [-122.4194, 37.7749],
    'seattle': [-122.3321, 47.6062],
    'miami': [-80.1918, 25.7617],
    'washington': [-77.0369, 38.9072],
    'boston': [-71.0589, 42.3601],
    'portland': [-122.6784, 45.5152],
    'denver': [-104.9903, 39.7392],
    'atlanta': [-84.3902, 33.7490],
    'las vegas': [-115.1398, 36.1699],
    'london': [-0.1278, 51.5074],
    'paris': [2.3522, 48.8566],
    'tokyo': [139.6917, 35.6895],
    'beijing': [116.4074, 39.9042],
    'sydney': [151.2093, -33.8688],
    'dubai': [55.2708, 25.2048],
    'rio': [-43.1729, -22.9068],
    'rio de janeiro': [-43.1729, -22.9068],
    'toronto': [-79.3832, 43.6532],
    'mexico city': [-99.1332, 19.4326],
    'berlin': [13.4050, 52.5200],
    'madrid': [-3.7038, 40.4168],
    'rome': [12.4964, 41.9028],
    'hong kong': [114.1694, 22.3193],
    'singapore': [103.8198, 1.3521],
    'cairo': [31.2357, 30.0444],
    'istanbul': [28.9784, 41.0082],
    'moscow': [37.6173, 55.7558],
    'shanghai': [121.4737, 31.2304]
  };

  const cityAliases = {
    'nyc': 'new york',
    'ny': 'new york',
    'la': 'los angeles',
    'l.a.': 'los angeles',
    'angeles': 'los angeles',
    'sf': 'san francisco',
    'dc': 'washington',
    'bombay': 'mumbai',
    'calcutta': 'kolkata',
    'madras': 'chennai',
    'bangalore': 'bengaluru',
    'vegas': 'las vegas',
    'shanghai': 'shanghai'
  };

  const normalizedCityName = cityName.toLowerCase().trim();

  for (const [alias, actualCity] of Object.entries(cityAliases)) {
    const aliasRegex = new RegExp(`\\b${alias}\\b`, 'i');
    if (aliasRegex.test(normalizedCityName)) {
      return cityCoordinates[actualCity];
    }
  }

  if (normalizedCityName.includes('los angeles') || 
      normalizedCityName.includes('la, california') || 
      normalizedCityName.includes('la, ca')) {
    return cityCoordinates['los angeles'];
  }

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalizedCityName === city || 
        normalizedCityName.includes(`in ${city}`) || 
        normalizedCityName.includes(`at ${city}`) || 
        normalizedCityName.includes(`near ${city}`) ||
        normalizedCityName.includes(`around ${city}`) ||
        normalizedCityName.includes(`for ${city}`) ||
        normalizedCityName.includes(`${city} area`) ||
        normalizedCityName.includes(`${city} city`) ||
        normalizedCityName.includes(`${city}, `)) {
      return coords;
    }
  }

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(normalizedCityName)) {
      return coords;
    }
    if (normalizedCityName.includes(city)) {
      return coords;
    }
  }

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const cityParts = city.split(' ');
    if (cityParts.length > 1) {
      for (const part of cityParts) {
        if (part.length > 3) {
          const partRegex = new RegExp(`\\b${part}\\b`, 'i');
          if (partRegex.test(normalizedCityName) || normalizedCityName.includes(part)) {
            return coords;
          }
        }
      }
    }
  }

  return INDIA_CENTER;
};

const extractWeatherPattern = (query = '') => {
  if (!query) return 'default';

  const weatherPatterns = {
    'thunderstorm': /thunder|lightning|storm/i,
    'rain': /rain|rainfall|rainy|drizzle|precipitat/i,
    'snow': /snow|snowfall|blizzard/i,
    'fog': /fog|mist|haze/i,
    'wind': /wind|breeze|gale|windy/i,
    'sunny': /sunny|sunshine|clear sky|sun/i,
    'cloudy': /cloud|cloudy|overcast/i,
    'hot': /hot|heat|temperature/i,
    'cold': /cold|chill|freezing/i,
    'flood': /flood|flooding|submerged|inundated/i,
    'fire': /fire|wildfire|forest fire|bushfire|flames|burning/i,
    'tsunami': /tsunami|tidal wave|seismic sea wave/i,
    'drought': /drought|dry|arid|water scarcity/i,
    'hurricane': /hurricane|cyclone|typhoon|tropical storm/i,
    'earthquake': /earthquake|seismic|tremor|quake/i,
  };

  for (const [pattern, regex] of Object.entries(weatherPatterns)) {
    if (regex.test(query)) {
      return pattern;
    }
  }

  return 'default';
};

const MapView = forwardRef(({ location, query, onClose, weatherPattern: propWeatherPattern }, ref) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [weatherPattern, setWeatherPattern] = useState(propWeatherPattern || 'default');
  const [mapLocation, setMapLocation] = useState(INDIA_CENTER);
  const [selectedCity, setSelectedCity] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // City details for tooltips
  const cityDetails = {
    'Mumbai': { population: '12.5M', area: '603 km²', state: 'Maharashtra', climate: 'Tropical' },
    'Delhi': { population: '11.0M', area: '1,484 km²', state: 'Delhi', climate: 'Semi-arid' },
    'Bangalore': { population: '8.4M', area: '741 km²', state: 'Karnataka', climate: 'Tropical savanna' },
    'Hyderabad': { population: '6.9M', area: '650 km²', state: 'Telangana', climate: 'Semi-arid' },
    'Chennai': { population: '4.7M', area: '426 km²', state: 'Tamil Nadu', climate: 'Tropical wet' },
    'Kolkata': { population: '4.5M', area: '185 km²', state: 'West Bengal', climate: 'Tropical wet' },
    'Pune': { population: '3.1M', area: '331 km²', state: 'Maharashtra', climate: 'Semi-arid' },
    'Ahmedabad': { population: '5.6M', area: '505 km²', state: 'Gujarat', climate: 'Semi-arid' }
  };

  // Method to add city marker with optional details
  const addCityMarker = (cityName, coordinates, details = null) => {
    if (!mapRef.current || !markerLayerRef.current) return;

    // Clear existing markers
    markerLayerRef.current.getSource().clear();

    // Use provided details or fallback to predefined city details
    const markerDetails = details || cityDetails[cityName] || {};

    // Create marker feature
    const marker = new Feature({
      geometry: new Point(fromLonLat(coordinates)),
      name: cityName,
      details: markerDetails
    });

    // Create marker style
    marker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#8B5CF6"/>
            <circle cx="15" cy="15" r="8" fill="#FFFFFF"/>
            <circle cx="15" cy="15" r="4" fill="#8B5CF6"/>
          </svg>
        `),
        scale: 1
      })
    }));

    markerLayerRef.current.getSource().addFeature(marker);
  };

  // Method to zoom to city with optional details
  const zoomToCity = (cityName, coordinates, details = null) => {
    if (!mapRef.current) return;

    // Set selected city with proper details structure
    const cityInfo = {
      name: cityName,
      details: details || cityDetails[cityName] || {}
    };
    setSelectedCity(cityInfo);
    
    addCityMarker(cityName, coordinates, details);

    mapRef.current.getView().animate({
      center: fromLonLat(coordinates),
      zoom: 10,
      duration: 1000,
    });
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    zoomToCity
  }));
  
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create marker layer
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 100
    });
    markerLayerRef.current = markerLayer;

    // Create overlay for tooltip
    const overlay = new Overlay({
      element: overlayRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        markerLayer
      ],
      overlays: [overlay],
      view: new View({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        maxZoom: 19,
        constrainResolution: true,
      }),
      controls: [],
    });

    // Add click listener for markers
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature) {
        const coords = feature.getGeometry().getCoordinates();
        const cityName = feature.get('name');
        const details = feature.get('details');
        
        setSelectedCity({ name: cityName, details });
        overlay.setPosition(coords);
      } else {
        setSelectedCity(null);
        overlay.setPosition(undefined);
      }
    });

    // Add pointer cursor on marker hover
    map.on('pointermove', (e) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTarget().style.cursor = hit ? 'pointer' : '';
    });

    mapRef.current = map;
    mapContainerRef.current.__map = map;
    mapContainerRef.current.setAttribute('data-map-container', true);

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (location) {
      const coordinates = getCoordinatesForCity(location);
      setMapLocation(coordinates);

      let zoomLevel = 9;
      const largerCities = ['new york', 'los angeles', 'tokyo', 'mexico city', 'delhi', 'shanghai', 'mumbai'];
      const normalizedLocation = location.toLowerCase();
      
      if (largerCities.some(city => normalizedLocation.includes(city))) {
        zoomLevel = 8;
      } else if (normalizedLocation.includes('london') || normalizedLocation.includes('chicago') || normalizedLocation.includes('paris')) {
        zoomLevel = 9;
      } else if (normalizedLocation.includes('miami') || normalizedLocation.includes('seattle') || normalizedLocation.includes('hong kong')) {
        zoomLevel = 10;
      }

      mapRef.current.getView().animate({
        center: fromLonLat(coordinates),
        zoom: zoomLevel,
        duration: 1000,
      });

      if (propWeatherPattern) {
        setWeatherPattern(propWeatherPattern);
      } else {
        const emergencyPatterns = {
          'fire': /fire|wildfire|forest fire|bushfire|flames|burning/i,
          'earthquake': /earthquake|seismic|tremor|quake/i,
          'flood': /flood|flooding|submerged|inundated/i,
          'tsunami': /tsunami|tidal wave|seismic sea wave/i,
          'hurricane': /hurricane|cyclone|typhoon|tropical storm/i,
        };

        let emergencyFound = false;

        for (const [pattern, regex] of Object.entries(emergencyPatterns)) {
          if (regex.test(query)) {
            setWeatherPattern(pattern);
            emergencyFound = true;
            break;
          }
        }

        if (!emergencyFound) {
          const pattern = extractWeatherPattern(query);
          setWeatherPattern(pattern);
        }
      }
    } else {
      resetView();
    }
  }, [location, query, propWeatherPattern]);

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        duration: 1000,
      });

      // Clear markers
      if (markerLayerRef.current) {
        markerLayerRef.current.getSource().clear();
      }

      setWeatherPattern('default');
      setMapLocation(INDIA_CENTER);
      setSelectedCity(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-green-300">
            {location ? `Weather Map: ${location}` : 'Map View'}
          </h2>
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
              onClick={() => onClose()}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Close
            </Button>
          </div>
        </div>
        <div className="relative flex-1 m-3 md:m-4 overflow-hidden rounded-lg border border-slate-700/30">
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 rounded-lg overflow-hidden"
            data-map-container="true"
          />
          
          {/* Tooltip overlay */}
          <div
            ref={overlayRef}
            className={`absolute bg-slate-900/95 backdrop-blur-md border border-purple-600/50 rounded-lg p-3 shadow-lg transition-opacity pointer-events-none ${
              selectedCity ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: 'translate(-50%, -100%)', marginTop: '-10px' }}
          >
            {selectedCity && (
              <div className="text-white min-w-48">
                <h4 className="font-bold text-purple-300 text-lg mb-2">{selectedCity.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Population:</span>
                    <span className="text-white">{selectedCity.details.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area:</span>
                    <span className="text-white">{selectedCity.details.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">State:</span>
                    <span className="text-white">{selectedCity.details.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Climate:</span>
                    <span className="text-white">{selectedCity.details.climate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <WeatherEffects 
            key={`weather-${weatherPattern}-${mapLocation ? mapLocation.join(',') : 'default'}`}
            pattern={weatherPattern} 
            location={mapLocation} 
          />
        </div>
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;