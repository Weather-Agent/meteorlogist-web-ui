import { useEffect, useRef, useState, useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import './weatherEffects.css';
import { checkAnimationsEnabled } from './weatherEffectsDebugHelper';

export default function WeatherEffects({ pattern, location }) {
  const containerRef = useRef(null);
  const [effectPosition, setEffectPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [mapInstance, setMapInstance] = useState(null);
  const [mapViewport, setMapViewport] = useState({ width: 0, height: 0 });
  const locationRef = useRef(location); // Keep reference to avoid closure issues
  
  // Update location reference when it changes
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  
  // Update effect position when map view changes
  useEffect(() => {
    if (!containerRef.current || !location) return;
    
    // Wait a small delay to ensure the map has initialized
    const initTimer = setTimeout(() => {
      // Get proper map container with more robust selector
      const mapContainer = containerRef.current?.closest('.relative')?.querySelector('[data-map-container]') || 
                           document.querySelector('[data-map-container]');
      
      if (!mapContainer) {
        console.warn("Weather effects: Map container not found");
        return;
      }      // Get map instance from the container with fallback
      const map = mapContainer.__map;
      if (!map) {
        console.warn("Weather effects: Map instance not found");
        return;
      }
      
      console.log("Weather effects: Map instance connected successfully");
      
      // Store map instance for other effects to use
      setMapInstance(map);
      
      // Get map viewport size for proper scaling of effects
      const mapElement = mapContainer;
      const updateViewportSize = () => {
        if (mapElement) {
          const rect = mapElement.getBoundingClientRect();
          setMapViewport({
            width: rect.width,
            height: rect.height
          });
          console.log(`Weather effects: Map viewport size updated to ${rect.width}x${rect.height}`);
        }
      };
      
      // Initial viewport size
      updateViewportSize();

      // Function to update position based on map view
      const updatePosition = () => {
        const currentLocation = locationRef.current;
        if (!map || !currentLocation) return;
        
        try {
          // Convert geo coordinates to pixel coordinates
          const pixel = map.getPixelFromCoordinate(fromLonLat(currentLocation));
          
          if (pixel) {
            console.log(`Weather effects: Updating position to ${pixel[0]},${pixel[1]} from location`, currentLocation);
            setEffectPosition({ x: pixel[0], y: pixel[1] });
          } else {
            console.warn("Weather effects: Failed to get pixel coordinates");
          }
        } catch (error) {
          console.error("Weather effects: Error updating position", error);
        }
      };

      // Call initially
      updatePosition();      // Add listeners for map movements with more comprehensive events
      const events = ['moveend', 'change:resolution', 'change:center', 'postrender', 'movestart', 'pointerdrag'];
      events.forEach(eventName => {
        map.on(eventName, updatePosition);
      });
        // Enhanced resize observer for better minimization handling
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const rect = entry.contentRect;
          
          // Get the actual map container size including any transforms
          const mapContainer = document.querySelector('[data-map-container]');
          const actualRect = mapContainer?.getBoundingClientRect();
          
          // Use actual dimensions to account for minimization
          const width = actualRect?.width || rect.width;
          const height = actualRect?.height || rect.height;
          
          setMapViewport({
            width,
            height
          });
          
          // Force update all effects with new size
          updatePosition();
          updateAllEffectPositions({ x: effectPosition.x, y: effectPosition.y });
          
          console.log(`Weather effects: Map viewport observed size change to ${width}x${height}`);
        }
      });
      
      // Start observing the map container
      resizeObserver.observe(mapElement);
      
      // Also add window resize listener for better positioning
      const handleResize = () => {
        updatePosition();
        updateViewportSize();
      };
      
      window.addEventListener('resize', handleResize);

      // Clean up
      return () => {
        events.forEach(eventName => {
          map.un(eventName, updatePosition);
        });
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }, 300); // Short delay to ensure map is ready
    
    return () => clearTimeout(initTimer);
  }, [location]);
  // Function to update positions of all effects when map moves or resizes
  const updateAllEffectPositions = useCallback((newPosition) => {
    if (!containerRef.current) return;
    
    // Find all weather effects containers
    const weatherEffects = containerRef.current.querySelectorAll('[data-effect-type]');
    
    if (weatherEffects.length === 0) {
      console.log("Weather effects: No effect elements found to update");
      return;
    }
    
    // Get current map container
    const mapContainer = document.querySelector('[data-map-container]');
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      // Update viewport size if changed
      if (mapViewport.width !== mapRect.width || mapViewport.height !== mapRect.height) {
        setMapViewport({
          width: mapRect.width,
          height: mapRect.height
        });
        console.log(`Weather effects: Viewport updated to ${mapRect.width}x${mapRect.height}`);
      }
    }
    
    console.log(`Weather effects: Updating ${weatherEffects.length} effects to position ${newPosition.x},${newPosition.y}`);
    
    // Update each effect's position and size
    weatherEffects.forEach(effect => {
      // Use the element's updatePosition method if available (this will handle size too)
      if (typeof effect.updatePosition === 'function') {
        effect.updatePosition(newPosition);
      } else {
        // Fallback for effects without updatePosition method
        effect.style.left = `${newPosition.x}px`;
        effect.style.top = `${newPosition.y}px`;
        
        // Ensure transform is properly centered for all effects
        if (!effect.style.transform || !effect.style.transform.includes('translate')) {
          effect.style.transform = 'translate(-50%, -50%)';
        }
        
        // Attempt to resize based on effect type
        const effectType = effect.getAttribute('data-effect-type');
        if (effectType && mapContainer) {
          const mapWidth = mapContainer.clientWidth;
          const mapHeight = mapContainer.clientHeight;
          
          let newWidth, newHeight;
          switch (effectType) {
            case 'rain':
              newWidth = Math.min(700, mapWidth * 0.8);
              newHeight = Math.min(600, mapHeight * 0.8);
              break;
            case 'flood':
              newWidth = Math.min(600, mapWidth * 0.7);
              newHeight = Math.min(400, mapHeight * 0.7);
              break;
            case 'wind':
              newWidth = Math.min(800, mapWidth * 0.9);
              newHeight = Math.min(600, mapHeight * 0.9);
              break;
            default:
              newWidth = Math.min(500, mapWidth * 0.6);
              newHeight = Math.min(500, mapHeight * 0.6);
          }
          
          effect.style.width = `${newWidth}px`;
          effect.style.height = `${newHeight}px`;
        }
      }
    });
  }, [mapViewport]);
  
  // Update effect positions when map moves
  useEffect(() => {
    // Always update positions when effectPosition changes
    updateAllEffectPositions(effectPosition);
    // Log position changes for debugging
    console.log(`Weather effects: Position updated to ${effectPosition.x},${effectPosition.y}`);
  }, [effectPosition, updateAllEffectPositions]);  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing effects with proper cleanup
    const existingEffects = containerRef.current.querySelectorAll('[data-effect-type]');
    existingEffects.forEach(effect => {
      if (typeof effect.cleanup === 'function') {
        effect.cleanup();
      }
    });
    containerRef.current.innerHTML = '';
    
    console.log(`Weather pattern: ${pattern} - Effects disabled`);
    
    // No effects are created - all weather effects have been removed

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [pattern, effectPosition]);// Create a resize observer for the container to handle minimizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create observer to handle container size changes (minimizing/maximizing)
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        console.log(`Weather effects container resized: ${rect.width}x${rect.height}`);
        
        // Update all effects when container size changes
        updateAllEffectPositions(effectPosition);
      }
    });
    
    // Observe the container and parent elements for size changes
    resizeObserver.observe(containerRef.current);
    
    // If we have a parent with relative positioning, observe that too
    const parent = containerRef.current.closest('.relative');
    if (parent) {
      resizeObserver.observe(parent);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [effectPosition, updateAllEffectPositions]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      style={{ 
        // Use 100% sizing to ensure it properly resizes with container
        width: '100%',
        height: '100%'
      }}
    />
  );
};

