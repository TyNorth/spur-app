import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Stores authenticated user info
  }),
  actions: {
    async login(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log(data, error) // Logs the response structure
        if (error) throw error

        // `data.user` contains the authenticated user
        this.user = data.user
        return data.user
      } catch (error) {
        console.error('Login failed:', error.message)
        throw error
      }
    },
    async signup(email, password) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password })
        console.log(data, error) // Logs the response structure
        if (error) throw error

        // `data.user` contains the created user
        this.user = data.user
        return data.user
      } catch (error) {
        console.error('Signup failed:', error.message)
        throw error
      }
    },
    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        this.user = null
      } catch (error) {
        console.error('Logout failed:', error.message)
        throw error
      }
    },
    async fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser()
        console.log(data, error) // Logs the response structure
        if (error) throw error

        // `data.user` contains the authenticated user
        this.user = data.user
      } catch (error) {
        console.error('Fetching user failed:', error.message)
        throw error
      }
    },
  },
})
