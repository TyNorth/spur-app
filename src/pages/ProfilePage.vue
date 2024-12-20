<template>
  <q-page class="profile-page">
    <q-card class="profile-card">
      <!-- Card Header -->
      <q-card-section class="text-center">
        <q-avatar size="100px" class="q-mb-md">
          <img src="https://via.placeholder.com/100" alt="Profile Avatar" />
        </q-avatar>
        <div class="text-h5 text-primary">Your Profile</div>
        <div class="text-subtitle2 text-grey">Manage your account details</div>
      </q-card-section>

      <!-- Profile Form -->
      <q-card-section>
        <q-input
          v-model="profile.name"
          label="Name"
          filled
          class="q-mb-md input-styled"
          dense
          placeholder="Enter your name"
        />
        <q-input
          v-model="profile.email"
          label="Email"
          filled
          dense
          class="q-mb-md input-styled"
          readonly
        />
        <q-input
          v-model="profile.role"
          label="Role"
          filled
          dense
          class="q-mb-md input-styled"
          readonly
        />
        <q-btn
          label="Save Changes"
          color="primary"
          size="md"
          unelevated
          class="full-width save-btn"
          @click="saveProfile"
          :loading="loading"
        />
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

<style lang="scss">
.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: $background;
  padding: $spacing-large;

  /* Profile Card */
  .profile-card {
    @include card-shadow; // Consistent card styling
    max-width: 500px;
    width: 100%;
    backdrop-filter: blur($blur-light);
    -webkit-backdrop-filter: blur($blur-light);
    transition:
      box-shadow $transition-duration $transition-ease,
      transform 0.3s;

    &:hover {
      box-shadow: $shadow-medium;
      transform: translateY(-4px); // Subtle lift effect
    }

    /* Card Header */
    .q-card-section:first-child {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      text-align: center;

      .text-h6 {
        font-family: $font-family-main;
        font-size: $font-size-large;
        font-weight: $font-weight-bold;
        color: $primary;
      }
    }

    /* Form Inputs */
    .q-input {
      width: 100%;
      margin-bottom: $spacing-medium;

      .q-field__control {
        background: $glass-overlay;
        border-radius: $border-radius-small;
        border: 1px solid rgba(0, 0, 0, 0.1);
        transition:
          box-shadow $transition-duration,
          border-color $transition-duration;

        &:hover {
          border-color: $primary;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }

        input {
          color: $primary;
          font-family: $font-family-main;
          font-size: $font-size-base;
        }
      }

      .q-field__label {
        font-size: $font-size-small;
        color: $color-neutral-dark;
      }

      &[readonly] .q-field__control {
        background: rgba(0, 0, 0, 0.05);
        cursor: not-allowed;
      }
    }

    /* Save Button */
    .q-btn {
      margin-top: $spacing-medium;
    }
  }
}
</style>
