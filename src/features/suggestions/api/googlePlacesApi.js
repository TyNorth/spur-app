import axios from 'axios'

// Base URL for your backend API
const BASE_URL = 'http://localhost:5000/api/places'

/**
 * Fetch nearby places via backend API.
 * @param {Object} params - Search parameters.
 * @param {number} params.latitude - Latitude of the location.
 * @param {number} params.longitude - Longitude of the location.
 * @param {string[]} params.activityTypes - Array of activity types (e.g., ['restaurant', 'park']).
 * @returns {Promise<Object[]>} - List of nearby places.
 */
export const fetchGooglePlaces = async ({ latitude, longitude, activityTypes }) => {
  try {
    const response = await axios.post(`${BASE_URL}/nearby`, {
      location: { latitude, longitude },
      activityType: activityTypes.join('|'),
    })
    return response.data
  } catch (error) {
    console.error('Error fetching nearby places:', error.message)
    throw error
  }
}

/**
 * Fetch a place photo via backend API.
 * @param {string} photoName - The name of the photo.
 * @param {number} maxWidth - Maximum width of the photo.
 * @param {number} maxHeight - Maximum height of the photo.
 * @returns {Promise<string>} - URL of the fetched photo.
 */
export const fetchPlacePhoto = async (photoName, maxWidth = 400, maxHeight = 400) => {
  try {
    const response = await axios.get(`${BASE_URL}/photo`, {
      params: { photoName, maxWidth, maxHeight },
    })
    return response.data.photoUrl // Assume backend returns { photoUrl }
  } catch (error) {
    console.error('Error fetching place photo:', error.message)
    throw error
  }
}

/**
 * Fetch detailed information about a place via backend API.
 * @param {string} placeId - The unique identifier for the place.
 * @param {string[]} fields - Array of fields to include in the response.
 * @returns {Promise<Object>} - The detailed information about the place.
 */
export const fetchPlaceDetails = async (placeId, fields) => {
  try {
    const fieldMask = fields.join(',')
    const response = await axios.get(`${BASE_URL}/details/${placeId}`, {
      params: { fields: fieldMask },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching place details:', error.message)
    throw error
  }
}

/**
 * Fetch autocomplete suggestions via backend API.
 * @param {string} input - The search input.
 * @param {Object} locationBias - Optional location bias.
 * @param {number} locationBias.latitude - Latitude of the bias location.
 * @param {number} locationBias.longitude - Longitude of the bias location.
 * @param {number} locationBias.radius - Radius in meters for the location bias.
 * @returns {Promise<Object[]>} - List of autocomplete predictions.
 */
export const autocompleteSearch = async (input, locationBias = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/autocomplete`, {
      input,
      locationBias,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error.message)
    throw error
  }
}

/**
 * Perform a text search via backend API.
 * @param {string} query - The text query for the search.
 * @param {Object} locationBias - Optional location bias.
 * @param {number} locationBias.latitude - Latitude of the bias location.
 * @param {number} locationBias.longitude - Longitude of the bias location.
 * @param {number} locationBias.radius - Radius in meters for the location bias.
 * @returns {Promise<Object[]>} - List of places matching the query.
 */
export const textSearch = async (query, locationBias = null) => {
  try {
    const response = await axios.post(`${BASE_URL}/text-search`, {
      query,
      locationBias,
    })
    return response.data
  } catch (error) {
    console.error('Error performing text search:', error.message)
    throw error
  }
}

// Export all functions
export default {
  fetchGooglePlaces,
  fetchPlaceDetails,
  autocompleteSearch,
  textSearch,
  fetchPlacePhoto,
}
