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
          @change="updateSuggestions"
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
          :key="suggestion.place_id"
          class="suggestion-card"
        >
          <q-img :src="suggestion.photoUrl" :alt="suggestion.name" class="card-image" />
          <q-card-section>
            <div class="card-title">{{ suggestion.name }}</div>
            <div class="card-description" v-if="suggestion.businessStatus">OPEN</div>
            <div class="card-description" v-else>{{ suggestion.businessStatus }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="View Details" color="secondary" @click="navigateTo(suggestion)" />
            <q-btn
              flat
              icon="bookmark"
              :color="favoritesStore.isFavorite(suggestion) ? 'accent' : 'secondary'"
              aria-label="Save Suggestion"
              @click="bookmarkSuggestion(suggestion)"
            />
            <!-- Navigation Button -->
            <q-btn
              flat
              icon="navigation"
              color="secondary"
              aria-label="Navigate to Location"
              @click="launchMapsNavigation(suggestion)"
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
import { fetchNearbySuggestions } from 'src/features/suggestions/api/fetchNearbySuggestions'
import { activityTypesByMood } from 'src/features/suggestions/utils/activityTypesMapper'
import { useFavoritesStore } from 'src/stores/useFavoritesStore'
import { AppLauncher } from '@capacitor/app-launcher'

const $q = useQuasar()

const moodValue = ref(50) // Default mood value
const loading = ref(true) // Loading state for the page
const suggestionsStore = useSuggestionsStore()
const favoritesStore = useFavoritesStore()

// Mood ranges and labels
const moodRanges = [
  { min: 0, max: 29, label: 'Relaxed' },
  { min: 30, max: 59, label: 'Focused' },
  { min: 60, max: 79, label: 'Adventurous' },
  { min: 80, max: 89, label: 'Excited' },
  { min: 90, max: 100, label: 'Energetic' },
]

// Get mood label based on slider value
const getMoodLabel = (value) => {
  const mood = moodRanges.find((range) => value >= range.min && value <= range.max)
  return mood ? mood.label : 'Unknown'
}

// Filtered suggestions for UI
const filteredSuggestions = computed(() => suggestionsStore.suggestions)

// Update suggestions based on mood and location
const updateSuggestions = async () => {
  try {
    loading.value = true
    const location = await getCurrentPosition()
    const moodLabel = getMoodLabel(moodValue.value)
    const activityType = activityTypesByMood[moodLabel]

    if (!activityType) {
      console.warn(`No activity type found for mood: ${moodLabel}`)
      return
    }

    const suggestions = await fetchNearbySuggestions(location, activityType)
    console.log('suggestions from server: ', suggestions)
    // Add a `photoUrl` field for images

    suggestionsStore.setSuggestions(suggestions)
    console.log('Suggestions fetched:', suggestions)
  } catch (error) {
    console.error('Error fetching suggestions:', error.message)
    $q.notify({ type: 'negative', message: 'Failed to load suggestions. Please try again.' })
  } finally {
    loading.value = false
  }
}

// Navigate to suggestion details
const navigateTo = (suggestion) => {
  console.log('Navigating to:', suggestion.name)
}

// Bookmark a suggestion
const bookmarkSuggestion = (suggestion) => {
  if (favoritesStore.isFavorite(suggestion)) {
    favoritesStore.removeFavorite(suggestion)
    $q.notify({
      type: 'negative',
      message: `Removed "${suggestion.name}" from favorites.`,
    })
  } else {
    favoritesStore.addFavorite(suggestion)
    $q.notify({
      type: 'positive',
      message: `Saved "${suggestion.name}" to favorites.`,
    })
  }
}

const launchMapsNavigation = async (suggestion) => {
  const latitude = suggestion.location.latitude
  const longitude = suggestion.location.longitude

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  try {
    const { value } = await AppLauncher.canOpenUrl({ url: mapsUrl })
    if (value) {
      await AppLauncher.openUrl({ url: mapsUrl })
    } else {
      console.error('Cannot open Google Maps.')
      $q.notify({
        type: 'negative',
        message: 'Unable to open Google Maps.',
      })
    }
  } catch (error) {
    console.error('Error launching Google Maps:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to launch navigation.',
    })
  }
}
// Fetch suggestions when the component is mounted
onMounted(() => {
  updateSuggestions()
})
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
