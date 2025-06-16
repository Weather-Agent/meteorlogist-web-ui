import { useState, useEffect, useRef } from 'react';
import Chatbot from './components/Chatbot';
import MapView from './components/MapView';
import { cn } from './lib/utils';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [weatherQuery, setWeatherQuery] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);

  const [mapWidthPercent, setMapWidthPercent] = useState(66);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleChatSubmit = (query) => {
    setWeatherQuery(query);

    const locationMatch = query.match(/near\s+([a-zA-Z\s]+)/i);
    if (locationMatch && locationMatch[1]) {
      setWeatherLocation(locationMatch[1].trim());
      setShowMap(true);
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  const onDragStart = (e) => {
    if (viewportWidth < 768) return;
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };

  const onDragEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.userSelect = 'auto';
  };

  const onDrag = (e) => {
    if (!draggingRef.current) return;

    let clientX;
    if (e.type === 'touchmove') clientX = e.touches[0].clientX;
    else clientX = e.clientX;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let newWidthPercent = ((clientX - rect.left) / rect.width) * 100;

    if (newWidthPercent < 20) newWidthPercent = 20;
    if (newWidthPercent > 80) newWidthPercent = 80;

    setMapWidthPercent(newWidthPercent);
  };

  useEffect(() => {
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });

    return () => {
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
    };
  }, []);

  const isMobile = viewportWidth < 768;

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden"
      style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
    >
      {/* Map Panel */}
      <div
        className={cn(
          'overflow-hidden flex flex-col',
          !showMap && 'pointer-events-none'
        )}
        style={{
          height: isMobile ? (showMap ? '50%' : '0') : '100%',
          width: isMobile ? '100%' : showMap ? `${mapWidthPercent}%` : '0',
          flexShrink: 0,
          position: 'relative',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          transform: isMobile
            ? showMap
              ? 'translateY(0)'
              : 'translateY(-100%)'
            : showMap
            ? 'translateX(0)'
            : 'translateX(-100%)',
          opacity: showMap ? 1 : 0,
          backgroundColor: 'inherit',
          zIndex: 20,
        }}
      >
        <MapView location={weatherLocation} query={weatherQuery} onClose={handleCloseMap} />
      </div>

      {/* Drag handle (desktop only) */}
      {showMap && !isMobile && (
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className="cursor-col-resize bg-slate-700"
          style={{
            width: '5px',
            height: '100%',
            userSelect: 'none',
            touchAction: 'none',
            transition: isDragging ? 'none' : 'background-color 0.3s ease',
            zIndex: 30,
          }}
          onMouseEnter={e => !isDragging && (e.currentTarget.style.backgroundColor = '#94a3b8')}
          onMouseLeave={e => !isDragging && (e.currentTarget.style.backgroundColor = '')}
        />
      )}

      {/* Chatbot Panel */}
      <div
        className="flex flex-col"
        style={{
          height: isMobile ? (showMap ? '50%' : '100%') : '100%',
          width: isMobile ? '100%' : showMap ? `${100 - mapWidthPercent}%` : '100%',
          flexGrow: 1,
          flexShrink: 1,
          transition: isDragging ? 'none' : 'all 0.3s ease',
          backgroundColor: 'inherit',
          zIndex: 10,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Chatbot
          onSubmit={handleChatSubmit}
          showMapButton={!showMap}
          onMapOpen={() => setShowMap(true)}
        />
      </div>
    </div>
  );
}

export default App;