// 🔻 Animation logic per pattern
// Create a prominent global wind effect that looks like air flow, not tides
const addGlobalWindEffect = (container) => {
  console.log('Adding global air flow wind effect');
  
  // Create a full-screen overlay for air flow effect across entire map
  const globalWindOverlay = document.createElement('div');
  globalWindOverlay.className = "absolute inset-0 pointer-events-none opacity-60"; // Slightly lower opacity
  globalWindOverlay.style.zIndex = '1';
  
  // Create improved air flow patterns with more realistic flow lines
  const airFlowPattern = document.createElement('div');
  airFlowPattern.className = "absolute inset-0";  airFlowPattern.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Cdefs%3E%3Cmarker id='arrowhead' markerWidth='8' markerHeight='6' refX='0' refY='3' orient='auto'%3E%3Cpath d='M0,0 L0,6 L8,3 z' fill='rgba(255,255,255,0.4)' /%3E%3C/marker%3E%3C/defs%3E%3Cg%3E%3Cpath d='M10,100 Q100,80 200,100 T400,90 T600,110 T800,90' stroke='rgba(255,255,255,0.3)' stroke-width='1.2' fill='none' marker-end='url(%23arrowhead)' /%3E%3Cpath d='M10,250 Q120,230 240,250 T450,230 T650,250 T850,230' stroke='rgba(255,255,255,0.25)' stroke-width='1.1' fill='none' marker-end='url(%23arrowhead)' /%3E%3Cpath d='M50,400 Q150,380 250,400 T450,380 T650,400 T850,380' stroke='rgba(255,255,255,0.3)' stroke-width='1.2' fill='none' marker-end='url(%23arrowhead)' /%3E%3Cpath d='M30,550 Q130,530 230,550 T430,530 T630,550 T830,530' stroke='rgba(255,255,255,0.25)' stroke-width='1.1' fill='none' marker-end='url(%23arrowhead)' /%3E%3Cpath d='M10,700 Q110,680 210,700 T410,680 T610,700 T810,680' stroke='rgba(255,255,255,0.3)' stroke-width='1.2' fill='none' marker-end='url(%23arrowhead)' /%3E%3Cpath d='M40,850 Q140,830 240,850 T440,830 T640,850 T840,830' stroke='rgba(255,255,255,0.25)' stroke-width='1.1' fill='none' marker-end='url(%23arrowhead)' /%3E%3C/g%3E%3C/svg%3E")`;
  airFlowPattern.style.backgroundSize = '1000px 1000px';
  
  // Add second air flow layer with different pattern for better cross-flow visualization
  const secondaryAirFlowPattern = document.createElement('div');
  secondaryAirFlowPattern.className = "absolute inset-0";  secondaryAirFlowPattern.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cdefs%3E%3Cmarker id='arrowhead2' markerWidth='6' markerHeight='5' refX='0' refY='2.5' orient='auto'%3E%3Cpath d='M0,0 L0,5 L6,2.5 z' fill='rgba(255,255,255,0.3)' /%3E%3C/marker%3E%3C/defs%3E%3Cg%3E%3Cpath d='M300,10 Q280,100 300,190 T280,380 T300,570 T280,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3Cpath d='M600,10 Q580,100 600,190 T580,380 T600,570 T580,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3Cpath d='M500,10 Q480,100 500,190 T480,380 T500,570 T480,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3Cpath d='M200,10 Q180,100 200,190 T180,380 T200,570 T180,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3Cpath d='M400,10 Q380,100 400,190 T380,380 T400,570 T380,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3Cpath d='M700,10 Q680,100 700,190 T680,380 T700,570 T680,760' stroke='rgba(255,255,255,0.2)' stroke-width='1' fill='none' marker-end='url(%23arrowhead2)' /%3E%3C/g%3E%3C/svg%3E")`;
  secondaryAirFlowPattern.style.backgroundSize = '800px 800px';
  
  // Add wind particle layer for more dynamic air flow movement
  const windParticlesLayer = document.createElement('div');
  windParticlesLayer.className = "absolute inset-0";
  
  // Create air flow particles that move across the screen
  for (let i = 0; i < 60; i++) { // More particles for better visibility
    const windParticle = document.createElement('div');
    
    // Create varied air particle types
    const particleSize = 1 + Math.random() * 2; // Smaller size for better air flow look
    windParticle.className = "absolute rounded-full";
    windParticle.style.width = `${particleSize}px`;
    windParticle.style.height = `${particleSize}px`;
    
    // Using subtle gradient for air particles
    if (Math.random() > 0.6) {
      windParticle.style.background = 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)';
    } else {
      windParticle.style.backgroundColor = 'rgba(255,255,255,0.4)';
    }
      // Position particles across the screen at varied heights
    windParticle.style.left = `-10px`;
    windParticle.style.top = `${Math.random() * 100}%`;
    
    // Custom transform for each air particle
    const height = Math.floor(Math.random() * 100);
    const upDown = Math.random() > 0.5 ? 1 : -1;
    const curve = Math.floor(Math.random() * 15) + 5; // Gentler curves for air flow
    
    windParticle.style.setProperty('--height', height + '%');
    windParticle.style.setProperty('--curve', curve * upDown + 'px');
    
    windParticlesLayer.appendChild(windParticle);
  }
  
  // Add air stream lines for more dynamic flow effect
  for (let i = 0; i < 10; i++) { // More streamlines
    const streamline = document.createElement('div');
    streamline.className = "absolute";
    
    // Streamline styles - thin lines with gradients for air flow look
    streamline.style.height = '1px';
    streamline.style.width = '180px';
    streamline.style.background = 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)';
      // Distribute streamlines across the height
    streamline.style.top = `${i * 10 + Math.random() * 5}%`;
    streamline.style.left = '0';
    
    globalWindOverlay.appendChild(streamline);
  }  // Add custom keyframes for improved air flow animations
  const windStyleElement = document.createElement('style');
  windStyleElement.textContent = `
    /* Static air flow styles - no animations */
    .air-flow-static {
      opacity: 0.5;
    }
  `;
    globalWindOverlay.appendChild(windStyleElement);
  globalWindOverlay.appendChild(airFlowPattern);
  globalWindOverlay.appendChild(secondaryAirFlowPattern);
  globalWindOverlay.appendChild(windParticlesLayer);
  container.appendChild(globalWindOverlay);
};

