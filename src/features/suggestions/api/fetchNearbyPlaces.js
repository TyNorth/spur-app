import axios from 'axios'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

// Fetch additional place details
const fetchPlaceDetails = async (placeId) => {
  try {
    // Request fields using Place Details API
    const response = await axios.post(
      `https://places.googleapis.com/v1/places/${placeId}:fetchFields`,
      {
        fields: ['displayName', 'formattedAddress', 'photos'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GOOGLE_PLACES_API_KEY}`,
        },
      },
    )

    const details = response.data
    const photo = details.photos ? details.photos[0] : null

    // Fetch photo using Place Photo API if available
    const image_url = photo
      ? `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&maxHeightPx=400&key=${GOOGLE_PLACES_API_KEY}`
      : 'path-to-default-image.jpg' // Fallback image

    return {
      image_url,
      address: details.formattedAddress,
    }
  } catch (error) {
    console.error('Error fetching place details:', error.message)
    return {
      image_url: 'path-to-default-image.jpg',
      address: 'No description available.',
    }
  }
}

// Fetch nearby places based on activity type and location
export const fetchNearbyPlaces = async (location, activityType) => {
  try {
    const { latitude, longitude } = location

    // Build request for Nearby Search (New)
    const request = {
      fields: ['displayName', 'location', 'placeId'], // Fields to fetch
      locationRestriction: {
        center: { lat: latitude, lng: longitude },
        radius: 1000, // Radius in meters
      },
      includedPrimaryTypes: [activityType], // Place type to search for
      maxResultCount: 10, // Limit results
      rankPreference: 'POPULARITY', // Rank by popularity
    }

    // Call Google Places API
    const response = await axios.post(`https://places.googleapis.com/v1/searchNearby`, request, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GOOGLE_PLACES_API_KEY}`,
      },
    })

    const places = response.data.places

    // Enrich places with additional details and photos
    const enrichedPlaces = await Promise.all(
      places.map(async (place) => {
        const details = await fetchPlaceDetails(place.placeId)
        return {
          id: place.placeId,
          name: place.displayName,
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          image_url: details.image_url,
          description: details.address || 'No description available.',
        }
      }),
    )

    return enrichedPlaces
  } catch (error) {
    console.error('Error fetching nearby places:', error.message)
    throw error
  }
}
