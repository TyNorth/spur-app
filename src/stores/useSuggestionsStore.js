// src/stores/useSuggestionsStore.js
import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from 'src/stores/useAuthStore'
import { fetchNearbySuggestions } from '../features/suggestions/api/fetchNearbySuggestions'
import { fetchWeatherData } from '../features/suggestions/api/fetchWeatherData'
import { fetchEventSuggestions } from '../features/events/api/fetchEventSuggestions'
import { fetchCrowdLevels } from '../features/crowd/api/fetchCrowdLevels'

const authStore = useAuthStore()

export const useSuggestionsStore = defineStore('suggestions', {
  state: () => ({
    suggestions: [], // Stores all fetched suggestions
    events: [], // Stores event suggestions
    weather: null, // Weather data for suggestions
    crowdLevels: {}, // Crowd levels by place ID
    loading: false, // Loading state for UI feedback
    error: null, // Error state
  }),

  actions: {
    // Fetch suggestions from external APIs
    async fetchSuggestions(location, activityTypes) {
      this.loading = true
      this.error = null

      try {
        const suggestions = await fetchNearbySuggestions(location, activityTypes)
        this.suggestions = suggestions
      } catch (error) {
        this.error = error.message
        console.error('Error fetching suggestions:', error.message)
      } finally {
        this.loading = false
      }
    },

    // Fetch saved suggestions from the database
    async fetchSavedSuggestions() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .eq('user_id', authStore.user.id)

        if (error) throw error

        this.suggestions = data
        return data
      } catch (err) {
        console.error('Error fetching saved suggestions:', err.message)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    // Fetch weather data for current location
    async fetchWeather(location) {
      try {
        const weatherData = await fetchWeatherData(location)
        this.weather = weatherData
      } catch (error) {
        console.error('Error fetching weather data:', error.message)
        this.weather = null
      }
    },

    // Fetch events for the current location
    async fetchEvents(location) {
      try {
        const events = await fetchEventSuggestions(location)
        this.events = events
      } catch (error) {
        console.error('Error fetching events:', error.message)
        this.events = []
      }
    },

    // Fetch crowd levels for nearby places
    async fetchCrowdLevels(placeIds) {
      try {
        const crowdData = await fetchCrowdLevels(placeIds)
        this.crowdLevels = crowdData
      } catch (error) {
        console.error('Error fetching crowd levels:', error.message)
        this.crowdLevels = {}
      }
    },

    // Filter suggestions by mood dynamically
    filterByMood(moodValue) {
      if (!this.suggestions.length) return []

      return this.suggestions.filter((suggestion) => {
        if (moodValue < 30) return suggestion.category === 'relaxing'
        if (moodValue < 70) return suggestion.category === 'focused'
        return suggestion.category === 'adventurous'
      })
    },

    // Merge events, weather, and crowd levels into suggestions
    mergeDynamicData() {
      this.suggestions = this.suggestions.map((suggestion) => {
        const crowdLevel = this.crowdLevels[suggestion.placeId] || 'Unknown'
        const isIndoor = this.weather && this.weather.isRaining ? true : suggestion.isOutdoor

        return {
          ...suggestion,
          crowdLevel,
          isIndoor,
        }
      })
    },

    // Set suggestions dynamically
    setSuggestions(newSuggestions) {
      if (Array.isArray(newSuggestions)) {
        this.suggestions = newSuggestions
      } else {
        console.error('Invalid data type for suggestions. Expected an array.')
      }
    },
  },
})
