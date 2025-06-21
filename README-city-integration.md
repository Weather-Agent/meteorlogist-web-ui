# Meteorologist Web UI - City Data Integration

This project now integrates with Google's Gemini AI API to automatically extract city information from weather responses and display them on the map with interactive tooltips.

## Setup

1. **Get a Gemini API Key**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Configure Environment Variables**

   - Copy `.env.example` to `.env`
   - Replace `your_gemini_api_key_here` with your actual Gemini API key:

   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Features

### City Data Extraction

- Automatically extracts cities mentioned in weather responses
- Uses Gemini AI to generate structured city data including:
  - Coordinates (latitude/longitude) - **dynamically generated, no static coordinates**
  - Population
  - Area
  - State/Province
  - Climate type
  - Weather tooltip with current conditions
  - Appropriate weather icons

### Map Integration

- Displays cities on the interactive map with weather icon pins
- Shows persistent tooltips with detailed city information including coordinates
- Automatic map centering based on Gemini-generated coordinates
- Dynamic zoom levels based on city population (8-11 zoom levels)
- No dependency on static coordinate dictionaries
- Seamless integration with weather effects overlay

### Interactive City Pins

- Weather emoji icons for visual representation
- Persistent tooltips showing:
  - City name and current weather conditions
  - Population (formatted with commas)
  - Area coverage in km²
  - State/Province information
  - Climate classification
  - Precise coordinates (lat, lon)
- Smooth animations and professional styling
- Always visible tooltips for better UX

### Data Structure

The system generates city data in the following format:

```json
[
  {
    "map_plotable": true,
    "city": "Tokyo",
    "coord": { "lat": 35.6895, "lon": 139.6917 },
    "population": 13929286,
    "area": "2,194 km²",
    "state": "Tokyo Metropolis",
    "climate": "Humid subtropical",
    "tooltip": "Tokyo: 28°C, Humid",
    "icon": "weather-sunny"
  }
]
```

## Architecture

### Components

- **MapView.jsx**: Main map component with OpenLayers integration
- **CityTooltips.jsx**: Handles city markers and tooltips on the map
- **WeatherEffects.jsx**: Displays weather-related visual effects

### Services

- **geminiService.js**: Integrates with Google Gemini AI API
- **weatherApi.js**: Handles weather API communication and data processing

### Workflow

1. User submits a weather query
2. Weather API processes the query and returns a response
3. Gemini AI analyzes the response and extracts city information
4. Structured city data is generated with coordinates, weather info, etc.
5. Map displays cities with appropriate icons and tooltips

## Supported Weather Icons

- `weather-sunny`: ☀️
- `weather-cloudy`: ☁️
- `weather-rainy`: 🌧️
- `weather-snowy`: ❄️
- `weather-stormy`: ⛈️
- `weather-foggy`: 🌫️
- `weather-windy`: 💨
- `weather-hot`: 🌡️
- `weather-cold`: 🥶

## Error Handling

- Graceful fallback when Gemini API is unavailable
- Validates JSON responses from AI
- Handles missing or invalid city data
- Provides default behavior when no cities are detected
