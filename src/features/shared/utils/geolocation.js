import { Geolocation } from '@capacitor/geolocation'

export const getCurrentPosition = async () => {
  try {
    const coordinates = await Geolocation.getCurrentPosition()
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
    }
  } catch (error) {
    console.error('Error getting location:', error.message)
    throw new Error('Unable to fetch location')
  }
}
