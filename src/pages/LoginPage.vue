<template>
  <q-page class="login-page flex flex-center">
    <div class="glass-container">
      <!-- Welcome Illustration -->
      <q-img
        src="https://via.placeholder.com/400x200?text=Welcome+Back"
        alt="Login Illustration"
        class="login-illustration"
      />

      <!-- Login Form -->
      <q-card class="login-card">
        <q-card-section>
          <div class="text-h5 text-white text-center">Welcome Back!</div>
          <div class="text-subtitle1 text-center text-white q-mb-md">
            Login to continue your journey
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
          <!-- Login Button -->
          <q-btn
            label="Login"
            color="primary"
            size="md"
            :loading="isLoggingIn"
            class="full-width q-mb-sm login-btn"
            @click="handleLogin"
          />
          <div class="forgot-password text-center">
            <a href="#" @click.prevent="forgotPassword" class="text-white">Forgot Password?</a>
          </div>
        </q-card-section>

        <!-- Footer Links -->
        <q-card-actions align="center" class="footer-links">
          <span class="text-white text-light">Don’t have an account?</span>
          <q-btn flat dense label="Sign Up" color="white" size="md" @click="goToSignup" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/useAuthStore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const isLoggingIn = ref(false)

const handleLogin = async () => {
  try {
    isLoggingIn.value = true
    const user = await authStore.login(email.value, password.value)
    if (user) {
      router.push('/home')
      isLoggingIn.value = false
    }
  } catch (error) {
    console.error('Login Error:', error.message)
  }
}

const goToSignup = () => {
  router.push('/signup')
}

const forgotPassword = () => {
  console.log('Redirect to password reset page')
}
</script>

<style scoped lang="scss">
.login-page {
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

.login-illustration {
  border-radius: $border-radius-medium;
  margin-bottom: $spacing-medium;
}

.login-card {
  background: transparent;
  box-shadow: none;
  padding: 0;

  .input-styled {
    border-radius: $border-radius-small;
  }
}

.login-btn {
  font-weight: $font-weight-bold;
  letter-spacing: 1px;
  transition: transform $transition-duration $transition-ease;

  &:hover {
    transform: scale(1.02);
  }
}

.forgot-password {
  font-size: $font-size-small;
  margin-bottom: $spacing-small;
  a {
    text-decoration: none;
    transition: color $transition-duration ease;

    &:hover {
      color: darken($primary, 10%);
    }
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
