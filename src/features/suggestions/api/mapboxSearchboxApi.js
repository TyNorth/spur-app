import axios from 'axios'

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN

export const fetchMapboxSuggestions = async (location, activityTypes) => {
  try {
    console.log(activityTypes)
    const { latitude, longitude } = location
    const response = await axios.get('https://api.mapbox.com/search/searchbox/v1/suggest', {
      params: {
        q: activityTypes,
        proximity: `${longitude},${latitude}`,
        access_token: MAPBOX_ACCESS_TOKEN,
        limit: 10,
        session_token: crypto.randomUUID(),
      },
    })
    console.log(response.data.suggestions)
    return response.data.suggestions
  } catch (error) {
    console.error('Error fetching suggestions from Mapbox:', error.message)
    throw error
  }
}

export const generateMapImageUrl = (longitude, latitude) => {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN
  const zoomLevel = 15 // Adjust zoom level as needed
  const width = 300 // Image width in pixels
  const height = 200 // Image height in pixels
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+555555(${longitude},${latitude})/${longitude},${latitude},${zoomLevel}/${width}x${height}?access_token=${accessToken}`
}
