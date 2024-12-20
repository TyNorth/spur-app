// src/stores/useEventsStore.js
import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { fetchEventSuggestions } from '../features/events/api/fetchEventSuggestions'
import { useAuthStore } from 'src/stores/useAuthStore'

const authStore = useAuthStore()

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [], // Stores fetched event data
    savedEvents: [], // Stores user-saved events from the database
    loading: false, // Loading state for UI feedback
    error: null, // Error state
  }),

  actions: {
    // Fetch events using SerpAPI or another external API
    async fetchEvents(location) {
      this.loading = true
      this.error = null

      try {
        const events = await fetchEventSuggestions(location)
        this.events = events
        return events
      } catch (error) {
        this.error = error.message
        console.error('Error fetching events:', error.message)
      } finally {
        this.loading = false
      }
    },

    // Fetch user-saved events from the database
    async fetchSavedEvents() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', authStore.user.id)

        if (error) throw error

        this.savedEvents = data
        return data
      } catch (err) {
        console.error('Error fetching saved events:', err.message)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    // Save an event to the database for the current user
    async saveEvent(event) {
      try {
        const { data, error } = await supabase.from('events').insert({
          user_id: authStore.user.id,
          event_id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
        })

        if (error) throw error

        this.savedEvents.push(data[0])
        return data[0]
      } catch (err) {
        console.error('Error saving event:', err.message)
        this.error = err.message
      }
    },

    // Remove a saved event from the database
    async removeSavedEvent(eventId) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('user_id', authStore.user.id)
          .eq('event_id', eventId)

        if (error) throw error

        this.savedEvents = this.savedEvents.filter((event) => event.event_id !== eventId)
      } catch (err) {
        console.error('Error removing saved event:', err.message)
        this.error = err.message
      }
    },

    // Check if an event is saved by the user
    isSaved(eventId) {
      return this.savedEvents.some((event) => event.event_id === eventId)
    },

    // Filter events dynamically by type or date
    filterEventsByType(type) {
      return this.events.filter((event) => event.type === type)
    },

    filterEventsByDate(date) {
      return this.events.filter((event) => new Date(event.date).toDateString() === date)
    },
  },
})