const createThunderstormEffect = (container, position) => {
  console.log(`Creating thunderstorm effect (cloud+rain+thunder) at position: ${position.x},${position.y}`);
  
  // Create rain effect with clouds first (reusing components)
  createRainEffect(container, position);
  
  // Get map container dimensions
  const mapContainer = document.querySelector('[data-map-container]');
  if (!mapContainer) {
    console.error("Thunderstorm effect: Map container not found!");
    return;
  }
  const mapWidth = mapContainer.clientWidth || window.innerWidth;
  const mapHeight = mapContainer.clientHeight || window.innerHeight;
  
  // Replace existing white clouds with dark gray clouds
  const existingClouds = container.querySelectorAll('[data-effect-type="cloudy"] div');
  existingClouds.forEach(cloud => {
    cloud.style.backgroundColor = 'rgba(70, 70, 80, 0.9)';
    if (cloud.childNodes) {
      Array.from(cloud.childNodes).forEach(puff => {
        if (puff.style) {
          puff.style.backgroundColor = 'rgba(60, 60, 70, 0.95)';
        }
      });
    }
  });
  
  // Add lightning effect
  const lightningArea = document.createElement('div');
  lightningArea.className = "absolute pointer-events-none overflow-visible";
  lightningArea.style.width = `${Math.min(600, mapWidth * 0.7)}px`;
  lightningArea.style.height = `${Math.min(500, mapHeight * 0.7)}px`;
  lightningArea.style.left = `${position.x}px`;
  lightningArea.style.top = `${position.y}px`;
  lightningArea.style.transform = 'translate(-50%, -50%)';
  lightningArea.style.zIndex = '12'; // Above clouds
  lightningArea.setAttribute('data-effect-type', 'lightning');
  
  // Add updatePosition function for map movement
  lightningArea.updatePosition = (newPos) => {
    if (newPos && typeof newPos.x === 'number' && typeof newPos.y === 'number') {
      lightningArea.style.left = `${newPos.x}px`;
      lightningArea.style.top = `${newPos.y}px`;
    }
  };
    // Create lightning animation styles
  const lightningStyle = document.createElement('style');
  lightningStyle.textContent = `
    /* Static lightning styles - no animations */
    .lightning-static {
      opacity: 0.8;
    }
  `;
  lightningArea.appendChild(lightningStyle);
  
  // Create 3 lightning bolts that will flash randomly
  for (let i = 0; i < 3; i++) {
    const bolt = document.createElement('div');
    bolt.className = "absolute";
    
    // SVG for jagged lightning bolt
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "300");
    svg.style.overflow = "visible";
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Create zigzag path for lightning
    let pathD = "M50,0 "; // Start from middle top
    let x = 50;
    let y = 0;
    
    // Generate random zigzag segments
    for (let j = 0; j < 6; j++) {
      x += (Math.random() * 50) - 25;
      y += 50;
      pathD += `L${x},${y} `;
    }
    
    path.setAttribute("d", pathD);
    path.setAttribute("stroke", "rgba(255, 255, 200, 0.9)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    
    svg.appendChild(path);
    bolt.appendChild(svg);
      // Grid-based positioning for better coverage
    const xPos = (col * 16.67) + (Math.random() * 8 - 4); // 16.67% = 100/6 columns
    const yPos = (row * 25) + (Math.random() * 10 - 5);   // 25% = 100/4 rows
    
    arrow.style.left = `${xPos}%`;
    arrow.style.top = `${yPos}%`;
    arrow.style.width = '80px';
    arrow.style.height = '30px';
    
    // Enhanced wind animation
    const baseDelay = i * 0.2;
    const randomOffset = Math.random() * 0.5;
    arrow.style.animation = `windArrowFloat 2s ease-in-out infinite`;
    arrow.style.animationDelay = `${baseDelay + randomOffset}s`;
    arrow.style.opacity = "0.9";
    
    lightningArea.appendChild(bolt);
  }
  
  container.appendChild(lightningArea);

  // Add multiple black storm clouds with more coverage
  for (let i = 0; i < 15; i++) { // More clouds
    const cloud = document.createElement('div');
    cloud.className = "absolute rounded-full";
    
    // Large storm clouds with varied sizes
    const size = 120 + Math.random() * 180; // Larger clouds
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * 0.8}px`; // Taller aspect ratio for imposing clouds
    
    // Position clouds across the top with more overlap for complete dark sky effect
    cloud.style.left = `${(i * 80) - 60 + (Math.random() * 70 - 35)}px`;
    cloud.style.top = `${Math.random() * 120}px`;
      // Almost black clouds with very little variation for more dramatic effect
    const darkValue = 15 + Math.random() * 20; // Darker range (15-35)
    cloud.style.backgroundColor = `rgb(${darkValue}, ${darkValue}, ${darkValue + 5})`;
    cloud.style.opacity = `${0.9 + Math.random() * 0.1}`; // Higher opacity
    cloud.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)'; // Stronger shadow
    cloud.style.filter = 'blur(5px)'; // More blur for ominous look
    
    cloudLayer.appendChild(cloud);
    
    // Add multiple cloud puffs for more texture and depth
    const cloudPuffs = Math.floor(Math.random() * 5) + 4; // More puffs
    for (let j = 0; j < cloudPuffs; j++) {
      const puff = document.createElement('div');
      puff.className = "absolute rounded-full";
      
      const puffSize = size * (0.6 + Math.random() * 0.5); // Larger puffs
      puff.style.width = `${puffSize}px`;
      puff.style.height = `${puffSize}px`;
      
      // Position puffs to create dense storm cloud look
      puff.style.left = `${Math.random() * 70 - 35 + size/2}px`;
      puff.style.top = `${Math.random() * 40 - 20}px`;
      
      // Very dark for true black clouds
      const puffDark = darkValue + (Math.random() * 10);
      puff.style.backgroundColor = `rgb(${puffDark}, ${puffDark}, ${puffDark + 3})`;
      puff.style.opacity = '0.95'; // Nearly opaque
      puff.style.filter = 'blur(4px)';
      
      cloud.appendChild(puff);
    }
  }
  
  area.appendChild(cloudLayer);
  
  // Add second layer of clouds for depth and more coverage
  const secondCloudLayer = document.createElement('div');
  secondCloudLayer.className = "absolute w-full";
  secondCloudLayer.style.height = '200px';
  secondCloudLayer.style.top = '100px';
  secondCloudLayer.style.left = '150px';
  secondCloudLayer.style.zIndex = '10.5';
  
  for (let i = 0; i < 8; i++) {
    const cloud = document.createElement('div');
    cloud.className = "absolute rounded-full";
    
    const size = 100 + Math.random() * 150;
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * 0.7}px`;
    
    cloud.style.left = `${(i * 110) - 40 + (Math.random() * 60 - 30)}px`;
    cloud.style.top = `${Math.random() * 70}px`;
      const darkValue = 20 + Math.random() * 25;
    cloud.style.backgroundColor = `rgb(${darkValue}, ${darkValue}, ${darkValue+5})`;
    cloud.style.opacity = '0.85';
    cloud.style.filter = 'blur(4px)';
    
    secondCloudLayer.appendChild(cloud);
  }
  
  area.appendChild(secondCloudLayer);

  // Add multiple lightning bolts with enhanced electricity effect
  for (let i = 0; i < 12; i++) { // More lightning
    const lightningGroup = document.createElement('div');
    lightningGroup.className = "absolute";
    lightningGroup.style.left = `${100 + Math.random() * 800}px`; // Wider distribution
    lightningGroup.style.top = `${100 + Math.random() * 150}px`;
    lightningGroup.style.zIndex = '15';
    
    // Create main lightning bolt
    const mainBolt = document.createElement('div');
    mainBolt.className = "absolute";
    
    // Create jagged lightning path using SVG for more realistic look
    const lightningPath = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lightningPath.setAttribute("width", "120"); // Wider lightning
    lightningPath.setAttribute("height", "400"); // Longer lightning
    lightningPath.setAttribute("viewBox", "0 0 120 400");
    lightningPath.style.overflow = "visible";
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const startX = 60;
    let pathD = `M${startX},0 `;
    
    // Create more dramatic zig-zag pattern for lightning
    let currentX = startX;
    let currentY = 0;
    const segments = 5 + Math.floor(Math.random() * 5);
    
    for (let j = 1; j <= segments; j++) {
      const segmentLength = 300 / segments;
      currentY += segmentLength;
      currentX += (Math.random() * 40) - 20;
      pathD += `L${currentX},${currentY} `;
    }
    
    path.setAttribute("d", pathD);
    path.setAttribute("stroke", "rgba(255, 255, 200, 0.9)");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    
    lightningPath.appendChild(path);
    mainBolt.appendChild(lightningPath);
      // Add glowing effect to lightning
    mainBolt.style.filter = "drop-shadow(0 0 8px rgba(255, 255, 200, 0.8))";
    
    // Create flash animation
    mainBolt.style.opacity = "0.8";
    
    lightningGroup.appendChild(mainBolt);
    
    // Add a few smaller branch bolts
    if (Math.random() > 0.5) {
      const branches = 1 + Math.floor(Math.random() * 2);
      for (let b = 0; b < branches; b++) {
        const branchBolt = document.createElement('div');
        branchBolt.className = "absolute";
        
        const branchingSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        branchingSvg.setAttribute("width", "100");
        branchingSvg.setAttribute("height", "150");
        branchingSvg.setAttribute("viewBox", "0 0 100 150");
        
        const branchPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        // Random branch point
        const branchPoint = 50 + Math.random() * 100;
        const branchX = currentX + ((Math.random() * 30) - 15);
        
        const branchD = `M${currentX},${branchPoint} L${branchX},${branchPoint + 50 + Math.random() * 50}`;
        
        branchPath.setAttribute("d", branchD);
        branchPath.setAttribute("stroke", "rgba(255, 255, 200, 0.7)");
        branchPath.setAttribute("stroke-width", "2");
        branchPath.setAttribute("fill", "none");
        
        branchingSvg.appendChild(branchPath);
        branchBolt.appendChild(branchingSvg);
          branchBolt.style.filter = "drop-shadow(0 0 5px rgba(255, 255, 200, 0.6))";
        branchBolt.style.opacity = "0.6";
        
        lightningGroup.appendChild(branchBolt);
      }
    }
    
    area.appendChild(lightningGroup);
  }
  // Add rain for the thunderstorm
  for (let i = 0; i < 150; i++) {
    const raindrop = document.createElement('div');
    raindrop.className = "absolute bg-blue-300";
    raindrop.style.width = `${1 + Math.random() * 1.5}px`;
    raindrop.style.height = `${15 + Math.random() * 20}px`;
    raindrop.style.left = `${Math.random() * 800}px`;
    raindrop.style.top = `${Math.random() * 600}px`;
    raindrop.style.opacity = `${0.6 + Math.random() * 0.4}`;
    raindrop.style.transform = 'rotate(10deg)';  // Angled rain for storm effect
    area.appendChild(raindrop);
  }
    // Add custom keyframes for lightning flash
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Static thunderstorm styles - no animations */
    .thunderstorm-static {
      opacity: 0.8;
    }
  `;
  area.appendChild(styleElement);
    // Add occasional background flash effect for whole scene
  const flashOverlay = document.createElement('div');
  flashOverlay.className = "absolute inset-0";
  flashOverlay.style.zIndex = '6';
  flashOverlay.style.pointerEvents = 'none';
  area.appendChild(flashOverlay);
  
  container.appendChild(area);
};

const createRainEffect = (container, position) => {
  // Create a rain effect with clouds on top
  console.log(`Creating rain effect with clouds at position: ${position.x},${position.y}`);
  
  // First create clouds
  createCloudyEffect(container, position);
    // Get map container dimensions to scale effects appropriately
  const mapContainer = document.querySelector('[data-map-container]');
  if (!mapContainer) {
    console.error("Rain effect: Map container not found!");
    return;
  }
  const mapWidth = mapContainer.clientWidth || window.innerWidth;
  const mapHeight = mapContainer.clientHeight || window.innerHeight;
  
  // Calculate effect size for rain falling from clouds
  // Keep the rain area wide enough while clouds will be smaller
  const effectWidth = Math.min(500, mapWidth * 0.6); // 60% of map width, max 500px - WIDER THAN CLOUDS
  const effectHeight = Math.min(400, mapHeight * 0.6); // 60% of map height, max 400px - TALLER FOR RAINFALL
  
  // Create a rain effect
  const area = document.createElement('div');
  area.className = "absolute pointer-events-none overflow-visible";
  area.style.width = `${effectWidth}px`;
  area.style.height = `${effectHeight}px`;
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y + 50}px`; // Position slightly lower below clouds
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.3s, top 0.3s, width 0.3s, height 0.3s'; // Add transitions for size
  area.style.zIndex = '9'; // Below clouds
  
  area.setAttribute('data-effect-type', 'rain');
  // Create more visible rain animation with faster drops
  const style = document.createElement('style');
  style.textContent = `
    /* Static rain styles - no animations */
    .rain-static {
      opacity: 0.8;
    }
  `;
  area.appendChild(style);
  
  // Create more visible raindrops despite smaller clouds
  for (let i = 0; i < 150; i++) { // Increased from 100 to 150 for better visibility
    const drop = document.createElement('div');
    drop.className = "absolute";
      // Make raindrops very noticeable
    const isHeavy = Math.random() > 0.5; // 50% chance of heavy rain
      if (isHeavy) {
      // Heavier, much more visible drops
      drop.style.backgroundColor = "rgba(220, 240, 255, 0.95)"; // Higher opacity
      drop.style.width = `${2.0 + Math.random() * 2.0}px`; // Much wider drops
      drop.style.height = `${25 + Math.random() * 15}px`; // Much longer drops
      drop.style.boxShadow = '0 0 4px rgba(255, 255, 255, 0.5)'; // Stronger glow
      drop.style.filter = 'blur(0.5px)'; // Less blur for sharper appearance
    } else {
      // Regular drops - also more visible
      drop.style.backgroundColor = "rgba(200, 230, 255, 0.85)"; // Higher opacity
      drop.style.width = `${1.5 + Math.random() * 1.5}px`; // Wider drops
      drop.style.height = `${20 + Math.random() * 10}px`; // Longer drops
      drop.style.boxShadow = '0 0 2px rgba(255, 255, 255, 0.4)'; // Add glow
    }
    
    // Better distribution of raindrops using grid-based approach for more even coverage
    const cellSize = 8; // 8% grid cells for finer coverage
    const gridWidth = 12; // 12 columns
    const row = Math.floor(i / gridWidth) % Math.floor(100/cellSize);
    const col = i % gridWidth;
      // Position drops in a grid with some randomness
    drop.style.left = `${col * (100/gridWidth) + Math.random() * (80/gridWidth)}%`;
    drop.style.top = `${row * cellSize + Math.random() * cellSize}%`;
    
    area.appendChild(drop);
  }
  
  container.appendChild(area);
    // Enhanced updatePosition function that handles both position and size changes properly
  area.updatePosition = (newPos) => {
    if (newPos && typeof newPos.x === 'number' && typeof newPos.y === 'number') {
      // Update position
      area.style.left = `${newPos.x}px`;
      area.style.top = `${newPos.y + 50}px`; // Keep offset below clouds
      
      // Get current map dimensions for responsive scaling
      const mapContainer = document.querySelector('[data-map-container]');
      if (mapContainer) {
        // Calculate new size based on map viewport
        const mapRect = mapContainer.getBoundingClientRect();
        const mapWidth = mapRect.width;
        const mapHeight = mapRect.height;
        
        // Keep rain area wide enough even with small clouds
        const newWidth = Math.min(500, mapWidth * 0.6); 
        const newHeight = Math.min(400, mapHeight * 0.6);
        
        // Update size if changed
        if (parseFloat(area.style.width) !== newWidth || parseFloat(area.style.height) !== newHeight) {
          area.style.width = `${newWidth}px`;
          area.style.height = `${newHeight}px`;
          console.log(`Rain effect: Resized to ${newWidth}x${newHeight}`);
          
          // Also update the raindrops' distribution when size changes
          // This ensures the rain patterns still look good at different sizes
          const raindrops = area.querySelectorAll('div:not(style)');
          if (raindrops.length > 0) {
            raindrops.forEach((drop, i) => {
              const gridWidth = 12;
              const cellSize = 8;
              const row = Math.floor(i / gridWidth) % Math.floor(100/cellSize);
              const col = i % gridWidth;
              
              // Reposition drops based on new size
              drop.style.left = `${col * (100/gridWidth) + Math.random() * (80/gridWidth)}%`;
              drop.style.top = `${row * cellSize + Math.random() * cellSize}%`;
            });
          }
        }
      }
    }
  };
    // Animation styles already added above
  
  return area; // Return the element so it can be referenced
  const cloudLayer = document.createElement('div');
  cloudLayer.className = "absolute";
  cloudLayer.style.width = '120%'; // Wider than the container to ensure full coverage
  cloudLayer.style.height = '250px'; // Proper height for visibility
  cloudLayer.style.left = '-10%'; // Offset to center the wider cloud layer
  cloudLayer.style.top = '-30px';
  cloudLayer.style.zIndex = '11';
  cloudLayer.style.animation = 'cloudFloat 25s ease-in-out infinite';
  
  // Create more visible rain clouds with proper contrast
  const cloudTypes = [
    { // Dark storm cloud - more visible
      color: 'rgb(70, 70, 85)', 
      opacity: 0.98,
      blur: '3px',
      shadow: '0 8px 20px rgba(0,0,0,0.6)'
    },
    { // Medium gray cloud - more contrast
      color: 'rgb(100, 100, 120)', 
      opacity: 0.95,
      blur: '3.5px',
      shadow: '0 7px 18px rgba(0,0,0,0.5)'
    },
    { // Lighter rain cloud - still visible
      color: 'rgb(130, 130, 150)', 
      opacity: 0.9,
      blur: '4px',
      shadow: '0 6px 15px rgba(0,0,0,0.4)'
    }
  ];
  
  // Add fuller cloud coverage with better distribution
  for (let i = 0; i < 30; i++) { // Even more clouds for complete coverage    const cloud = document.createElement('div');
    cloud.className = "absolute rounded-full";
    
    // Larger cloud sizes for better visibility and coverage
    const size = 120 + Math.random() * 150;
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * (0.55 + Math.random() * 0.25)}px`; // Realistic cloud heights
    
    // Position clouds for more complete coverage with better overlap
    const columnWidth = 50; // Closer spacing
    const cloudPosition = (i * columnWidth) - (Math.random() * 30);
    cloud.style.left = `${cloudPosition}px`; // Better cloud density
    cloud.style.top = `${Math.random() * 140}px`; // More vertical spread
    
    // Select random cloud type for variety but maintain visibility
    const cloudType = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    cloud.style.backgroundColor = cloudType.color;
    cloud.style.opacity = cloudType.opacity;
    cloud.style.boxShadow = cloudType.shadow;    cloud.style.filter = `blur(${cloudType.blur})`;
    cloud.style.willChange = 'transform'; // Performance optimization
    
    cloudLayer.appendChild(cloud);    
    // Add more cloud puffs for realistic rain cloud formations
    const cloudPuffs = Math.floor(Math.random() * 7) + 5; // More detailed puffs
    for (let j = 0; j < cloudPuffs; j++) {
      const puff = document.createElement('div');
      puff.className = "absolute rounded-full";
      
      // More varied puff sizes for realistic clouds
      const puffSize = size * (0.45 + Math.random() * 0.45);
      puff.style.width = `${puffSize}px`;
      puff.style.height = `${puffSize}px`;
      
      // Better positioning for more natural looking rain clouds
      puff.style.left = `${Math.random() * 50 - 25 + size/2}px`;
      puff.style.top = `${Math.random() * 25 - 12}px`;
      
      // Use proper gray values from the cloud type
      const cloudColor = cloudType.color.match(/\d+/g);
      if (cloudColor && cloudColor.length >= 3) {
        const grayValue = parseInt(cloudColor[0]);
        puff.style.backgroundColor = `rgb(${grayValue-10}, ${grayValue-10}, ${grayValue-5})`;
      } else {
        puff.style.backgroundColor = 'rgb(100, 100, 115)';
      }
      
      puff.style.opacity = '0.95'; // Higher opacity for better visibility
      puff.style.filter = 'blur(2.5px)';
      
      cloud.appendChild(puff);
    }
  }
  
  area.appendChild(cloudLayer);  // Add second layer of clouds for improved depth and visibility
  const secondCloudLayer = document.createElement('div');
  secondCloudLayer.className = "absolute";
  secondCloudLayer.style.width = '140%'; // Extra wide for better coverage
  secondCloudLayer.style.height = '150px';
  secondCloudLayer.style.top = '60px';
  secondCloudLayer.style.left = '-20%'; // Offset more to create a staggered effect
  secondCloudLayer.style.zIndex = '10';
  
  for (let i = 0; i < 18; i++) { // Even more clouds for complete coverage
    const cloud = document.createElement('div');
    cloud.className = "absolute rounded-full";
    
    // Slightly larger clouds for better visibility
    const size = 70 + Math.random() * 90;
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * 0.65}px`;
    
    cloud.style.left = `${(i * 70) - 30 + (Math.random() * 40 - 20)}px`;
    cloud.style.top = `${Math.random() * 70}px`;
      // Lighter gray for secondary layer but still visible
    const grayValue = 150 + Math.random() * 50;
    cloud.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue+5})`;
    cloud.style.opacity = '0.8'; // Higher opacity for better visibility
    cloud.style.filter = 'blur(2.5px)'; // Less blur for better definition
    
    secondCloudLayer.appendChild(cloud);
  }
  
  area.appendChild(secondCloudLayer);  // Add raindrops CSS animations directly to make sure they're available
  const rainAnimStyles = document.createElement('style');
  rainAnimStyles.textContent = `
    /* Static rain styles - no animations */
    .static-rain {
      opacity: 0.9;
    }
  `;
  area.appendChild(rainAnimStyles);
    // Add abundant rain drops with enhanced visibility
  for (let i = 0; i < 1500; i++) { // Increased drop count for more visible rainfall
    const raindrop = document.createElement('div');
    
    // Create more visible raindrop types with increased variation
    const dropType = Math.random();      if (dropType < 0.4) { // 40% chance of heavy drops - increased from 30%
      raindrop.className = "absolute rounded-full";
      raindrop.style.backgroundColor = 'rgba(220, 240, 255, 0.98)';
      raindrop.style.width = `${3 + Math.random() * 3}px`; // Wider drops
      raindrop.style.height = `${35 + Math.random() * 45}px`; // Longer drops
      raindrop.style.opacity = '0.98'; // Increased opacity
      raindrop.style.boxShadow = '0 0 8px rgba(220, 240, 255, 0.9), 0 0 3px rgba(255, 255, 255, 0.8)'; // Enhanced glow
      raindrop.style.filter = 'blur(0.5px)'; // Slight blur for better visibility
    } else if (dropType < 0.8) { // 40% chance of medium drops (increased from 45%)
      raindrop.className = "absolute rounded-full";
      raindrop.style.backgroundColor = 'rgba(200, 230, 255, 0.95)';
      raindrop.style.width = `${2.2 + Math.random() * 2}px`; // Wider
      raindrop.style.height = `${25 + Math.random() * 35}px`; // Longer
      raindrop.style.opacity = '0.95'; // Increased opacity
      raindrop.style.boxShadow = '0 0 4px rgba(200, 230, 255, 0.7)'; // Enhanced glow
    } else { // 20% chance of lighter drops (reduced from 25%)
      raindrop.className = "absolute rounded-full";
      raindrop.style.backgroundColor = 'rgba(180, 210, 255, 0.9)';
      raindrop.style.width = `${1.5 + Math.random() * 1.5}px`; // Wider
      raindrop.style.height = `${20 + Math.random() * 25}px`; // Longer
      raindrop.style.opacity = '0.9'; // Increased opacity
      raindrop.style.boxShadow = '0 0 2px rgba(180, 210, 255, 0.4)'; // Added glow
    }
      // Rain distribution - full coverage across the entire viewport for maximum visibility
    const width = 700;  // Use full width
    const height = 600; // Use full height
    
    // Create much more uniform distribution to ensure rain is visible everywhere
    const distributionFactor = Math.random();
    
    // Divide the area into a grid pattern for more uniform coverage
    const gridX = Math.floor(Math.random() * 14);  // 14 columns
    const gridY = Math.floor(Math.random() * 12);  // 12 rows
    const jitterX = Math.random() * 50 - 25;       // Add some randomness
    const jitterY = Math.random() * 50 - 25;       // Add some randomness
    
    // Position based on grid with jitter for natural look but ensure full coverage
    raindrop.style.left = `${gridX * 50 + jitterX}px`;    raindrop.style.top = `${gridY * 50 + jitterY}px`;
    
    // Add varying angles to rain to suggest wind gusts - more variation
    const angle = 10 + (Math.random() * 8 - 4); // 6-18 degree angle
    raindrop.style.transform = `rotate(${angle}deg)`;
    area.appendChild(raindrop);
  }  
  
  // Add much more dramatic rain splash effects on the ground with better visibility
  for (let i = 0; i < 150; i++) { // Significantly more splashes for better visibility
    const splash = document.createElement('div');
    splash.className = "absolute";
    
    // Different types of splashes with improved visibility
    const splashType = Math.random();
    
    if (splashType < 0.25) {
      // Large splash circles - very visible
      splash.style.width = '5px';
      splash.style.height = '5px';
      splash.style.backgroundColor = 'rgba(240, 250, 255, 0.95)';
      splash.style.boxShadow = '0 0 4px rgba(220, 240, 255, 0.9)';
    } else if (splashType < 0.6) {
      // Medium splashes - good visibility
      splash.style.width = '3px';
      splash.style.height = '3px';
      splash.style.backgroundColor = 'rgba(220, 240, 255, 0.9)';
      splash.style.boxShadow = '0 0 2px rgba(210, 230, 255, 0.7)';
    } else {
      // Small spray splashes - still visible
      splash.style.width = '2px';
      splash.style.height = '2px';
      splash.style.backgroundColor = 'rgba(210, 235, 255, 0.85)';
    }
    
    splash.style.borderRadius = '50%';
    
    // Position splashes near the bottom with more concentration in central visible area
    const distributionFactor = Math.random();
    
    if (distributionFactor < 0.7) {
      // Central area - highest concentration for visibility
      splash.style.left = `${250 + (Math.random() * 200)}px`; // More concentrated
      splash.style.bottom = `${10 + (Math.random() * 50)}px`; // Near ground
    } else if (distributionFactor < 0.9) {
      // Medium radius - moderate concentration
      splash.style.left = `${100 + (Math.random() * 500)}px`; // Wider area
      splash.style.bottom = `${5 + (Math.random() * 70)}px`; // Various heights
    } else {
      // Outer edges - fewer splashes
      splash.style.left = `${Math.random() * 700}px`; // Still contained
      splash.style.bottom = `${Math.random() * 80}px`; // Various heights
    }
      splash.style.zIndex = '12';
    
    // More dynamic, faster splash animation with varied timing for better effect
    const splashSpeed = 0.2 + Math.random() * 0.8; // Faster animation
    
    area.appendChild(splash);
  }
    // Add custom keyframes for enhanced splash effects with better visibility
  const splashStyleElement = document.createElement('style');
  splashStyleElement.textContent = `
    /* Static splash styles - no animations */
    .splash-static {
      opacity: 0.8;
    }
  `;
  area.appendChild(splashStyleElement);

  container.appendChild(area);
};

const createWindEffect = (container, position) => {
  // Create persistent wind effect that covers the entire visible map area
  console.log(`Creating wind effect at position: ${position.x},${position.y}`);
  
  const area = document.createElement('div');
  area.className = "absolute pointer-events-none weather-effect-wind";
  area.style.width = '100%';  // Cover entire map width
  area.style.height = '100%'; // Cover entire map height
  area.style.left = '50%';
  area.style.top = '50%';
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'all 0.3s ease-out';
  area.style.zIndex = '15'; // Increased z-index to ensure visibility
  
  // Add data attribute to store effect type for location updates
  area.setAttribute('data-effect-type', 'wind');
    // Enhanced update function that handles both position and size changes
  area.updatePosition = (newPos) => {
    if (newPos && typeof newPos.x === 'number' && typeof newPos.y === 'number') {
      const mapContainer = document.querySelector('[data-map-container]');
      if (mapContainer) {
        const mapRect = mapContainer.getBoundingClientRect();
        
        // Update area size to match map size
        area.style.width = `${mapRect.width}px`;
        area.style.height = `${mapRect.height}px`;
        
        // Adjust arrow positions for new size
        const arrows = area.querySelectorAll('.wind-arrow');
        arrows.forEach((arrow, i) => {
          const row = Math.floor(i / 6);
          const col = i % 6;
          const xPos = (col * 16.67) + (Math.random() * 8 - 4);
          const yPos = (row * 25) + (Math.random() * 10 - 5);
          
          arrow.style.left = `${xPos}%`;
          arrow.style.top = `${yPos}%`;
        });
        
        console.log(`Wind effect: Updated size to ${mapRect.width}x${mapRect.height}`);
      }
    }
  };

  // Add intensified wind ripples at this location
  const localWindOverlay = document.createElement('div');
  localWindOverlay.className = "absolute inset-0 rounded-full";
  localWindOverlay.style.background = 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)';
  localWindOverlay.style.width = '100%';
  localWindOverlay.style.height = '100%';
  area.appendChild(localWindOverlay);

  // Create wind particles
  const particleCount = 60;
  for (let i = 0; i < particleCount; i++) {    const wind = document.createElement('div');
    const isStrongWind = Math.random() > 0.5; // Increase chance of strong wind particles
      wind.className = "absolute rounded-full animate-wind";
    wind.style.background = isStrongWind 
      ? 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' 
      : 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)';
    wind.style.height = `${3 + Math.random() * 4}px`; // Even more height
    wind.style.width = `${50 + Math.random() * 150}px`; // Much more width
    wind.style.boxShadow = isStrongWind 
      ? '0 0 8px rgba(255,255,255,0.6)' 
      : '0 0 6px rgba(255,255,255,0.4)';
    
    // Distribute across the area with more concentration in the center
    const distanceFromCenter = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const radius = distanceFromCenter * 250;
    
    const x = 300 + Math.cos(angle) * radius;
    const y = 200 + Math.sin(angle) * radius;
    
    wind.style.left = `${x}px`;
    wind.style.top = `${y}px`;    // Enhanced animation properties
    wind.style.opacity = `${0.5 + Math.random() * 0.5}`; // Increased opacity
    wind.style.filter = 'blur(1px) drop-shadow(0 0 2px rgba(255,255,255,0.3))'; // Added glow
    wind.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    
    area.appendChild(wind);
  }  // Add thin wind direction lines with better visibility
  for (let i = 0; i < 32; i++) { // Increased number of arrows for better coverage with thinner lines
    const arrow = document.createElement('div');
    arrow.className = "absolute wind-arrow";
    
    // Create grid layout for arrows (4 rows x 8 columns)
    const row = Math.floor(i / 8);
    const col = i % 8;
    arrow.style.width = '100px'; // Longer arrows
    arrow.style.height = '10px'; // Reduced height for thinner appearance
    
    // Better distribution of arrows across the entire area
    const xPos = (col * 12.5) + (Math.random() * 6 - 3); // 12.5% = 100/8 columns
    const yPos = (row * 25) + (Math.random() * 8 - 4);   // 25% = 100/4 rows
    
    arrow.style.left = `${xPos}%`;
    arrow.style.top = `${yPos}%`;
    
    // Slightly varied arrow directions
    const arrowAngle = -5 + (Math.random() * 10 - 5); // Reduced angle variation
    arrow.style.transform = `rotate(${arrowAngle}deg)`;
    
    // Create thinner, longer SVG arrow
    arrow.innerHTML = `<svg viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wind-glow-${i}">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
          <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="white" flood-opacity="0.3"/>
        </filter>
        <linearGradient id="arrow-gradient-${i}" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.8)" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.6)" />
        </linearGradient>
      </defs>
      <g filter="url(#wind-glow-${i})">
        <path d="M0,5 H80 M70,2 L83,5 L70,8" 
          stroke="url(#arrow-gradient-${i})" 
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </g>
    </svg>`;
      // Smoother animation for thin lines
    arrow.style.opacity = '0.8'; // Slightly reduced opacity for thinner lines
    
    area.appendChild(arrow);
  }
    // Add arrow animation keyframes
  const arrowStyleElement = document.createElement('style');
  arrowStyleElement.textContent = `
    /* Static wind arrow styles - no animations */
    .wind-arrow-static {
      opacity: 0.8;
    }
  `;
  area.appendChild(arrowStyleElement);

  container.appendChild(area);
};

const createFogEffect = (container) => {
  const area = document.createElement('div');
  area.className = "absolute w-full h-full pointer-events-none";
  const fog = document.createElement('div');
  fog.className = "absolute inset-0 bg-white opacity-40";
  fog.style.backdropFilter = 'blur(8px)';
  area.appendChild(fog);

  container.appendChild(area);
};

const createSnowEffect = (container, position) => {
  const area = document.createElement('div');
  area.className = "absolute w-96 h-96 pointer-events-none overflow-hidden";
  area.style.left = `${position.x - 48}px`;
  area.style.top = `${position.y - 48}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = "absolute bg-white rounded-full";
    snowflake.style.width = `${2 + Math.random() * 4}px`;
    snowflake.style.height = `${2 + Math.random() * 4}px`;
    snowflake.style.left = `${Math.random() * 96}px`;
    snowflake.style.top = `${Math.random() * 96}px`;
    snowflake.style.opacity = `${0.6 + Math.random() * 0.4}`;
    area.appendChild(snowflake);
  }

  container.appendChild(area);
};

