import { getAuthToken } from './authService';
import { generateCityDataFromResponse } from './geminiService';

// Use proxy path for development to avoid CORS issues
const BASE_URL = import.meta.env.DEV ? '/api/apps' : 'http://127.0.0.1:8000/apps';
const APP_NAME = 'weatheragent';

// Session management
let currentSessionId = null;
let currentUserId = null;

const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
};

export const createSession = async () => {
  try {
    if (!currentUserId) {
      currentUserId = generateUserId();
    }

    console.log('Creating session for user:', currentUserId);

    const response = await fetch(`${BASE_URL}/${APP_NAME}/users/${currentUserId}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        state: {
          additionalProp1: {}
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create session: ${response.status} - ${errorText}`);
      throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
    }

    const sessionData = await response.json();
    currentSessionId = sessionData.id;
    console.log('Created new session:', currentSessionId);
    return sessionData;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Function to create a new session (reset current session)
export const createNewSession = async () => {
  currentSessionId = null; // Reset current session
  return await createSession();
};

export const sendMessageToSession = async (message) => {
  try {
    // Check if we have a valid session, if not create one
    if (!currentSessionId || !currentUserId || !(await isSessionValid())) {
      console.log('No valid session found, creating new session...');
      await createSession();
    }

    // Format the payload as required by the API
    const payload = {
      app_name: APP_NAME,
      user_id: currentUserId,
      session_id: currentSessionId,
      new_message: {
        role: "user",
        parts: [{ "text": message }]
      }
    };

    console.log('Sending message to existing session:', currentSessionId);
    console.log('User ID:', currentUserId);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Use the correct endpoint: /run with the payload
    const url = `${import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000'}/run`;
    console.log('Request URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send message: ${response.status} - ${errorText}`);
      // If session is invalid (404), create a new one and retry
      if (response.status === 404) {
        console.log('Session not found, creating new session and retrying...');
        currentSessionId = null;
        await createSession();

        // Update payload with new session ID
        payload.session_id = currentSessionId;

        // Retry the request with new session
        const retryUrl = `${import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000'}/run`;
        console.log('Retry request URL:', retryUrl);

        const retryResponse = await fetch(retryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text();
          throw new Error(`Failed to send message after retry: ${retryResponse.status} - ${retryErrorText}`);
        } const retryEvents = await retryResponse.json();
        // Process the retry events the same way as normal events
        const finalResponse = retryEvents
          .filter(event => event.content?.parts?.[0]?.text &&
            event.content.parts[0].text.trim().length > 0)
          .pop();

        if (finalResponse) {
          const cityData = await generateCityDataFromResponse(finalResponse.content.parts[0].text);

          return {
            status: 'success',
            response: formatResponseText(finalResponse.content.parts[0].text),
            weatherPattern: extractWeatherPattern(finalResponse.content.parts[0].text),
            location: extractLocation(message),
            cityData: cityData
          };
        }

        return {
          status: 'error',
          response: 'No response received from meteorologist after retry',
          weatherPattern: 'default'
        };
      }

      throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
    } const events = await response.json();
    console.log('Received events:', events);

    // Find the final response from any agent with text content
    const finalResponse = events
      .filter(event => event.content?.parts?.[0]?.text &&
        event.content.parts[0].text.trim().length > 0)
      .pop();

    if (finalResponse) {
      const cityData = await generateCityDataFromResponse(finalResponse.content.parts[0].text);

      return {
        status: 'success',
        response: formatResponseText(finalResponse.content.parts[0].text),
        weatherPattern: extractWeatherPattern(finalResponse.content.parts[0].text),
        location: extractLocation(message),
        cityData: cityData
      };
    }

    return {
      status: 'error',
      response: 'No response received from meteorologist',
      weatherPattern: 'default'
    };
  } catch (error) {
    console.error('Error sending message:', error);
    // If all else fails, return a mock response for better UX
    return {
      status: 'error',
      response: `Error connecting to weather service: ${error.message}. Please try again later.`,
      weatherPattern: 'default',
      location: extractLocation(message)
    };
  }
};

// Function to check if current session is valid
export const isSessionValid = async () => {
  if (!currentSessionId || !currentUserId) {
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/${APP_NAME}/users/${currentUserId}/sessions/${currentSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Function to get current session info
export const getCurrentSessionInfo = () => {
  return {
    sessionId: currentSessionId,
    userId: currentUserId
  };
};

// Debug function to log session information
export const debugSessionInfo = () => {
  console.log('=== Session Debug Info ===');
  console.log('User ID:', currentUserId);
  console.log('Session ID:', currentSessionId);
  console.log('Base URL:', BASE_URL);
  console.log('App Name:', APP_NAME);
  console.log('Is Development:', import.meta.env.DEV);
  console.log('========================');
  return {
    userId: currentUserId,
    sessionId: currentSessionId,
    baseUrl: BASE_URL,
    appName: APP_NAME,
    isDevelopment: import.meta.env.DEV
  };
};

const extractWeatherPattern = (text) => {
  const patterns = {
    'thunderstorm': /thunder|lightning|storm/i,
    'rain': /rain|rainfall|precipitation/i,
    'snow': /snow|snowfall/i,
    'sunny': /sunny|clear|sunshine/i,
    'cloudy': /cloud|overcast/i,
    'wind': /wind|windy|breeze/i,
    'fog': /fog|mist/i,
    'flood': /flood|flooding/i,
    'fire': /fire|wildfire/i,
    'earthquake': /earthquake|seismic/i,
    'tsunami': /tsunami/i,
    'hurricane': /hurricane|cyclone/i,
    'drought': /drought/i
  };

  for (const [pattern, regex] of Object.entries(patterns)) {
    if (regex.test(text)) {
      return pattern;
    }
  }
  return 'default';
};

const extractLocation = (message) => {
  const locationPatterns = [
    /\bin\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bnear\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bat\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\bfor\s+([a-zA-Z\s,]+)(?:\s|$)/i,
    /\b(kolkata|mumbai|delhi|bangalore|hyderabad|chennai|london|new york|tokyo|sydney|paris)(?:\s|$)/i
  ];

  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1] ? match[1].trim() : match[0].trim();
    }
  }
  return null; // Return null instead of default city
};

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
      `${BASE_URL}/api/weather/current?location=${encodeURIComponent(location)}`,
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

    console.log('Sending query to backend:', query);

    const emergencyKeywords = {
      'fire': /fire|wildfire|forest fire|bushfire|flames|burning/i,
      'earthquake': /earthquake|seismic|tremor|quake/i,
      'flood': /flood|flooding|submerged|inundated/i,
      'tsunami': /tsunami|tidal wave|seismic sea wave/i,
      'hurricane': /hurricane|cyclone|typhoon|tropical storm/i,
      'drought': /drought|dry|arid|water scarcity/i
    };

    for (const [pattern, regex] of Object.entries(emergencyKeywords)) {
      if (regex.test(query)) {
        console.log(`EMERGENCY pattern detected: ${pattern}`);
      }
    }

    const response = await fetch(`${BASE_URL}/weather/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response from backend:', data);

    if (data.weatherPattern) {
      console.log(`Weather pattern from backend: ${data.weatherPattern}`);

      for (const [pattern, regex] of Object.entries(emergencyKeywords)) {
        if (regex.test(query)) {
          console.log(`Emergency pattern detected in query but backend returned: ${data.weatherPattern}`);
          if (emergencyKeywords.hasOwnProperty(pattern) && emergencyKeywords[pattern].test(query)) {
            console.log(`Overriding backend pattern with emergency pattern: ${pattern}`);
            data.weatherPattern = pattern;
            break;
          }
        }
      }
    }

    const emergencyPatterns = ['fire', 'earthquake', 'flood', 'tsunami', 'hurricane'];
    if (data.weatherPattern && emergencyPatterns.includes(data.weatherPattern)) {
      console.log(`IMPORTANT: Emergency pattern detected: ${data.weatherPattern}`);
    }

    // Generate city data if response is available
    if (data.response) {
      data.cityData = await generateCityDataFromResponse(data.response);
    }

    return data;

  } catch (error) {
    console.error('Failed to process weather query:', error);
    console.log('Falling back to mock API');
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
    weatherPattern: weatherPattern,
    response: responses[weatherPattern],
    cityData: await generateCityDataFromResponse(responses[weatherPattern])
  };
};

// Function to format response text with proper HTML formatting
const formatResponseText = (text) => {
  if (!text) return text;

  // Convert **text** to <strong>text</strong> for bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *text* to <em>text</em> for italics (but not single asterisks used as bullet points)
  formatted = formatted.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');

  // Convert line breaks to <br> tags
  formatted = formatted.replace(/\n/g, '<br>');

  // Convert bullet points (- or *) to proper list items
  formatted = formatted.replace(/^[\-\*]\s(.+)$/gm, '• $1');

  // Convert numbered lists
  formatted = formatted.replace(/^(\d+)\.\s(.+)$/gm, '$1. $2');

  return formatted;
};
