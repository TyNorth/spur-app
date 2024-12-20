<template>
  <q-page class="signup-page flex flex-center">
    <div class="glass-container">
      <!-- Welcome Illustration -->
      <q-img
        src="https://via.placeholder.com/400x200?text=Join+Us"
        alt="Signup Illustration"
        class="signup-illustration"
      />

      <!-- Signup Form -->
      <q-card class="signup-card">
        <q-card-section>
          <div class="text-h5 text-white text-center">Create an Account</div>
          <div class="text-subtitle1 text-center text-white q-mb-md">
            Sign up to start exploring
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Email Input -->
          <q-input
            v-model="email"
            label="Email"
            filled
            type="email"
            class="q-mb-md input-styled"
            dense
          />
          <!-- Password Input -->
          <q-input
            v-model="password"
            label="Password"
            filled
            type="password"
            class="q-mb-md input-styled"
            dense
          />
          <!-- Signup Button -->
          <q-btn
            label="Sign Up"
            color="primary"
            size="md"
            :loading="isSigningUp"
            class="full-width q-mb-sm signup-btn"
            @click="handleSignup"
          />
        </q-card-section>

        <!-- Footer Links -->
        <q-card-actions align="center" class="footer-links">
          <span class="text-white text-light">Already have an account?</span>
          <q-btn flat dense label="Login" color="white" size="md" @click="goToLogin" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/useAuthStore'
import { Users } from 'src/database/Users'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const isSigningUp = ref(false)

const handleSignup = async () => {
  try {
    isSigningUp.value = true
    // Step 1: Signup with Supabase Auth
    const user = await authStore.signup(email.value, password.value)

    // Step 2: Add user to `public.users` table
    const userData = {
      id: user.id,
      email: email.value,
      name: '',
      role: 'user',
      created_at: new Date().toISOString(),
    }

    await Users.createUser(userData)

    router.push('/login') // Redirect to login
  } catch (error) {
    console.error('Signup failed:', error.message)
  } finally {
    isSigningUp.value = false
  }
}

const goToLogin = () => {
  router.push('/') // Redirect to login page
}
</script>

<style scoped lang="scss">
.signup-page {
  background: linear-gradient(135deg, $primary, #1a1a2e);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.glass-container {
  @include glass-effect($glass-overlay, $blur-light, $opacity-medium);
  padding: $spacing-large;
  border-radius: $border-radius-large;
  width: 400px;
  text-align: center;
  box-shadow: $shadow-light;
}

.signup-illustration {
  border-radius: $border-radius-medium;
  margin-bottom: $spacing-medium;
}

.signup-card {
  background: transparent;
  box-shadow: none;
  padding: 0;

  .input-styled {
    border-radius: $border-radius-small;
  }
}

.signup-btn {
  font-weight: $font-weight-bold;
  letter-spacing: 1px;
  transition: transform $transition-duration $transition-ease;

  &:hover {
    transform: scale(1.02);
  }
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: $spacing-small;
  font-size: $font-size-small;

  .q-btn {
    text-transform: capitalize;
  }
}
</style>
