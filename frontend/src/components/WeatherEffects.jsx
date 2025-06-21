import React, { useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import './weatherEffects.css';

const PATTERN_MAPPING = {
  'rain': 'rain',
  'rainfall': 'rain',
  'raining': 'rain',
  'rainy': 'rain',
  'precipitation': 'rain',
  'thunder': 'thunderstorm',
  'thunderstorm': 'thunderstorm',
  'storm': 'thunderstorm',
  'lightning': 'thunderstorm',
  'sunny': 'sunny',
  'sun': 'sunny',
  'clear': 'sunny',
  'cloudy': 'cloudy',
  'clouds': 'cloudy',
  'overcast': 'cloudy',
  'partly cloudy': 'partlyCloudy',
  'snow': 'snow',
  'snowing': 'snow',
  'snowfall': 'snow',
  'fog': 'fog',
  'foggy': 'fog',
  'mist': 'fog',
  'wind': 'wind',
  'windy': 'wind',
  'tornado': 'tornado',
  'rainbow': 'rainbow',
  'hot': 'hot',
  'heat': 'hot',
  'cold': 'cold',
  'fire': 'fire',
  'wildfire': 'fire',
  'flood': 'flood',
  'flooding': 'flood',
  'earthquake': 'earthquake',
  'quake': 'earthquake',
  'hurricane': 'hurricane',
  'cyclone': 'hurricane',
  'drought': 'drought'
};

const WEATHER_EMOJI = {
  sunny: '☀️',
  cloudy: '☁️',
  partlyCloudy: '⛅',
  rain: '🌧️',
  heavyRain: '⛈️',
  thunderstorm: '⛈️',
  snow: '🌨️',
  fog: '🌫️',
  wind: '💨',
  tornado: '🌪️',
  rainbow: '🌈',
  hot: '🌡️',
  cold: '❄️',
  fire: '🔥',
  hurricane: '🌀',
  drought: '🏜️',
};

const DEFAULT_SIZE = 64;
const MIN_SIZE = 32;
const MAX_SIZE = 128;

const WeatherEffects = ({ pattern: rawPattern = 'default', coordinates, location, map }) => {
  const containerRef = useRef(null);
  const effectsRef = useRef([]);
  const lastZoomRef = useRef(null);
  const actualCoordinates = coordinates || location;
  const pattern = PATTERN_MAPPING[rawPattern.toLowerCase()] || rawPattern.toLowerCase();

  const cleanupEffects = () => {
    if (effectsRef.current) {
      effectsRef.current.forEach(effect => {
        try {
          if (effect?.parentNode) {
            effect.parentNode.removeChild(effect);
          }
        } catch (error) {
          console.error('Error removing effect:', error);
        }
      });
      effectsRef.current = [];
    }
  };

  const calculateSize = () => {
    if (!map) return DEFAULT_SIZE;
    const zoom = map.getView().getZoom();
    const baseZoom = 12;
    const zoomDiff = zoom - baseZoom;
    const scaleFactor = Math.pow(1.2, zoomDiff);
    const targetSize = Math.min(Math.max(DEFAULT_SIZE * scaleFactor, MIN_SIZE), MAX_SIZE);
    if (lastZoomRef.current === null) {
      lastZoomRef.current = targetSize;
      return targetSize;
    }
    const smoothFactor = 0.3;
    const smoothedSize = lastZoomRef.current + (targetSize - lastZoomRef.current) * smoothFactor;
    lastZoomRef.current = smoothedSize;
    return smoothedSize;
  };

  const createEarthquakeEffect = (container, pixel, size) => {
    const effect = document.createElement('div');
    effect.className = 'earthquake-effect';
    effect.style.left = `${pixel[0]}px`;
    effect.style.top = `${pixel[1]}px`;

    const effectContainer = document.createElement('div');
    effectContainer.className = 'earthquake-container';

    const circle = document.createElement('div');
    circle.className = 'earthquake-circle';
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;

    const danger = document.createElement('div');
    danger.className = 'earthquake-danger';
    danger.textContent = '⚠';
    danger.style.fontSize = `${size * 0.6}px`;
    circle.appendChild(danger);

    const rays = document.createElement('div');
    rays.className = 'earthquake-rays';
    rays.style.width = `${size * 4}px`;
    rays.style.height = `${size * 4}px`;

    for (let i = 0; i < 8; i++) {
      const ray = document.createElement('div');
      ray.className = 'earthquake-ray';
      ray.style.height = `${size * 2}px`;
      ray.style.width = `${Math.max(2, size * 0.08)}px`;
      ray.style.setProperty('--angle', `${i * 45}deg`);
      rays.appendChild(ray);
    }

    effectContainer.appendChild(rays);
    effectContainer.appendChild(circle);
    effect.appendChild(effectContainer);
    container.appendChild(effect);
    return effect;
  };

  const createFloodEffect = (container, pixel, size) => {
    const effect = document.createElement('div');
    effect.className = 'flood-area';
    effect.style.left = `${pixel[0]}px`;
    effect.style.top = `${pixel[1]}px`;
    effect.style.width = `${size * 2}px`;
    effect.style.height = `${size * 1.5}px`;
    effect.style.transform = 'translate(-50%, -50%)';

    const ripple = document.createElement('div');
    ripple.className = 'flood-ripple';
    effect.appendChild(ripple);

    const waves = document.createElement('div');
    waves.className = 'flood-waves';
    effect.appendChild(waves);

    container.appendChild(effect);
    return effect;
  };

  const createWindEffect = (container) => {
    const existingEffects = container.querySelectorAll('.wind-effect');
    existingEffects.forEach(el => el.remove());

    const existingStyles = document.querySelectorAll('style[data-wind-animation]');
    existingStyles.forEach(style => style.remove());

    const overlay = document.createElement('div');
    overlay.className = 'wind-effect';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none';
    overlay.style.overflow = 'visible';

    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-wind-animation', 'true');
    styleSheet.textContent = `
      @keyframes windSlide {
        from { transform: translateX(0); }
        to { transform: translateX(calc(100vw + 300px)); }
      }
    `;
    document.head.appendChild(styleSheet);

    for (let i = 0; i < 100; i++) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.width = '200px';
      line.style.height = `${2 + Math.random() * 3}px`;
      line.style.backgroundColor = '#ffffff';
      line.style.opacity = '0.9';
      line.style.boxShadow = '0 0 15px 5px rgba(255, 255, 255, 0.9)';
      line.style.top = `${Math.random() * 100}%`;
      line.style.left = '-200px';

      if (Math.random() > 0.5) {
        line.style.borderRadius = '50%';
        line.style.height = `${3 + Math.random() * 2}px`;
      }

      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * -5;
      line.style.animation = `windSlide ${duration}s linear ${delay}s infinite`;
      overlay.appendChild(line);
    }

    container.appendChild(overlay);
    return overlay;
  };

  const createEffect = (container) => {
    cleanupEffects();
    if (!actualCoordinates || !map) return;

    const olCoords = fromLonLat(actualCoordinates);
    const pixel = map.getPixelFromCoordinate(olCoords);
    const size = calculateSize();
    if (!pixel) return;

    let effect;
    if (pattern === 'wind') {
      cleanupEffects();
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.zIndex = '99999';
      container.style.pointerEvents = 'none';
      effect = createWindEffect(container);
    } else if (pattern === 'earthquake') {
      effect = createEarthquakeEffect(container, pixel, size);
    } else if (pattern === 'flood') {
      effect = createFloodEffect(container, pixel, size);
    } else if (WEATHER_EMOJI[pattern]) {
      effect = document.createElement('div');
      effect.className = 'weather-emoji';
      effect.textContent = WEATHER_EMOJI[pattern];
      effect.style.left = `${pixel[0]}px`;
      effect.style.top = `${pixel[1]}px`;
      effect.style.fontSize = `${size}px`;
      container.appendChild(effect);
    }

    if (effect) {
      effectsRef.current = [effect];
      requestAnimationFrame(() => {
        updateEffectPositions();
      });
    }
  };

  const updateEffectPositions = () => {
    if (!map || !actualCoordinates || effectsRef.current.length === 0) return;
    const olCoords = fromLonLat(actualCoordinates);
    const pixel = map.getPixelFromCoordinate(olCoords);
    const size = calculateSize();
    if (!pixel) return;

    effectsRef.current.forEach(effect => {
      effect.style.left = `${pixel[0]}px`;
      effect.style.top = `${pixel[1]}px`;

      if (pattern === 'earthquake') {
        const circle = effect.querySelector('.earthquake-circle');
        if (circle) {
          circle.style.width = `${size}px`;
          circle.style.height = `${size}px`;
        }
        const danger = effect.querySelector('.earthquake-danger');
        if (danger) {
          danger.style.fontSize = `${size * 0.6}px`;
        }
        const rays = effect.querySelectorAll('.earthquake-ray');
        rays.forEach(ray => {
          ray.style.height = `${size * 2}px`;
          ray.style.width = `${Math.max(2, size * 0.08)}px`;
        });
        const raysContainer = effect.querySelector('.earthquake-rays');
        if (raysContainer) {
          raysContainer.style.width = `${size * 4}px`;
          raysContainer.style.height = `${size * 4}px`;
        }
      } else if (pattern === 'flood') {
        effect.style.width = `${size * 2}px`;
        effect.style.height = `${size * 1.5}px`;
      } else if (pattern === 'wind') {
        if (effect) {
          effect.style.zIndex = '99999';
          effect.style.display = 'block';
          effect.style.visibility = 'visible';
          effect.style.position = 'fixed';
          if (effect.childNodes.length === 0) {
            effectsRef.current = [createWindEffect(containerRef.current)];
          }
          const windLines = effect.querySelectorAll('div');
          windLines.forEach(line => {
            if (parseFloat(line.style.opacity) < 0.8) {
              line.style.opacity = '0.9';
            }
            if (!line.style.boxShadow || line.style.boxShadow === 'none') {
              line.style.boxShadow = '0 0 15px 5px rgba(255, 255, 255, 0.9)';
            }
          });
        }
      } else {
        effect.style.fontSize = `${size}px`;
      }
    });
  };

  useEffect(() => {
    cleanupEffects();
    if (containerRef.current && map && actualCoordinates) {
      Promise.resolve().then(() => {
        createEffect(containerRef.current);
        updateEffectPositions();
        setTimeout(updateEffectPositions, 100);
      });
    }

    const moveHandler = () => {
      requestAnimationFrame(updateEffectPositions);
    };

    if (map) {
      map.on('moveend', moveHandler);
      map.on('postrender', moveHandler);
      const checkMapReady = () => {
        if (map.getTargetElement()) {
          createEffect(containerRef.current);
          updateEffectPositions();
        }
      };
      map.once('rendercomplete', checkMapReady);
      map.once('postrender', checkMapReady);
    }

    return () => {
      cleanupEffects();
      if (map) {
        map.un('moveend', moveHandler);
        map.un('postrender', moveHandler);
      }
    };
  }, [pattern, actualCoordinates, map, coordinates, location]);

  return (
    <div 
      ref={containerRef}
      className="weather-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'visible'
      }}
    />
  );
};

export default WeatherEffects;