import { useState, useEffect, useRef } from "react";
import Chatbot from "./components/Chatbot";
import MapView from "./components/MapView";
import ChartView from "./components/ChartView";
import { cn } from "./lib/utils";
import { useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { isAuthenticated, loading, signIn } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [activeView, setActiveView] = useState("map");
  const [weatherQuery, setWeatherQuery] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [mapWidthPercent, setMapWidthPercent] = useState(66);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [weatherPattern, setWeatherPattern] = useState(null);
  const [weatherCoordinates, setWeatherCoordinates] = useState(null);
  const [weatherResponse, setWeatherResponse] = useState(null);
  const [cityData, setCityData] = useState([]);

  const handleChatSubmit = (query, responseData = null) => {
    setWeatherQuery(query);
    if (responseData) {
      if (responseData.response) {
        setWeatherResponse(responseData.response);
        const normalConditionPatterns = [
          /normal conditions/i,
          /clear skies/i,
          /no fire/i,
          /no earthquake/i,
          /not experiencing/i,
          /no.*reported/i,
          /no sign/i,
          /hasn't been/i,
          /there isn't a/i,
          /has not been/i,
          /no.*detected/i,
        ];
        const emergencyCheck =
          /fire|earthquake|flood|tsunami|hurricane|drought/i;
        const isEmergencyQuery = emergencyCheck.test(query);
        const isNormalCondition = normalConditionPatterns.some((pattern) =>
          pattern.test(responseData.response)
        );
        if (isEmergencyQuery && isNormalCondition) {
          setWeatherPattern("default");
        } else if (responseData.weatherPattern) {
          setWeatherPattern(responseData.weatherPattern);
        }
      }
      if (responseData.location) setWeatherLocation(responseData.location);
      if (responseData.coordinates)
        setWeatherCoordinates(responseData.coordinates);
      if (responseData.cityData) setCityData(responseData.cityData);
      setShowMap(true);
      return;
    }

    const locationPatterns = [
      /near\s+([a-zA-Z\s,]+)(?:\s|$)/i,
      /in\s+([a-zA-Z\s,]+)(?:\s|$)/i,
      /at\s+([a-zA-Z\s,]+)(?:\s|$)/i,
      /for\s+([a-zA-Z\s,]+)(?:\s|$)/i,
      /\b(mumbai|delhi|bangalore|hyderabad|chennai|kolkata|new york|london|paris|tokyo)\b/i,
    ];
    let foundLocation = null;
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        foundLocation = match[1].trim();
        break;
      }
    }
    const emergencyCheck = /fire|earthquake|flood|tsunami|hurricane|drought/i;
    const isEmergency = emergencyCheck.test(query);
    if (foundLocation) {
      setWeatherLocation(foundLocation);
      setWeatherCoordinates(null);
      setShowMap(true);
    } else if (
      isEmergency ||
      /weather|forecast|temperature|rain|snow|wind|sunny|cloudy|storm|fog/i.test(
        query
      )
    ) {
      setWeatherLocation(null);
      setWeatherCoordinates(null);
      setShowMap(true);
    }
  };

  const handleCloseMap = (switchToView = null) => {
    if (switchToView) {
      setActiveView(switchToView);
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  };

  const handleOpenView = (viewType = "map") => {
    setActiveView(viewType);
    setShowMap(true);
  };

  const onDragStart = (e) => {
    if (viewportWidth < 768) return;
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const onDragEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.userSelect = "auto";
  };

  const onDrag = (e) => {
    if (!draggingRef.current) return;
    let clientX;
    if (e.type === "touchmove") clientX = e.touches[0].clientX;
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
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchend", onDragEnd);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag, { passive: false });
    return () => {
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("touchend", onDragEnd);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("touchmove", onDrag);
    };
  }, []);

  const isMobile = viewportWidth < 768;

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-blue-300 font-bold text-2xl animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {!isAuthenticated && (
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => signIn()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Sign in
          </button>
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden flex flex-col",
          !showMap && "pointer-events-none"
        )}
        style={{
          height: isMobile ? (showMap ? "50%" : "0") : "100%",
          width: isMobile ? "100%" : showMap ? `${mapWidthPercent}%` : "0",
          flexShrink: 0,
          position: "relative",
          transition: isDragging ? "none" : "all 0.3s ease",
          transform: isMobile
            ? showMap
              ? "translateY(0)"
              : "translateY(-100%)"
            : showMap
            ? "translateX(0)"
            : "translateX(-100%)",
          opacity: showMap ? 1 : 0,
          backgroundColor: "inherit",
          zIndex: 20,
        }}
      >
        {" "}
        {activeView === "map" ? (
          <MapView
            location={weatherLocation}
            query={weatherQuery}
            onClose={handleCloseMap}
            weatherPattern={weatherPattern}
            cityData={cityData}
          />
        ) : (
          <ChartView query={weatherQuery} onClose={handleCloseMap} />
        )}
      </div>
      {showMap && !isMobile && (
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className="cursor-col-resize bg-slate-700"
          style={{
            width: "5px",
            height: "100%",
            userSelect: "none",
            touchAction: "none",
            transition: isDragging ? "none" : "background-color 0.3s ease",
            zIndex: 30,
          }}
          onMouseEnter={(e) =>
            !isDragging && (e.currentTarget.style.backgroundColor = "#94a3b8")
          }
          onMouseLeave={(e) =>
            !isDragging && (e.currentTarget.style.backgroundColor = "")
          }
        />
      )}
      <div
        className="flex flex-col"
        style={{
          height: isMobile ? (showMap ? "50%" : "100%") : "100%",
          width: isMobile
            ? "100%"
            : showMap
            ? `${100 - mapWidthPercent}%`
            : "100%",
          flexGrow: 1,
          flexShrink: 1,
          transition: isDragging ? "none" : "all 0.3s ease",
          backgroundColor: "inherit",
          zIndex: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isAuthenticated ? (
          <Chatbot
            onSubmit={handleChatSubmit}
            showMapButton={true}
            showMap={showMap}
            onMapOpen={handleOpenView}
            activeView={activeView}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <h2 className="text-2xl text-blue-300 font-bold mb-4">
                Welcome to Meghdoot AI
              </h2>
              <p className="text-slate-300 mb-6">
                Sign in to ask about weather conditions and view forecasts.
              </p>
              <button
                onClick={() => signIn()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Sign in to continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
