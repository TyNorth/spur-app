// src/features/crowdLevels/api/fetchCrowdLevels.js

import axios from 'axios'

/**
 * Fetches crowd levels for a specific place.
 * @param {string} placeId - The Google Place ID of the location.
 * @returns {Promise<Object>} - A promise that resolves to crowd level data for the place.
 */
export const fetchCrowdLevels = async (placeId) => {
  const CROWD_LEVELS_API_URL = process.env.CROWD_LEVELS_API_URL

  try {
    const response = await axios.get(`${CROWD_LEVELS_API_URL}/crowd-levels`, {
      params: {
        place_id: placeId,
      },
      headers: {
        Authorization: `Bearer ${process.env.CROWD_LEVELS_API_KEY}`,
      },
    })

    if (response.data && response.data.success) {
      return response.data.crowdLevels // Contains live/popular times and wait times
    } else {
      throw new Error('Crowd levels not available.')
    }
  } catch (error) {
    console.error('Error fetching crowd levels:', error.message)
    throw new Error('Failed to fetch crowd levels.')
  }
}
