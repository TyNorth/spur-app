const SerpApi = require('google-search-results-nodejs')
const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY)

/**
 * Fetches event data from SerpApi based on the provided query and location.
 * @param {string} query - Search query for events (e.g., 'concerts', 'festivals').
 * @param {string} location - Location for the event search (e.g., 'Austin, TX').
 * @returns {Promise<Object[]>} - A promise that resolves to an array of event objects.
 */
const fetchEventData = async (query, location) => {
  return new Promise((resolve, reject) => {
    const params = {
      engine: 'google_events',
      q: `${query} in ${location}`,
      hl: 'en',
      gl: 'us',
    }

    search.json(params, (data) => {
      if (data.events_results) {
        resolve(data.events_results)
      } else {
        reject(new Error('No events found.'))
      }
    })
  })
}

module.exports = fetchEventData
