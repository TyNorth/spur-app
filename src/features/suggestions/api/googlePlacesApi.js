import axios from 'axios'

const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'

export const fetchGooglePlaces = async ({ latitude, longitude, activityTypes }) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: 5000, // 5km radius
          type: activityTypes.join('|'),
          key: GOOGLE_API_KEY,
        },
      },
    )

    return response.data.results
  } catch (error) {
    console.error('Error fetching places from Google:', error.message)
    throw error
  }
}
