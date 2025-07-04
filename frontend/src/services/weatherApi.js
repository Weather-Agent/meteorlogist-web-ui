import { getAuthToken } from './authService';

const BASE_URL = 'http://localhost:8000/api';

export const getCurrentWeather = async (location) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(
      `${BASE_URL}/weather/current?location=${encodeURIComponent(location)}`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch current weather:', error);
    return {
      status: 'error',
      error_message: error.message,
      weatherPattern: 'default'
    };
  }
};

export const processWeatherQuery = async (query) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
      const emergencyKeywords = {
      'fire': /fire|wildfire|forest fire|bushfire|flames|burning/i,
      'earthquake': /earthquake|seismic|tremor|quake/i,
      'flood': /flood|flooding|submerged|inundated/i,
      'tsunami': /tsunami|tidal wave|seismic sea wave/i,
      'hurricane': /hurricane|cyclone|typhoon|tropical storm/i,
      'drought': /drought|dry|arid|water scarcity/i
    };    const response = await fetch(`${BASE_URL}/weather/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {      throw new Error(`Weather API error: ${response.status}`);
    }
      const data = await response.json();
    
    if (data.weatherPattern) {
        for (const [pattern, regex] of Object.entries(emergencyKeywords)) {
        if (regex.test(query)) {
          if (emergencyKeywords.hasOwnProperty(pattern) && emergencyKeywords[pattern].test(query)) {
            data.weatherPattern = pattern;
            break;
          }
        }
      }
    }
      const emergencyPatterns = ['fire', 'earthquake', 'flood', 'tsunami', 'hurricane'];
    
    return data;
      } catch (error) {
    // Failed to process weather query, falling back
    return mockProcessWeatherQuery(query);
  }
};

export const mockProcessWeatherQuery = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let location = null;
  const locationPatterns = [
    /\bin\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bnear\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bat\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bfor\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\b(los angeles|new york|chicago|houston|miami|toronto|london|paris|tokyo|beijing|delhi|mumbai|sydney|rio|cape town)(?:\s|$)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) {
      location = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }
  
  location = location || 'Mumbai';
  
  const cityCoordinates = {
    'mumbai': [72.8777, 19.0760],
    'delhi': [77.1025, 28.7041],
    'bangalore': [77.5946, 12.9716],
    'hyderabad': [78.4867, 17.3850],
    'chennai': [80.2707, 13.0827],
    'kolkata': [88.3639, 22.5726],
    'london': [-0.1278, 51.5074],
    'new york': [-74.0060, 40.7128],
    'tokyo': [139.6503, 35.6762],
    'sydney': [151.2093, -33.8688],
    'paris': [2.3522, 48.8566]
  };
  
  const coordinates = cityCoordinates[location.toLowerCase()] || cityCoordinates['mumbai'];
  
  let weatherPattern = 'default';
  const weatherPatterns = {
    'rain': /\b(rain|rainy|rainfall|raining|precipit|shower|downpour|drizzl)\b/i,
    'snow': /\b(snow|snowfall|snowing|blizzard|flurr)\b/i,
    'sunny': /\b(sun|sunny|sunshine|clear sky)\b/i,
    'thunderstorm': /\b(thunder|lightning|storm|stormy|thunderstorm|electrical storm)\b/i,
    'cloudy': /\b(cloud|cloudy|overcast|gloomy)\b/i,
    'wind': /\b(wind|windy|breeze|gust|gale)\b/i,
    'fog': /\b(fog|foggy|mist|haze|smog)\b/i,
    'temperature': /\b(temperature|temp|hot|cold|warm|cool)\b/i,
    'humidity': /\b(humid|humidity|moisture|muggy|damp)\b/i,
    'air quality': /\b(air quality|pollution|air|pollut|aqi|clean air|smog)\b/i,
    'flood': /\b(flood|flooding|submerged|inundated|water level)\b/i,
    'earthquake': /\b(earthquake|quake|seismic|tremor|shake)\b/i,
    'tsunami': /\b(tsunami|tidal wave|sea level)\b/i,
    'drought': /\b(drought|dry spell|water shortage|arid)\b/i
  };
  
  for (const [pattern, regex] of Object.entries(weatherPatterns)) {
    if (regex.test(query)) {
      weatherPattern = pattern;
      break;
    }
  }
  
  const responses = {
    'rain': `It's currently raining in ${location} with moderate intensity. Expected to continue for the next 3 hours with approximately 15mm of rainfall.`,
    'snow': `${location} is experiencing light snowfall. Total accumulation of about 5cm expected today.`,
    'sunny': `It's a beautiful sunny day in ${location} with clear skies. Current temperature is 24°C with UV index of 8 (high).`,
    'thunderstorm': `Severe thunderstorms are active in ${location}. Lightning strikes have been detected within 10km of the city center. Please stay indoors.`,
    'cloudy': `${location} is experiencing overcast conditions with 85% cloud cover. No precipitation expected in the next 6 hours.`,
    'wind': `Strong winds of 45km/h with gusts up to 60km/h are currently affecting ${location}. Small craft advisory is in effect for coastal areas.`,
    'fog': `Dense fog has reduced visibility to 100m in ${location}. Exercise caution while driving. Expected to clear by mid-morning.`,
    'temperature': `The current temperature in ${location} is 22°C, with a feels-like temperature of 24°C due to humidity. Today's high will be 26°C and low will be 18°C.`,
    'humidity': `${location} is currently experiencing high humidity at 78%. This makes the felt temperature about 3°C higher than the actual reading.`,
    'air quality': `The air quality index (AQI) in ${location} is currently 42, which is considered good. All pollutants are below threshold levels.`,
    'flood': `EMERGENCY ALERT: ${location} is experiencing severe flooding with water levels rising 2cm per hour. Low-lying areas are being evacuated.`,
    'earthquake': `EMERGENCY ALERT: A magnitude 5.8 earthquake was detected 30km from ${location} approximately 25 minutes ago. Aftershocks are likely.`,
    'tsunami': `EMERGENCY ALERT: Tsunami warning issued for coastal areas near ${location} following a 7.2 magnitude earthquake. Move to higher ground immediately.`,
    'drought': `${location} is in day 45 of drought conditions. Water conservation measures are in effect, with restrictions on non-essential water usage.`,
    'default': `Current weather in ${location} shows normal conditions. Temperature is 22°C with moderate humidity. No extreme weather patterns detected.`
  };
  
  return {
    status: 'success',
    location: location,
    coordinates: coordinates,
    weatherPattern: weatherPattern,
    response: responses[weatherPattern]
  };
};
