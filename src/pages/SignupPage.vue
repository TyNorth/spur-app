<template>
  <q-page class="signup-page flex flex-center">
    <q-card class="signup-card">
      <q-card-section>
        <div class="text-h6">Create an Account</div>
        <p>Sign up to start exploring</p>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" filled type="email" class="q-mb-md" />
        <q-input v-model="password" label="Password" filled type="password" class="q-mb-md" />
        <q-btn label="Sign Up" color="primary" @click="handleSignup" />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat label="Login" color="secondary" @click="goToLogin" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/useAuthStore'
import { Users } from 'src/database/Users' // Import CRUD functions

import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleSignup = async () => {
  try {
    // Step 1: Signup with Supabase Auth
    const user = await authStore.signup(email.value, password.value)
    console.log(user)
    // Step 2: Create corresponding entry in `public.users`
    const userData = {
      id: user.id, // Use the ID from `auth.users`
      email: email.value,
      name: '', // Optionally collect/display a name field later
      role: 'user', // Default role for new users
      created_at: new Date().toISOString(),
    }

    await Users.createUser(userData)

    router.push('/login') // Redirect to home page after signup
  } catch (error) {
    console.error('Signup failed:', error.message)
    // Optionally: Show an error message to the user
  }
}

const goToLogin = () => {
  router.push('/') // Redirect to login page
}
</script>

<style scoped lang="scss">
.signup-page {
  background: $color-neutral-light;
  padding: $spacing-large;
}

.signup-card {
  width: 350px;
  @include card-shadow;
}
</style>
