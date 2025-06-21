// Geocoding service using Open-Meteo API
const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1';

export const geocodingService = {
  /**
   * Search for a location using the Open-Meteo Geocoding API
   * @param {string} locationName - The name of the location to search for
   * @param {number} count - Number of results to return (default: 1)
   * @param {string} language - Language for results (default: 'en')
   * @returns {Promise<Object>} - Geocoding results
   */
  async searchLocation(locationName, count = 1, language = 'en') {
    try {
      const params = new URLSearchParams({
        name: locationName,
        count: count.toString(),
        language,
        format: 'json'
      });

      const response = await fetch(`${GEOCODING_API_BASE}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Geocoding API error');
      }

      return data;
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
      throw error;
    }
  },

  /**
   * Get coordinates for a location
   * @param {string} locationName - The name of the location
   * @returns {Promise<{latitude: number, longitude: number, name: string} | null>}
   */
  async getCoordinates(locationName) {
    try {
      const result = await this.searchLocation(locationName, 1);
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          country: location.country,
          timezone: location.timezone,
          population: location.population || 'Unknown'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  },

  /**
   * Search for multiple locations
   * @param {string} locationName - The name of the location to search for
   * @param {number} count - Number of results to return
   * @returns {Promise<Array>} - Array of location results
   */
  async searchMultipleLocations(locationName, count = 10) {
    try {
      const result = await this.searchLocation(locationName, count);
      
      if (result.results && result.results.length > 0) {
        return result.results.map(location => ({
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          country: location.country,
          timezone: location.timezone,
          population: location.population || 'Unknown',
          admin1: location.admin1,
          admin2: location.admin2
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching multiple locations:', error);
      return [];
    }
  }
};

export default geocodingService;