const createSunnyEffect = (container, position) => {
  const area = document.createElement('div');
  area.className = "absolute w-64 h-64 pointer-events-none";
  area.style.left = `${position.x - 32}px`;
  area.style.top = `${position.y - 32}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  const sun = document.createElement('div');
  sun.className = "absolute rounded-full";
  sun.style.width = '40px';
  sun.style.height = '40px';
  sun.style.background = 'radial-gradient(circle, rgba(255,236,100,0.8) 0%, rgba(255,167,0,0) 70%)';
  sun.style.left = '12px';
  sun.style.top = '12px';
  sun.style.filter = 'blur(3px)';
  area.appendChild(sun);

  container.appendChild(area);
};

const createCloudyEffect = (container, position) => {
  console.log(`Creating simple cloudy effect at position: ${position.x},${position.y}`);
  
  // Get map container dimensions
  const mapContainer = document.querySelector('[data-map-container]');
  if (!mapContainer) {
    console.error("Cloud effect: Map container not found!");
    return;
  }
  const mapWidth = mapContainer.clientWidth || window.innerWidth;
  const mapHeight = mapContainer.clientHeight || window.innerHeight;
  
  // Create a visible cloud layer - SMALLER clouds as requested
  const area = document.createElement('div');
  area.className = "absolute pointer-events-none overflow-visible";
  area.style.width = `${Math.min(400, mapWidth * 0.5)}px`; // Reduced from 600px to 400px and 70% to 50%
  area.style.height = `${Math.min(200, mapHeight * 0.35)}px`; // Reduced from 300px to 200px and 50% to 35%
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.3s, top 0.3s, width 0.3s, height 0.3s'; // Added transition for width and height
  area.style.zIndex = '10';
  area.setAttribute('data-effect-type', 'cloudy');
    // Enhanced updatePosition function that handles both position and size changes properly
  area.updatePosition = (newPos) => {
    if (newPos && typeof newPos.x === 'number' && typeof newPos.y === 'number') {
      // Update position
      area.style.left = `${newPos.x}px`;
      area.style.top = `${newPos.y}px`;
      
      // Get current map dimensions for responsive scaling
      const mapContainer = document.querySelector('[data-map-container]');
      if (mapContainer) {
        const mapRect = mapContainer.getBoundingClientRect();
        const mapWidth = mapRect.width;
        const mapHeight = mapRect.height;
        
        // Dynamic sizing based on map size
        const newWidth = Math.min(400, mapWidth * 0.5);
        const newHeight = Math.min(200, mapHeight * 0.35);
        
        // Update size if changed
        if (parseFloat(area.style.width) !== newWidth || parseFloat(area.style.height) !== newHeight) {
          area.style.width = `${newWidth}px`;
          area.style.height = `${newHeight}px`;
          console.log(`Cloud effect: Resized to ${newWidth}x${newHeight}`);
        }
      }
    }
  };
  
  // Create cloud layer with CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-slow {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(20px); }
    }
  `;
  area.appendChild(style);
    // Add multiple white fluffy clouds - smaller but still visible
  for (let i = 0; i < 6; i++) { // Reduced from 8 to 6 clouds
    const cloud = document.createElement('div');
    cloud.className = "absolute rounded-full";
    
    // Smaller cloud size as requested
    const size = 50 + Math.random() * 80; // Reduced from 80-200 to 50-130
    cloud.style.width = `${size}px`;
    cloud.style.height = `${size * 0.6}px`;
    
    // Position clouds across the area - better distribution for smaller area
    cloud.style.left = `${(i * 55) + Math.random() * 25}px`; // Reduced spacing from 70 to 55
    cloud.style.top = `${Math.random() * 60}px`; // Reduced from 80 to 60
      // White fluffy clouds - increased contrast for better visibility despite smaller size
    cloud.style.backgroundColor = 'rgba(245, 245, 255, 0.9)'; // Increased from 0.85 to 0.9 opacity
    cloud.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.4)'; // Increased from 0.3 to 0.4
    cloud.style.filter = 'blur(3px)'; // Reduced blur from 5px to 3px for sharper definition
    
    area.appendChild(cloud);
      // Add puffy parts to each cloud - smaller but more defined
    const puffCount = Math.floor(2 + Math.random() * 3); // Reduced from 3-7 to 2-5 puffs
    for (let j = 0; j < puffCount; j++) {
      const puff = document.createElement('div');
      puff.className = "absolute rounded-full";
      
      // Slightly smaller puffs
      const puffSize = size * (0.5 + Math.random() * 0.3); // Reduced from 0.6-1.0 to 0.5-0.8
      puff.style.width = `${puffSize}px`;
      puff.style.height = `${puffSize}px`;
      
      // Better positioning for smaller clouds
      puff.style.left = `${Math.random() * size/2}px`;
      puff.style.top = `${Math.random() * (size/4)}px`;
      
      // More visible despite smaller size
      puff.style.backgroundColor = 'rgba(250, 250, 255, 0.95)'; // Increased from 0.9 to 0.95
      puff.style.filter = 'blur(3px)'; // Reduced blur from 5px to 3px for sharper definition
      
      cloud.appendChild(puff);
    }
  }
  
  container.appendChild(area);
};

