import axios from 'axios'

/**
 * Fetch nearby suggestions from the backend.
 * @param {Object} location - Object containing `latitude` and `longitude`.
 * @param {string} activityType - Type of activity (e.g., "restaurant", "cafe").
 * @returns {Promise<Object[]>} - Array of suggestions.
 */
export const fetchNearbySuggestions = async (location, activityType) => {
  try {
    // Ensure location object is properly formatted
    if (!location || !location.latitude || !location.longitude) {
      throw new Error('Invalid location object. Expected { latitude, longitude }.')
    }

    // Ensure activity type is provided
    if (!activityType) {
      throw new Error('Activity type is required.')
    }

    // Make the API request to the backend
    const response = await axios.post('http://localhost:5000/api/places/nearby', {
      location,
      activityType,
    })

    // Check for successful response
    if (response.status === 200) {
      console.log('Suggestions fetched successfully:', response.data)
      return response.data
    } else {
      throw new Error(`Unexpected response status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching suggestions from backend:', error.message)
    throw error
  }
}
