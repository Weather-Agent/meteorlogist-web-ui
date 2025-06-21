import { useEffect, useRef } from "react";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";

const CityTooltips = ({ map, cityData = [] }) => {
  const overlaysRef = useRef([]);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !cityData.length) {
      // Clean up existing overlays and layers
      cleanup();
      return;
    }

    // Clean up existing overlays and layers
    cleanup();

    // Create features for cities
    const features = cityData
      .filter((city) => city.map_plotable && city.coord)
      .map((city) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([city.coord.lon, city.coord.lat])),
          city: city,
        });

        // Style with weather icon and city name
        const iconStyle = new Style({
          image: new Icon({
            src: getWeatherIconUrl(city.icon),
            scale: 1.2,
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
          }),
          text: new Text({
            text: city.city,
            offsetY: 35,
            fill: new Fill({ color: "#ffffff" }),
            stroke: new Stroke({ color: "#1e293b", width: 3 }),
            font: "bold 14px Calibri,sans-serif",
            textAlign: "center",
          }),
        });

        feature.setStyle(iconStyle);
        return feature;
      });

    if (features.length === 0) return;

    // Create vector layer
    const vectorSource = new VectorSource({
      features: features,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      name: "cityLayer",
      zIndex: 1000,
    });

    map.addLayer(vectorLayer);
    layerRef.current = vectorLayer;    // Create persistent tooltips for each city
    cityData
      .filter((city) => city.map_plotable && city.coord)
      .forEach((city) => {
        const tooltipElement = document.createElement("div");
        tooltipElement.className = "city-tooltip-content";
        tooltipElement.innerHTML = `
          <div class="bg-slate-800/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-slate-600 max-w-xs pointer-events-none">
            <div class="font-bold text-green-300 text-sm mb-1">${
              city.city
            }</div>
            <div class="text-sm text-slate-200 mb-2">${
              city.tooltip || "Weather info unavailable"
            }</div>
            <div class="text-xs text-slate-400 space-y-1">
              <div class="flex justify-between">
                <span>Population:</span> 
                <span class="text-slate-300">${
                  formatNumber(city.population) || "N/A"
                }</span>
              </div>
              <div class="flex justify-between">
                <span>Area:</span> 
                <span class="text-slate-300">${city.area || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span>State:</span> 
                <span class="text-slate-300">${city.state || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span>Climate:</span> 
                <span class="text-slate-300">${city.climate || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span>Coordinates:</span> 
                <span class="text-slate-300">${city.coord.lat.toFixed(4)}, ${city.coord.lon.toFixed(4)}</span>
              </div>
            </div>
          </div>
        `;

        const overlay = new Overlay({
          element: tooltipElement,
          position: fromLonLat([city.coord.lon, city.coord.lat]),
          positioning: "bottom-center",
          offset: [0, -45],
          className: "city-overlay",
          stopEvent: false,
        });

        map.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      });

    // Cleanup function
    return cleanup;
  }, [map, cityData]);

  const cleanup = () => {
    // Remove existing overlays
    overlaysRef.current.forEach((overlay) => {
      if (map) {
        map.removeOverlay(overlay);
      }
    });
    overlaysRef.current = [];

    // Remove existing city layer
    if (layerRef.current && map) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
  };

  return null;
};

const formatNumber = (num) => {
  if (!num) return null;
  return new Intl.NumberFormat().format(num);
};

const getWeatherIconUrl = (iconName) => {
  const iconMap = {
    "weather-sunny": "☀️",
    "weather-cloudy": "☁️",
    "weather-rainy": "🌧️",
    "weather-snowy": "❄️",
    "weather-stormy": "⛈️",
    "weather-foggy": "🌫️",
    "weather-windy": "💨",
    "weather-hot": "🌡️",
    "weather-cold": "🥶",
  };

  // For now, we'll use emoji as icons. In a real app, you'd use actual icon files
  const emoji = iconMap[iconName] || "🌤️";

  // Create a data URL with the emoji
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 24, 24);

  return canvas.toDataURL();
};

export default CityTooltips;
