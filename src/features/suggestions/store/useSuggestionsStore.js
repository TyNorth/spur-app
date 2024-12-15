import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useAuthStore } from 'src/stores/useAuthStore'
import { fetchNearbySuggestions } from '../api/fetchNearbySuggestions'

const authStore = useAuthStore()

export const useSuggestionsStore = defineStore('suggestions', {
  state: () => ({
    suggestions: [], // Stores all fetched suggestions
    loading: false, // Loading state for UI feedback
    error: null, // Error state
  }),

  actions: {
    // Fetch suggestions from the database
    // Fetch suggestions from the database
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
    async fetchSuggestions2() {
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
        console.error('Error fetching suggestions:', err.message)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    // Filter suggestions by mood dynamically
    filterByMood(moodValue) {
      if (!this.suggestions.length) return []

      // Adjust filtering logic based on your app's mood categories
      return this.suggestions.filter((suggestion) => {
        if (moodValue < 30) return suggestion.category === 'relaxing'
        if (moodValue < 70) return suggestion.category === 'focused'
        return suggestion.category === 'adventurous'
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
