<template>
  <div class="fullscreen bg-gradient text-white text-center q-pa-md flex flex-center">
    <div class="error-container">
      <!-- Error Code -->
      <div class="error-code">404</div>

      <!-- Error Message -->
      <div class="error-message">
        <span>Oops! The page you were looking for</span>
        <br />
        <span>doesn't exist or might have been moved.</span>
      </div>

      <!-- Decorative Illustration -->
      <q-img
        src="https://via.placeholder.com/300x200?text=404+Illustration"
        alt="404 Illustration"
        class="error-illustration"
      />

      <!-- Call-to-Action Button -->
      <q-btn
        class="q-mt-lg go-home-btn"
        color="primary"
        text-color="white"
        unelevated
        to="/"
        label="Go Home"
        no-caps
        icon="home"
      />
    </div>
  </div>
</template>

<script setup>
//
</script>

<style scoped lang="scss">
.fullscreen {
  background: linear-gradient(135deg, $primary, #1a1a2e); // Gradient background for a modern look
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1); // Glassmorphic effect
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
}

.error-code {
  font-size: 15vh;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
}

.error-message {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16px;
  line-height: 1.5;
}

.error-illustration {
  max-width: 100%;
  margin: 24px auto;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.go-home-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    background-color: lighten(#4c8bf5, 10%);
    transform: scale(1.05);
  }
}
</style>
