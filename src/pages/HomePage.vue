<template>
  <q-page class="home-page">
    <div v-if="loading" class="loading-container">
      <q-spinner size="50px" color="primary" />
    </div>
    <div v-else>
      <!-- Mood Slider -->
      <div class="mood-slider-container">
        <q-slider
          v-model="moodValue"
          :min="0"
          :max="100"
          step="10"
          class="mood-slider"
          @change="updateMood"
          :value="Number(moodValue) || 50"
        >
          <template v-slot:label="props">
            <div class="slider-label">
              <span>{{ getMoodLabel(props.value) }}</span>
            </div>
          </template>
        </q-slider>
      </div>

      <!-- Suggestion Cards -->
      <div class="suggestions-container">
        <q-card
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.id"
          class="suggestion-card"
        >
          <q-img :src="suggestion.image_url" alt="suggestion.title" class="card-image" />
          <q-card-section>
            <div class="card-title">{{ suggestion.title }}</div>
            <div class="card-description">{{ suggestion.description }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="View Details" color="primary" @click="navigateTo(suggestion)" />
            <q-btn
              flat
              icon="bookmark"
              aria-label="Save Suggestion"
              @click="bookmarkSuggestion(suggestion)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuggestionsStore } from 'src/features/suggestions/store/useSuggestionsStore'
import { getCurrentPosition } from 'src/features/shared/utils/geolocation'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/useAuthStore'
import { fetchNearbySuggestions } from 'src/features/suggestions/api/fetchNearbySuggestions'

import { activityTypesByMood } from 'src/features/suggestions/utils/activityTypesMapper'

const $q = useQuasar()

const moodValue = ref(50) // Default mood value

const loading = ref(true) // Tracks loading state
const suggestionsStore = useSuggestionsStore()

const authStore = useAuthStore()

// Filter suggestions dynamically based on mood and other criteria
const filteredSuggestions = computed(() => {
  return suggestionsStore.suggestions.filter((s) => {
    if (moodValue.value < 30) return s.category === 'relaxing'
    if (moodValue.value < 70) return s.category === 'focused'
    return s.category === 'adventurous'
  })
})
console.log('f', filteredSuggestions.value)

// Get mood label based on slider value
const getMoodLabel = (value) => {
  if (value < 30) return 'Relaxed'
  if (value < 70) return 'Focused'
  return 'Adventurous'
}

// Fetch suggestions on page load with location
const loadSuggestions = async () => {
  try {
    const location = await getCurrentPosition()
    console.log('User location:', location)
    const data = await suggestionsStore.fetchSuggestions({
      location: location, // Pass location to the fetch logic
    })
    console.log(data)
  } catch (error) {
    console.error('Error fetching suggestions:', error.message)
    $q.notify({ type: 'negative', message: 'Failed to load suggestions. Please try again.' })
  } finally {
    loading.value = false
  }
}

const updateSuggestions = async () => {
  loading.value = true
  const location = await getCurrentPosition()
  const moodLabel =
    moodValue.value < 30 ? 'Relaxed' : moodValue.value < 70 ? 'Focused' : 'Adventurous'
  const suggestions = await fetchNearbySuggestions(location, activityTypesByMood[moodLabel])
  suggestionsStore.setSuggestions(suggestions)
  loading.value = false
}

// Fetch data when the component is mounted
onMounted(() => {
  updateSuggestions()
  loadSuggestions()
  console.log(authStore.user)
})

// Update mood filter
const updateMood = () => {
  moodValue.value = Number(moodValue.value) // Ensure it is always a number
  console.log('Mood updated:', moodValue.value)
}

// Navigate to suggestion details (placeholder logic)
const navigateTo = (suggestion) => {
  console.log('Navigating to:', suggestion.title)
  // Logic for navigation
}

// Bookmark a suggestion
const bookmarkSuggestion = (suggestion) => {
  console.log('Bookmarked:', suggestion.title)
  $q.notify({ type: 'positive', message: `Saved "${suggestion.title}" to favorites.` })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: $spacing-medium;
  background: $color-neutral-light;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Mood Slider */
.mood-slider-container {
  margin-bottom: $spacing-large;
}

.mood-slider {
  .slider-label {
    font-family: $font-family-main;
    font-weight: $font-weight-bold;
    color: $dark;
  }
}

/* Suggestion Cards */
.suggestions-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-medium;
  justify-content: center;
}

.suggestion-card {
  background-color: black;
  width: 300px;
  @include card-shadow;

  .card-image {
    height: 150px;
    border-radius: 8px 8px 0 0;
  }

  .card-title {
    font-family: $font-family-main;
    font-size: $font-size-large;
    font-weight: $font-weight-bold;
    color: $dark;
    margin-bottom: $spacing-small;
  }

  .card-description {
    font-family: $font-family-main;
    font-size: $font-size-small;
    color: $color-neutral-dark;
    margin-bottom: $spacing-medium;
  }
}
</style>
