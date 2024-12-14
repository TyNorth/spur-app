<template>
  <q-page class="profile-page">
    <q-card class="profile-card">
      <q-card-section>
        <div class="text-h6">Your Profile</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="profile.name" label="Name" filled class="q-mb-md" />
        <q-input
          v-model="profile.email"
          label="Email"
          filled
          type="email"
          class="q-mb-md"
          :readonly="true"
        />
        <q-input v-model="profile.role" label="Role" filled class="q-mb-md" :readonly="true" />
        <q-btn label="Save Changes" color="primary" @click="saveProfile" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/useAuthStore'
import { Users } from 'src/database/Users'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// User profile data
const profile = ref({
  id: '',
  name: '',
  email: '',
  role: '',
})

const loading = ref(true)

const fetchProfile = async () => {
  try {
    console.log('Fetching profile data...') // Log when profile fetch starts

    // Get the logged-in user's ID
    const userId = authStore.user?.id

    if (!userId) {
      // Redirect to login if not authenticated
      console.warn('User not authenticated. Redirecting to login...')
      router.push('/login')
      return
    }

    // Fetch profile data from `public.users`
    const userData = await Users.getUserById(userId)

    // Populate profile fields
    profile.value = {
      id: userData.id,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user', // Default to 'user'
    }

    console.log('Profile data successfully loaded:', profile.value)
  } catch (error) {
    console.error('Error fetching profile:', error.message)
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  try {
    // Indicate that the save operation is in progress
    loading.value = true

    // Update the user's profile in the database
    const updatedUser = await Users.updateUser(profile.value.id, {
      name: profile.value.name,
      // Add other fields to update as needed
    })

    // Provide feedback to the user
    console.log('Profile updated successfully:', updatedUser)
    // Optionally, display a success message to the user using a Quasar notification
    // this.$q.notify({ type: 'positive', message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error.message)
    // Optionally, display an error message to the user using a Quasar notification
    // this.$q.notify({ type: 'negative', message: 'Failed to update profile' });
  } finally {
    // Reset the loading state
    loading.value = false
  }
}

// Log page load and fetch profile on component mount
onMounted(() => {
  console.log('ProfilePage loaded') // Log when the page is loaded
  fetchProfile()
})
</script>