// New emergency effects
const createFloodEffect = (container, position) => {
  // Create a minimalist flood area that follows the map position
  console.log(`Creating flood effect at position: ${position.x},${position.y}`);
  
  // Get map container dimensions to scale effects appropriately
  const mapContainer = document.querySelector('[data-map-container]');
  const mapWidth = mapContainer ? mapContainer.clientWidth : window.innerWidth;
  const mapHeight = mapContainer ? mapContainer.clientHeight : window.innerHeight;
  
  // Calculate appropriate effect size - making it smaller for minimalism
  const effectWidth = Math.min(400, mapWidth * 0.5); // Reduced from 0.7 to 0.5
  const effectHeight = Math.min(300, mapHeight * 0.5); // Reduced from 0.7 to 0.5
  
  // Create water area with appropriate size
  const area = document.createElement('div');
  area.className = "absolute pointer-events-none overflow-visible weather-effect-flood";
  area.style.width = `${effectWidth}px`;
  area.style.height = `${effectHeight}px`;
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.3s, top 0.3s, width 0.3s, height 0.3s';
  area.style.zIndex = '16';
  
  // Add data attribute to store effect type for location updates
  area.setAttribute('data-effect-type', 'flood');
  
  // Enhanced update function with better scaling behavior
  area.updatePosition = (newPos) => {
    if (!newPos || typeof newPos.x !== 'number' || typeof newPos.y !== 'number') return;
    
    // Get current map dimensions for responsive scaling
    const mapContainer = document.querySelector('[data-map-container]');
    if (!mapContainer) return;
    
    // Update position
    area.style.left = `${newPos.x}px`;
    area.style.top = `${newPos.y}px`;
    
    // Calculate new size based on map viewport
    const mapRect = mapContainer.getBoundingClientRect();
    const newWidth = Math.min(400, mapRect.width * 0.5);
    const newHeight = Math.min(300, mapRect.height * 0.5);
    
    // Update size if changed
    if (parseFloat(area.style.width) !== newWidth || parseFloat(area.style.height) !== newHeight) {
      area.style.width = `${newWidth}px`;
      area.style.height = `${newHeight}px`;
      console.log(`Flood effect: Resized to ${newWidth}x${newHeight}`);
      
      // When resizing, we may need to adjust the patches inside
      const patches = area.querySelectorAll('[data-patch-type="water"]');
      if (patches.length > 0) {
        console.log(`Adjusting ${patches.length} water patches for new size`);
      }
    }
  };
  
  // Create water patches - reduced count for minimalism
  const floodPatchCount = 10; // Reduced from 16
  let floodPatches = [];
  
  // Generate patches with proper distribution
  for (let i = 0; i < floodPatchCount; i++) {
    let x, y, width, height, opacity;
    
    // Two patterns: central area (larger patches) and smaller outlying patches
    if (i < floodPatchCount * 0.6) { // 60% in central flooded area
      // Create central water patches
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 30; // More contained area
      x = `${50 + Math.cos(angle) * distance}%`;
      y = `${50 + Math.sin(angle) * distance}%`;
      
      // Varied sizes for central area
      width = `${7 + Math.random() * 8}%`;
      height = `${6 + Math.random() * 7}%`;
      opacity = 0.55 + Math.random() * 0.15; // Slightly reduced opacity
    } else { // 40% outlying puddles
      // Create outlying water patches
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 25; 
      x = `${50 + Math.cos(angle) * distance}%`;
      y = `${50 + Math.sin(angle) * distance}%`;
      
      // Smaller sizes for outlying puddles
      width = `${3 + Math.random() * 5}%`;
      height = `${2 + Math.random() * 4}%`;
      opacity = 0.35 + Math.random() * 0.15; // Lower opacity for distant puddles
    }
    
    floodPatches.push({ x, y, width, height, opacity });
  }
  
  // Add minimal water animation styles
  const floodStyleElement = document.createElement('style');
  floodStyleElement.textContent = `
    @keyframes waterRipple {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    
    @keyframes gentleWave {
      0% { background-position: 0 0; }
      100% { background-position: 10px 0; }
    }
    
    @keyframes subtlePulse {
      0% { transform: scale(1); opacity: var(--base-opacity); }
      50% { transform: scale(1.01); opacity: calc(var(--base-opacity) + 0.03); }
      100% { transform: scale(1); opacity: var(--base-opacity); }
    }
  `;
  area.appendChild(floodStyleElement);
  
  // Create water patches - only water, no mud
  floodPatches.forEach((patch) => {
    const waterPatch = document.createElement('div');
    waterPatch.className = "absolute";
    waterPatch.setAttribute('data-patch-type', 'water'); // Add data attribute for easier selection
    waterPatch.style.left = patch.x;
    waterPatch.style.top = patch.y;
    waterPatch.style.width = patch.width;
    waterPatch.style.height = patch.height;
    
    // Create organic water shapes with varied border radius
    const radius1 = 20 + Math.floor(Math.random() * 35);
    const radius2 = 25 + Math.floor(Math.random() * 40);
    const radius3 = 20 + Math.floor(Math.random() * 35);
    const radius4 = 30 + Math.floor(Math.random() * 25);
    
    // More subtle, natural border radius
    waterPatch.style.borderRadius = `${radius1}% ${radius2}% ${radius3}% ${radius4}%`;
    
    // Water colors - only blue tones, no brown/mud
    // Using only blue water colors for clarity
    const waterColor = `linear-gradient(to bottom, 
      rgba(30,100,210,${patch.opacity * 0.9}), 
      rgba(20,80,160,${patch.opacity + 0.05}))`;
    
    waterPatch.style.background = waterColor;
    waterPatch.style.boxShadow = '0 0 5px rgba(0,70,150,0.2)';
      // Set base opacity as CSS variable for animation
    waterPatch.style.setProperty('--base-opacity', patch.opacity);
    waterPatch.style.opacity = patch.opacity;
    waterPatch.style.zIndex = '17';
    
    // Add gentle wave texture
    const waveTexture = document.createElement('div');
    waveTexture.className = "absolute inset-0 overflow-hidden";
    waveTexture.style.borderRadius = 'inherit';
      // Subtle wave pattern
    waveTexture.style.backgroundImage = 'linear-gradient(45deg, rgba(255,255,255,0.07) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.07) 75%, transparent 75%, transparent)';
    waveTexture.style.backgroundSize = '15px 15px';
    waveTexture.style.opacity = '0.3';
    waterPatch.appendChild(waveTexture);
    
    area.appendChild(waterPatch);
    
    // Add a single subtle ripple in some patches
    if (Math.random() > 0.5) {
      const rippleContainer = document.createElement('div');
      rippleContainer.className = "absolute";
      rippleContainer.style.left = `${Math.random() * 70 + 15}%`;
      rippleContainer.style.top = `${Math.random() * 70 + 15}%`;
      rippleContainer.style.width = '20px';
      rippleContainer.style.height = '20px';
        const ripple = document.createElement('div');
      ripple.className = "absolute inset-0 rounded-full";
      ripple.style.border = '1px solid rgba(255, 255, 255, 0.5)';
      
      rippleContainer.appendChild(ripple);
      waterPatch.appendChild(rippleContainer);
    }
  });
  
  // Add subtle warning marker
  const warning = document.createElement('div');
  warning.className = "absolute flex items-center justify-center";
  warning.style.left = '50%';
  warning.style.top = '50%';
  warning.style.transform = 'translate(-50%, -50%)';
  warning.style.width = '80px'; // Smaller
  warning.style.height = '80px'; // Smaller
  warning.style.zIndex = '20';
    warning.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-blue-600 bg-opacity-80 flex items-center justify-center border-2 border-blue-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 9v4M12 17h.01M4.929 19H19.07c1.275 0 2.12-1.335 1.551-2.443L13.235 4.304c-.614-1.183-2.307-1.183-2.92 0L2.427 16.557C1.91 17.622 2.69 19 4.929 19z"/>
      </svg>
    </div>
  `;
  
  // Add to container
  area.appendChild(warning);
  container.appendChild(area);
  
  return area; // Return the element for referencing
  
  area.appendChild(styleElement);
  area.appendChild(warning);
  container.appendChild(area);
};

const createHurricaneEffect = (container, position) => {
  // Add dark overlay to make map darker
  const darkOverlay = document.createElement('div');
  darkOverlay.className = "absolute inset-0 bg-slate-900 opacity-30";
  container.appendChild(darkOverlay);
  
  // Create hurricane area 
  const area = document.createElement('div');
  area.className = "absolute w-[800px] h-[800px] pointer-events-none overflow-hidden";
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  
  // Create hurricane spiral
  const spiral = document.createElement('div');
  spiral.className = "absolute";
  spiral.style.width = '500px';
  spiral.style.height = '500px';
  spiral.style.left = '150px';
  spiral.style.top = '150px';  spiral.style.borderRadius = '50%';
  spiral.style.background = 'conic-gradient(from 0deg, rgba(255,255,255,0.1), rgba(100,100,200,0.4), rgba(255,255,255,0.1))';
  spiral.style.opacity = '0.7';
  spiral.style.boxShadow = '0 0 100px 50px rgba(255,255,255,0.1)';
    // Add custom animation
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Static hurricane styles - no animations */
    .hurricane-static {
      opacity: 0.7;
    }
  `;
  
  area.appendChild(styleElement);
  area.appendChild(spiral);
    // Add rain effect
  for (let i = 0; i < 100; i++) {
    const rain = document.createElement('div');
    rain.className = "absolute bg-blue-200 rounded-full";
    rain.style.width = '2px';
    rain.style.height = '15px';
    rain.style.transform = 'rotate(15deg)';
    rain.style.left = `${Math.random() * 800}px`;
    rain.style.top = `${Math.random() * 800}px`;
    rain.style.opacity = '0.6';
    area.appendChild(rain);
  }
  
  container.appendChild(area);
};

