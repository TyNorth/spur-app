import { supabase } from 'src/boot/supabase'

// CRUD Operations for `public.users`
export const Users = {
  // Create a new user in the `public.users` table
  async createUser(userData) {
    try {
      const { data, error } = await supabase.from('users').insert([userData]).select() // Ensure the inserted data is returned

      if (error) throw error
      return data[0] // Return the first (and only) inserted record
    } catch (error) {
      console.error('Error creating user:', error.message)
      throw error
    }
  },

  // Read user data by user ID (linked to `auth.users.id`)
  async getUserById(userId) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single() // Ensure a single record is returned

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user by ID:', error.message)
      throw error
    }
  },

  // Update user information in `public.users`
  async updateUser(userId, updatedData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', userId)
        .select() // Return the updated data

      if (error) throw error
      return data[0] // Return the first (and only) updated record
    } catch (error) {
      console.error('Error updating user:', error.message)
      throw error
    }
  },

  // Delete user from `public.users`
  async deleteUser(userId) {
    try {
      const { data, error } = await supabase.from('users').delete().eq('id', userId).select() // Return the deleted data

      if (error) throw error
      return data[0] // Return the first (and only) deleted record
    } catch (error) {
      console.error('Error deleting user:', error.message)
      throw error
    }
  },
}
