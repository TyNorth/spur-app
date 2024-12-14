<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card">
      <q-card-section>
        <div class="text-h6">Welcome Back</div>
        <p>Login to continue</p>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" filled type="email" class="q-mb-md" />
        <q-input v-model="password" label="Password" filled type="password" class="q-mb-md" />
        <q-btn label="Login" color="primary" @click="handleLogin" />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn flat label="Sign Up" color="secondary" @click="goToSignup" />
      </q-card-actions>
    </q-card>
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

const handleLogin = async () => {
  try {
    const user = await authStore.login(email.value, password.value)
    if (user) {
      router.push('/home')
    }
  } catch (error) {
    console.error(error.message)
  }
}

const goToSignup = () => {
  router.push('/signup')
}
</script>

<style scoped lang="scss">
.login-page {
  background: $color-neutral-light;
  padding: $spacing-large;
}

.login-card {
  width: 350px;
  @include card-shadow;
}
</style>
