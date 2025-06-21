import { useEffect, useRef } from 'react';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';

const CityTooltips = ({ map, cityData = [] }) => {
  const overlaysRef = useRef([]);

  useEffect(() => {
    if (!map || !cityData.length) return;

    // Clear existing overlays
    overlaysRef.current.forEach(overlay => {
      map.removeOverlay(overlay);
    });
    overlaysRef.current = [];

    // Remove existing city layers
    const existingLayers = map.getLayers().getArray().filter(layer => 
      layer.get('name') === 'cityLayer'
    );
    existingLayers.forEach(layer => map.removeLayer(layer));

    // Create features for cities
    const features = cityData
      .filter(city => city.map_plotable && city.coord)
      .map(city => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([city.coord.lon, city.coord.lat])),
          city: city
        });

        // Style with weather icon
        const iconStyle = new Style({
          image: new Icon({
            src: getWeatherIconUrl(city.icon),
            scale: 0.8,
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction'
          }),
          text: new Text({
            text: city.city,
            offsetY: -40,
            fill: new Fill({ color: '#ffffff' }),
            stroke: new Stroke({ color: '#000000', width: 2 }),
            font: '12px Calibri,sans-serif'
          })
        });

        feature.setStyle(iconStyle);
        return feature;
      });

    // Create vector layer
    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      name: 'cityLayer'
    });

    map.addLayer(vectorLayer);

    // Create tooltips
    cityData
      .filter(city => city.map_plotable && city.coord)
      .forEach(city => {
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'city-tooltip';
        tooltipElement.innerHTML = `
          <div class="bg-slate-800/95 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg border border-slate-600 max-w-xs">
            <div class="font-bold text-green-300">${city.city}</div>
            <div class="text-sm text-slate-300">${city.tooltip}</div>
            <div class="text-xs text-slate-400 mt-1">
              <div>Population: ${city.population?.toLocaleString() || 'N/A'}</div>
              <div>Area: ${city.area || 'N/A'}</div>
              <div>Climate: ${city.climate || 'N/A'}</div>
            </div>
          </div>
        `;

        const overlay = new Overlay({
          element: tooltipElement,
          position: fromLonLat([city.coord.lon, city.coord.lat]),
          positioning: 'bottom-center',
          offset: [0, -10],
          className: 'city-overlay'
        });

        map.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      });

    // Cleanup function
    return () => {
      overlaysRef.current.forEach(overlay => {
        map.removeOverlay(overlay);
      });
      overlaysRef.current = [];
      
      const layers = map.getLayers().getArray().filter(layer => 
        layer.get('name') === 'cityLayer'
      );
      layers.forEach(layer => map.removeLayer(layer));
    };
  }, [map, cityData]);

  return null;
};

const getWeatherIconUrl = (iconName) => {
  const iconMap = {
    'weather-sunny': '☀️',
    'weather-cloudy': '☁️',
    'weather-rainy': '🌧️',
    'weather-snowy': '❄️',
    'weather-stormy': '⛈️',
    'weather-foggy': '🌫️',
    'weather-windy': '💨',
    'weather-hot': '🌡️',
    'weather-cold': '🥶'
  };

  // For now, we'll use emoji as icons. In a real app, you'd use actual icon files
  const emoji = iconMap[iconName] || '🌤️';
  
  // Create a data URL with the emoji
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 16, 16);
  
  return canvas.toDataURL();
};

export default CityTooltips;