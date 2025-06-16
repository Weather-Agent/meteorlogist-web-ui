import { useEffect, useRef } from 'react';

const WeatherEffects = ({ pattern, location }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    switch (pattern) {
      case 'thunderstorm':
        createThunderstormEffect(containerRef.current, location);
        break;
      case 'rain':
        createRainEffect(containerRef.current, location);
        break;
      case 'wind':
        createWindEffect(containerRef.current, location);
        break;
      case 'fog':
        createFogEffect(containerRef.current, location);
        break;
      case 'snow':
        createSnowEffect(containerRef.current, location);
        break;
      case 'sunny':
        createSunnyEffect(containerRef.current, location);
        break;
      case 'cloudy':
        createCloudyEffect(containerRef.current, location);
        break;
      default:
        break;
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [pattern, location]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

// 🔻 Animation logic per pattern
const createThunderstormEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-64 h-64 pointer-events-none";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 32}px`;
  area.style.top = `${screenCoords.y - 32}px`;

  for (let i = 0; i < 5; i++) {
    const lightning = document.createElement('div');
    lightning.className = "absolute bg-yellow-300 opacity-0 animate-flash";
    lightning.style.width = `${2 + Math.random() * 5}px`;
    lightning.style.height = `${30 + Math.random() * 40}px`;
    lightning.style.left = `${Math.random() * 64}px`;
    lightning.style.top = `${Math.random() * 64}px`;
    lightning.style.transformOrigin = 'top center';
    lightning.style.transform = `rotate(${-20 + Math.random() * 40}deg)`;
    lightning.style.animationDelay = `${Math.random() * 5}s`;
    lightning.style.animationDuration = `${0.5 + Math.random() * 1.5}s`;
    lightning.style.filter = 'blur(1px)';
    area.appendChild(lightning);
  }

  container.appendChild(area);
};

const createRainEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-96 h-96 pointer-events-none overflow-hidden";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 48}px`;
  area.style.top = `${screenCoords.y - 48}px`;

  for (let i = 0; i < 100; i++) {
    const raindrop = document.createElement('div');
    raindrop.className = "absolute bg-blue-300 rounded-full animate-rain";
    raindrop.style.width = `${1 + Math.random() * 2}px`;
    raindrop.style.height = `${10 + Math.random() * 15}px`;
    raindrop.style.left = `${Math.random() * 96}px`;
    raindrop.style.top = `${Math.random() * 96}px`;
    raindrop.style.opacity = `${0.5 + Math.random() * 0.5}`;
    raindrop.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
    raindrop.style.animationDelay = `${Math.random() * 2}s`;
    area.appendChild(raindrop);
  }

  container.appendChild(area);
};

const createWindEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-128 h-96 pointer-events-none";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 64}px`;
  area.style.top = `${screenCoords.y - 48}px`;

  for (let i = 0; i < 30; i++) {
    const wind = document.createElement('div');
    wind.className = "absolute bg-white rounded-full opacity-40 animate-wind";
    wind.style.height = `${1 + Math.random() * 1.5}px`;
    wind.style.width = `${15 + Math.random() * 30}px`;
    wind.style.left = `${Math.random() * 128}px`;
    wind.style.top = `${Math.random() * 96}px`;
    wind.style.animationDuration = `${2 + Math.random() * 3}s`;
    wind.style.animationDelay = `${Math.random() * 5}s`;
    wind.style.filter = 'blur(1px)';
    area.appendChild(wind);
  }

  container.appendChild(area);
};

const createFogEffect = (container) => {
  const area = document.createElement('div');
  area.className = "absolute w-full h-full pointer-events-none";

  const fog = document.createElement('div');
  fog.className = "absolute inset-0 bg-white opacity-40 animate-fog";
  fog.style.backdropFilter = 'blur(8px)';
  area.appendChild(fog);

  container.appendChild(area);
};

const createSnowEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-96 h-96 pointer-events-none overflow-hidden";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 48}px`;
  area.style.top = `${screenCoords.y - 48}px`;

  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = "absolute bg-white rounded-full animate-snow";
    snowflake.style.width = `${2 + Math.random() * 4}px`;
    snowflake.style.height = `${2 + Math.random() * 4}px`;
    snowflake.style.left = `${Math.random() * 96}px`;
    snowflake.style.top = `${Math.random() * 96}px`;
    snowflake.style.opacity = `${0.6 + Math.random() * 0.4}`;
    snowflake.style.animationDuration = `${3 + Math.random() * 5}s`;
    snowflake.style.animationDelay = `${Math.random() * 5}s`;
    area.appendChild(snowflake);
  }

  container.appendChild(area);
};

const createSunnyEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-64 h-64 pointer-events-none";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 32}px`;
  area.style.top = `${screenCoords.y - 32}px`;

  const sun = document.createElement('div');
  sun.className = "absolute rounded-full animate-pulse";
  sun.style.width = '40px';
  sun.style.height = '40px';
  sun.style.background = 'radial-gradient(circle, rgba(255,236,100,0.8) 0%, rgba(255,167,0,0) 70%)';
  sun.style.left = '12px';
  sun.style.top = '12px';
  sun.style.filter = 'blur(3px)';
  sun.style.animationDuration = '3s';
  area.appendChild(sun);

  container.appendChild(area);
};

const createCloudyEffect = (container, location) => {
  const area = document.createElement('div');
  area.className = "absolute w-128 h-96 pointer-events-none";

  const screenCoords = getScreenPosition(location);
  area.style.left = `${screenCoords.x - 64}px`;
  area.style.top = `${screenCoords.y - 48}px`;

  for (let i = 0; i < 5; i++) {
    const cloud = document.createElement('div');
    cloud.className = "absolute bg-white rounded-full opacity-60 animate-float";
    cloud.style.width = `${40 + Math.random() * 60}px`;
    cloud.style.height = `${20 + Math.random() * 30}px`;
    cloud.style.left = `${Math.random() * 128}px`;
    cloud.style.top = `${Math.random() * 48}px`;
    cloud.style.filter = 'blur(5px)';
    cloud.style.animationDuration = `${20 + Math.random() * 10}s`;
    cloud.style.animationDelay = `${Math.random() * 20}s`;
    area.appendChild(cloud);
  }

  container.appendChild(area);
};

const getScreenPosition = (location) => {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };
};

export default WeatherEffects;
