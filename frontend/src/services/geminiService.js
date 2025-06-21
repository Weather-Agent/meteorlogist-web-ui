const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateCityDataFromResponse = async (finalResponse) => {
    if (!finalResponse || !GEMINI_API_KEY) {
        console.warn('No Gemini API key or response provided');
        return [];
    }

    try {        const prompt = `
      Analyze the following weather response and extract any cities mentioned. For each city found, generate a JSON object with the following structure:
      {
        "map_plotable": true,
        "city": "City Name",
        "coord": { "lat": latitude, "lon": longitude },
        "population": population_number,
        "area": "area in km²",
        "state": "State/Province/Region",
        "climate": "Climate type",
        "tooltip": "City: temperature, weather condition",
        "icon": "weather-icon-name"
      }

      Weather Response: "${finalResponse}"

      Rules:
      1. Only extract cities that are explicitly mentioned in the response
      2. Use accurate coordinates, population, area, state, and climate data
      3. Extract temperature and weather condition from the response for the tooltip (if not available, use "Current weather conditions")
      4. Choose appropriate weather icon names from: weather-sunny, weather-cloudy, weather-rainy, weather-snowy, weather-stormy, weather-foggy, weather-windy, weather-hot, weather-cold
      5. If no cities are mentioned, return an empty array
      6. Return only valid JSON array format
      7. Do not include any explanation or additional text
      8. For coordinates, use precise latitude and longitude values
      9. For population, use numeric values (no commas)
      10. For tooltip, format as "CityName: weather description"

      Response format: Return only the JSON array, nothing else.
    `;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.warn('No text generated from Gemini API');
            return [];
        }

        // Extract JSON from the response
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.warn('No valid JSON array found in Gemini response');
            return [];
        }

        const cityData = JSON.parse(jsonMatch[0]);
        console.log('Generated city data from Gemini:', cityData);

        return Array.isArray(cityData) ? cityData : [];

    } catch (error) {
        console.error('Error generating city data from Gemini:', error);
        return [];
    }
};

export const isGeminiConfigured = () => {
    return !!GEMINI_API_KEY;
};