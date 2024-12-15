import { CapacitorHttp, isPlatform } from '@capacitor/core'

export const makeHttpRequest = async (options) => {
  try {
    if (isPlatform('android') || isPlatform('ios')) {
      // Use CapacitorHttp for native platforms
      const response = await CapacitorHttp.request(options)
      return response.data
    } else {
      // Use fetch for web
      const { url, headers, data, method } = options
      const fetchOptions = {
        method: method || 'GET',
        headers: headers || {},
        body: method === 'POST' ? JSON.stringify(data) : undefined,
      }

      const response = await fetch(url, fetchOptions)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    }
  } catch (error) {
    console.error('Error during HTTP request:', error)
    throw error
  }
}