const createFireEffect = (container, position) => {
  console.log("Creating FIRE effect at position:", position);
    // Add very subtle warm overlay for minimalistic effect
  const overlay = document.createElement('div');
  overlay.className = "absolute inset-0";
  overlay.style.background = 'radial-gradient(circle at center, rgba(255,100,0,0.1) 0%, rgba(255,0,0,0.05) 70%, rgba(0,0,0,0) 100%)';
  overlay.style.zIndex = '25';
  overlay.style.pointerEvents = 'none';
  container.appendChild(overlay);
  
  // Create smaller, more focused fire area
  const area = document.createElement('div');
  area.className = "absolute pointer-events-none";
  area.style.width = "400px"; // Smaller area
  area.style.height = "300px"; // Smaller area
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  area.style.zIndex = '30';
  
  // Create smaller fire glow effect with much less intensity
  const glow = document.createElement('div');
  glow.className = "absolute rounded-full";
  glow.style.width = '200px'; // Smaller glow
  glow.style.height = '100px'; // Smaller glow
  glow.style.background = 'radial-gradient(ellipse at center, rgba(255,140,0,0.3) 0%, rgba(255,69,0,0.2) 50%, rgba(255,0,0,0) 70%)';  glow.style.left = '50%';
  glow.style.bottom = '0px';
  glow.style.transform = 'translateX(-50%)';
  glow.style.filter = 'blur(8px)';
  area.appendChild(glow);
  
  // Add much lighter smoke with less density
  for (let i = 0; i < 15; i++) { // Fewer smoke particles
    const smoke = document.createElement('div');
    smoke.className = "absolute rounded-full";
    smoke.style.width = `${5 + Math.random() * 20}px`; // Smaller smoke
    smoke.style.height = `${5 + Math.random() * 20}px`; // Smaller smoke
    smoke.style.left = `${200 + (Math.random() * 100 - 50)}px`;
    smoke.style.bottom = `${30 + Math.random() * 100}px`;
    smoke.style.filter = 'blur(3px)';
    
    // Lighter smoke for minimalist effect
    const grayValue = Math.floor(Math.random() * 80) + 150; // 150-230 (much lighter smoke)
    smoke.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;    smoke.style.opacity = `${0.2 + Math.random() * 0.2}`; // Lower opacity
    
    area.appendChild(smoke);
  }
  
  // Add just a few, very small flames for an extremely minimalistic look
  for (let i = 0; i < 20; i++) { // Fewer flames
    const flame = document.createElement('div');
    flame.className = "absolute";
    
    // Much smaller flame sizes
    const size = 10 + Math.random() * 15; // Smaller flames
    const isLargeFlame = Math.random() > 0.8;
    
    // Adjust flame shape
    flame.style.borderRadius = '50% 50% 30% 30% / 50% 50% 50% 50%';
    
    flame.style.width = `${size}px`;
    flame.style.height = `${size * 1.5}px`;
    
    // More tightly focused fire area
    flame.style.left = `${200 + (Math.random() * 80 - 40)}px`;
    flame.style.bottom = `${Math.random() * 20}px`;
    
    // Less saturated colors for subtler effect
    const useRed = Math.random() > 0.8;
    if (useRed) {
      flame.style.background = `radial-gradient(ellipse at bottom, rgba(255,70,20,0.5), transparent)`;
    } else {
      const hue = isLargeFlame ? (20 + Math.random() * 15) : (25 + Math.random() * 20);
      flame.style.background = `radial-gradient(ellipse at bottom, hsl(${hue}, 80%, ${isLargeFlame ? 60 : 55}%), transparent)`;    }
    
    // Subtler animation
    flame.style.transformOrigin = 'center bottom';
    
    area.appendChild(flame);
  }
  
  // Add fewer embers with lower opacity
  for (let i = 0; i < 20; i++) {
    const ember = document.createElement('div');
    
    ember.className = "absolute rounded-full";
    
    // Duller colors for subtlety
    if (Math.random() > 0.5) {
      ember.style.backgroundColor = 'rgba(255,120,0,0.6)';
    } else {
      ember.style.backgroundColor = 'rgba(255,60,0,0.5)';
    }
    
    // Smaller embers
    ember.style.width = `${1 + Math.random() * 3}px`;
    ember.style.height = `${1 + Math.random() * 3}px`;
    ember.style.left = `${300 + (Math.random() * 150 - 75)}px`;
    ember.style.bottom = `${Math.random() * 40}px`;
    
    // Animation
    ember.style.animation = `ember ${2 + Math.random() * 2}s linear infinite`;
    ember.style.animationDelay = `${Math.random() * 2}s`;
    ember.style.zIndex = '35';
    area.appendChild(ember);
  }
  
  // Add smaller, less prominent warning sign
  const warning = document.createElement('div');
  warning.className = "absolute flex items-center justify-center";
  warning.style.left = '300px';
  warning.style.top = '200px';
  warning.style.transform = 'translate(-50%, -50%)';
  warning.style.width = '80px';
  warning.style.height = '80px';
  warning.style.zIndex = '40';
  
  warning.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-red-600 bg-opacity-70 flex items-center justify-center animate-pulse border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 9v4M12 17h.01M4.929 19H19.07c1.275 0 2.12-1.335 1.551-2.443L13.235 4.304c-.614-1.183-2.307-1.183-2.92 0L2.427 16.557C1.91 17.622 2.69 19 4.929 19z"/>
      </svg>
    </div>
  `;
  area.appendChild(warning);

  // Add custom animations
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes rise {
      0% { transform: translateY(0) scale(1); opacity: 0.7; }
      100% { transform: translateY(-300px) scale(3); opacity: 0; }
    }
    @keyframes flicker {
      0% { transform: scaleY(0.8) scaleX(0.9) translateY(0); opacity: 0.8; }
      100% { transform: scaleY(1.3) scaleX(1.15) translateY(-8px); opacity: 1; }
    }
    @keyframes ember {
      0% { transform: translate(0, 0); opacity: 1; }
      50% { opacity: 0.8; }
      100% { transform: translate(${Math.random() * 150 - 75}px, -150px); opacity: 0; }
    }
    @keyframes pulse {
      0% { opacity: 0.8; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1.1); }
    }
  `;
  
  area.appendChild(styleElement);
  container.appendChild(area);
};

