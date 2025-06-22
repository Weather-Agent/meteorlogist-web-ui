import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Button } from "./ui/button";
import WeatherEffects from "./WeatherEffects";
import CityTooltips from "./CityTooltips";
import "ol/ol.css";
import "./MapView.css";

const INDIA_CENTER = [78.9629, 22.5937];
const INDIA_ZOOM = 5;

const getCoordinatesFromCityData = (cityData, cityName) => {
  if (!cityData || !cityData.length || !cityName) return INDIA_CENTER;

  const normalizedCityName = cityName.toLowerCase().trim();

  // Find city in the Gemini-generated data
  const foundCity = cityData.find((city) => {
    if (!city.city) return false;
    const cityNameLower = city.city.toLowerCase();

    // Exact match
    if (cityNameLower === normalizedCityName) return true;

    // Check if the query contains the city name
    if (
      normalizedCityName.includes(cityNameLower) ||
      cityNameLower.includes(normalizedCityName)
    )
      return true;

    return false;
  });

  if (foundCity && foundCity.coord) {
    return [foundCity.coord.lon, foundCity.coord.lat];
  }

  return INDIA_CENTER;
};

const extractWeatherPattern = (query = "") => {
  if (!query) return "default";

  const weatherPatterns = {
    thunderstorm: /thunder|lightning|storm/i,
    rain: /rain|rainfall|rainy|drizzle|precipitat/i,
    snow: /snow|snowfall|blizzard/i,
    fog: /fog|mist|haze/i,
    wind: /wind|breeze|gale|windy/i,
    sunny: /sunny|sunshine|clear sky|sun/i,
    cloudy: /cloud|cloudy|overcast/i,
    hot: /hot|heat|temperature/i,
    cold: /cold|chill|freezing/i,
    flood: /flood|flooding|submerged|inundated/i,
    fire: /fire|wildfire|forest fire|bushfire|flames|burning/i,
    tsunami: /tsunami|tidal wave|seismic sea wave/i,
    drought: /drought|dry|arid|water scarcity/i,
    hurricane: /hurricane|cyclone|typhoon|tropical storm/i,
    earthquake: /earthquake|seismic|tremor|quake/i,
  };

  for (const [pattern, regex] of Object.entries(weatherPatterns)) {
    if (regex.test(query)) {
      return pattern;
    }
  }

  return "default";
};

const MapView = ({
  location,
  query,
  onClose,
  weatherPattern: propWeatherPattern,
  cityData = [],
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [weatherPattern, setWeatherPattern] = useState(
    propWeatherPattern || "default"
  );
  const [mapLocation, setMapLocation] = useState(INDIA_CENTER);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new Map({
      target: mapContainerRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        maxZoom: 19,
        constrainResolution: true,
      }),
      controls: [],
    });

    mapRef.current = map;
    mapContainerRef.current.__map = map;
    mapContainerRef.current.setAttribute("data-map-container", true);

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
    };
  }, []);
  useEffect(() => {
    if (!mapRef.current) return;

    console.log("MapView cityData:", cityData); // Debug logging

    // If we have city data, use it for centering
    if (cityData && cityData.length > 0) {
      const firstCity = cityData[0];
      const coordinates = [firstCity.coord.lon, firstCity.coord.lat];
      setMapLocation(coordinates);

      console.log(
        "Centering map on city:",
        firstCity.city,
        "at coordinates:",
        coordinates
      );

      let zoomLevel = 10; // Default zoom for cities

      // Use dynamic zoom based on city population if available
      if (firstCity.population) {
        if (firstCity.population > 10000000) {
          zoomLevel = 8; // Mega cities
        } else if (firstCity.population > 5000000) {
          zoomLevel = 9; // Large cities
        } else if (firstCity.population > 1000000) {
          zoomLevel = 10; // Medium cities
        } else {
          zoomLevel = 11; // Smaller cities
        }
      }

      console.log(
        "Using zoom level:",
        zoomLevel,
        "for population:",
        firstCity.population
      );

      mapRef.current.getView().animate({
        center: fromLonLat(coordinates),
        zoom: zoomLevel,
        duration: 1000,
      });

      if (propWeatherPattern) {
        setWeatherPattern(propWeatherPattern);
      } else {
        const emergencyPatterns = {
          fire: /fire|wildfire|forest fire|bushfire|flames|burning/i,
          earthquake: /earthquake|seismic|tremor|quake/i,
          flood: /flood|flooding|submerged|inundated/i,
          tsunami: /tsunami|tidal wave|seismic sea wave/i,
          hurricane: /hurricane|cyclone|typhoon|tropical storm/i,
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
    } else if (location) {
      // Fallback to location-based centering if no city data
      const coordinates = getCoordinatesFromCityData(cityData, location);
      setMapLocation(coordinates);

      mapRef.current.getView().animate({
        center: fromLonLat(coordinates),
        zoom: 9,
        duration: 1000,
      });
    } else {
      resetView();
    }
  }, [location, query, propWeatherPattern, cityData]);

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        duration: 1000,
      });

      setWeatherPattern("default");
      setMapLocation(INDIA_CENTER);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-4">
      <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-green-300">
            {location ? `Weather Map` : "Map View"}
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
          />{" "}
          <WeatherEffects
            key={`weather-${weatherPattern}-${
              mapLocation ? mapLocation.join(",") : "default"
            }`}
            pattern={weatherPattern}
            location={mapLocation}
          />
          <CityTooltips map={mapRef.current} cityData={cityData} />
        </div>
      </div>
    </div>
  );
};

export default MapView;
