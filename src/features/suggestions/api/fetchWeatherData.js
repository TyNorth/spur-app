import axios from 'axios'

const API_KEY = 'YOUR_API_KEY' // Replace with your WeatherAPI.com API key
const BASE_URL = 'https://api.weatherapi.com/v1'

/**
 * Fetches current weather data for the specified location.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Object>} - A promise that resolves to the weather data object.
 */
export const fetchWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: `${latitude},${longitude}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}
