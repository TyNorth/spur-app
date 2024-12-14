import { fetchGooglePlaces } from './googlePlacesApi'

export const fetchNearbySuggestions = async (location, activityTypes) => {
  const { latitude, longitude } = location

  try {
    const places = await fetchGooglePlaces({ latitude, longitude, activityTypes })
    return places.map((place) => ({
      id: place.place_id,
      title: place.name,
      description: place.vicinity || 'No description available',
      image_url: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=400&key=YOUR_GOOGLE_PLACES_API_KEY`
        : 'default_image_url',
    }))
  } catch (error) {
    console.error('Error fetching nearby suggestions:', error.message)
    return []
  }
}