const createTsunamiEffect = (container, position) => {
  // Blue overlay for water
  const overlay = document.createElement('div');
  overlay.className = "absolute inset-0 bg-blue-900 opacity-10";
  container.appendChild(overlay);
  
  // Create tsunami area
  const area = document.createElement('div');
  area.className = "absolute w-[800px] h-[500px] pointer-events-none overflow-hidden";
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  
  // Create the wave
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = "absolute";
    wave.style.width = '1000px';
    wave.style.height = '800px';
    wave.style.bottom = `-${600 + i * 50}px`;
    wave.style.left = '-100px';
    wave.style.background = `linear-gradient(to bottom, 
      transparent, 
      rgba(0, 100, 255, ${0.2 + i * 0.1}) 30%, 
      rgba(0, 50, 200, ${0.5 + i * 0.1}))
    `;
    wave.style.borderRadius = '40% 45% 30% 35% / 30% 25% 20% 35%';
    wave.style.animation = `tsunamiWave ${10 - i * 2}s ease-in-out infinite`;
    wave.style.animationDelay = `${i * 2}s`;
    wave.style.transformOrigin = 'center bottom';
    
    area.appendChild(wave);
  }
  
  // Add warning marker
  const warning = document.createElement('div');
  warning.className = "absolute flex items-center justify-center";
  warning.style.left = '400px';
  warning.style.top = '250px';
  warning.style.transform = 'translate(-50%, -50%)';
  warning.style.width = '60px';
  warning.style.height = '60px';
  
  warning.innerHTML = `
    <div class="w-12 h-12 rounded-full bg-red-500 bg-opacity-80 flex items-center justify-center animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 9v4M12 17h.01M4.929 19H19.07c1.275 0 2.12-1.335 1.551-2.443L13.235 4.304c-.614-1.183-2.307-1.183-2.92 0L2.427 16.557C1.91 17.622 2.69 19 4.929 19z"/>
      </svg>
    </div>
  `;
  
  area.appendChild(warning);
  
  // Add custom animation
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes tsunamiWave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-100px); }
    }
  `;
  
  area.appendChild(styleElement);
  container.appendChild(area);
};

const createEarthquakeEffect = (container, position) => {
  // Create properly sized, focused earthquake area that follows map position
  const area = document.createElement('div');
  area.className = "absolute w-[350px] h-[350px] pointer-events-none weather-effect-earthquake"; // Added class
  area.style.left = `${position.x}px`;
  area.style.top = `${position.y}px`;
  area.style.transform = 'translate(-50%, -50%)';
  area.style.transition = 'left 0.5s, top 0.5s';
  area.style.zIndex = '16';
  area.style.overflow = 'hidden'; // Ensure effects stay contained
  area.style.borderRadius = '60% 40% 55% 45% / 50% 45% 55% 50%'; // Irregular shape for more natural look
  
  // Add data attribute to store effect type for location updates
  area.setAttribute('data-effect-type', 'earthquake');
  
  // Add update function to allow position updates when map changes
  area.updatePosition = (newPos) => {
    area.style.left = `${newPos.x}px`;
    area.style.top = `${newPos.y}px`;
  };
  
  // Add shake effect to the area only, not full screen - with proper earthquake animation
  area.style.animation = 'earthquake 0.17s linear infinite';
  
  // Add better dust overlay to the earthquake area
  const dustOverlay = document.createElement('div');
  dustOverlay.className = "absolute inset-0";
  dustOverlay.style.backgroundColor = 'rgba(139, 69, 19, 0.2)'; // Slightly lighter for better visibility
  dustOverlay.style.backdropFilter = 'blur(1.5px)'; // Less blur for better visibility
  dustOverlay.style.borderRadius = 'inherit'; // Match parent's irregular shape
  dustOverlay.style.animation = 'dustPulse 2.5s ease-in-out infinite';
  area.appendChild(dustOverlay);
  
  // Add custom animation with powerful shaking
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes earthquake {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
      10% { transform: translate(calc(-50% - 15px), calc(-50% - 7px)) rotate(-1.0deg); }
      20% { transform: translate(calc(-50% + 14px), calc(-50% + 6px)) rotate(0.8deg); }
      30% { transform: translate(calc(-50% - 12px), calc(-50% + 8px)) rotate(-0.6deg); }
      40% { transform: translate(calc(-50% + 10px), calc(-50% - 10px)) rotate(1.0deg); }
      50% { transform: translate(calc(-50% - 13px), calc(-50% + 7px)) rotate(-0.8deg); }
      60% { transform: translate(calc(-50% + 12px), calc(-50% + 5px)) rotate(0.7deg); }
      70% { transform: translate(calc(-50% - 10px), calc(-50% - 6px)) rotate(-0.7deg); }
      80% { transform: translate(calc(-50% + 9px), calc(-50% + 8px)) rotate(0.5deg); }
      90% { transform: translate(calc(-50% - 11px), calc(-50% - 9px)) rotate(-0.6deg); }
    }
    @keyframes dustPulse {
      0%, 100% { opacity: 0.25; }
      50% { opacity: 0.4; }
    }
    @keyframes crack {
      0% { width: 0; opacity: 0; }
      5% { opacity: 0.7; }
      100% { width: 100%; opacity: 0.8; }
    }
    @keyframes aftershock {
      0% { opacity: 0.7; transform: scale(0); }
      70% { opacity: 0.6; }
      100% { opacity: 0; transform: scale(1.2); }
    }
  `;
  
  area.appendChild(styleElement);
  container.appendChild(area);
  // Create properly sized aftershock ripples
  for (let i = 0; i < 4; i++) {
    const ripple = document.createElement('div');
    ripple.className = "absolute rounded-full";
    ripple.style.border = '3px solid rgba(180, 80, 10, 0.7)'; // Visible but not overwhelming
    ripple.style.width = `${60 + i * 40}px`; // Smaller, properly sized ripples
    ripple.style.height = `${60 + i * 40}px`; // Smaller, properly sized ripples
    ripple.style.left = '200px'; // Centered in the area
    ripple.style.top = '200px'; // Centered in the area
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.boxShadow = '0 0 10px rgba(180, 80, 10, 0.4)'; // Subtle glow effect
    ripple.style.animation = `aftershock ${2 + i * 1}s ease-out infinite`;
    ripple.style.animationDelay = `${i * 0.5}s`;
    area.appendChild(ripple);
  }
  
  // Create more appropriately sized cracks
  for (let i = 0; i < 10; i++) { // Fewer, more focused cracks
    const crack = document.createElement('div');
    
    // Make cracks visible but not overwhelming
    crack.className = "absolute";
    if (i < 3) {
      crack.style.backgroundColor = 'rgba(150, 60, 30, 0.8)';
      crack.style.height = '3px'; // Thinner cracks
      crack.style.boxShadow = '0 0 5px rgba(200, 100, 0, 0.5)';
    } else if (i < 7) {
      crack.style.backgroundColor = 'rgba(130, 60, 40, 0.7)';
      crack.style.height = '2px';
    } else {
      crack.style.backgroundColor = 'rgba(110, 50, 30, 0.6)';
      crack.style.height = '1px';
    }
    
    crack.style.width = '0';
    crack.style.left = '200px'; // Centered in the area
    crack.style.top = '200px'; // Centered in the area
    crack.style.transformOrigin = 'left center';
    crack.style.transform = `rotate(${i * (360/10)}deg)`; // Even distribution
    
    crack.style.animation = `crack ${0.5 + Math.random() * 0.7}s ease-out forwards`;
    crack.style.animationDelay = `${Math.random() * 0.3}s`;
    crack.style.opacity = '0';
    
    area.appendChild(crack);
  }
  
  // Add more appropriately sized dust particles
  for (let i = 0; i < 20; i++) { // Fewer particles
    const dust = document.createElement('div');
    dust.className = "absolute rounded-full";
    dust.style.width = `${1 + Math.random() * 3}px`; // Smaller particles
    dust.style.height = `${1 + Math.random() * 3}px`; // Smaller particles
    dust.style.backgroundColor = 'rgba(139, 69, 19, 0.6)'; // Less opaque
      const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80; // Smaller distance
    const x = 250 + Math.cos(angle) * distance;
    const y = 250 + Math.sin(angle) * distance;
    
    dust.style.left = `${x}px`;
    dust.style.top = `${y}px`;
    dust.style.animation = `rise ${1.5 + Math.random() * 1.5}s ease-out infinite`;
    dust.style.animationDelay = `${Math.random() * 1}s`;
    
    area.appendChild(dust);
  }
  
  // Add smaller, less prominent warning sign
  const warning = document.createElement('div');
  warning.className = "absolute flex items-center justify-center";
  warning.style.left = '250px';
  warning.style.top = '250px';
  warning.style.transform = 'translate(-50%, -50%)';
  warning.style.width = '80px';
  warning.style.height = '80px';
  warning.style.zIndex = '17';
  
  warning.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-red-600 bg-opacity-70 flex items-center justify-center animate-pulse border-2 border-yellow-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 9v4M12 17h.01M4.929 19H19.07c1.275 0 2.12-1.335 1.551-2.443L13.235 4.304c-.614-1.183-2.307-1.183-2.92 0L2.427 16.557C1.91 17.622 2.69 19 4.929 19z"/>
      </svg>
    </div>
  `;
  
  area.appendChild(warning);
  container.appendChild(area);
};
