import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/events' // Replace with your API endpoint

export const fetchEventSuggestions = async (location) => {
  try {
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 5000, // Adjust the radius as needed
    })

    const response = await axios.get(`${BASE_URL}?${params.toString()}`)
    console.log(response.data)
    return response.data.events // Adjust based on your API's response structure
  } catch (error) {
    console.error('Error fetching events:', error.message)
    throw error
  }
}
