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
        <div v-if="filteredSuggestions.length === 0" class="no-suggestions">
          <q-card class="fallback-card">
            <q-card-section>
              <div class="text-h6 text-center">No places found nearby</div>
              <p class="text-center">
                Try selecting another mood or adjusting your location settings.
              </p>
              <q-btn
                label="Retry"
                color="primary"
                flat
                @click="updateSuggestions"
                class="retry-button"
              />
            </q-card-section>
          </q-card>
        </div>

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
            <div class="row">
              <q-btn
                flat
                dense
                class="col"
                icon="sym_o_info"
                aria-label="View Details"
                color="secondary"
                @click="navigateTo(suggestion)"
              />
              <q-btn
                flat
                class="col"
                dense
                icon="sym_o_heart_plus"
                :color="favoritesStore.isFavorite(suggestion) ? 'accent' : 'secondary'"
                aria-label="Save Suggestion"
                @click="bookmarkSuggestion(suggestion)"
              />
              <q-btn
                v-if="suggestion.nationalPhoneNumber"
                flat
                dense
                class="col"
                icon="sym_o_phone"
                color="secondary"
                @click="makePhoneCall"
                aria-label="Call"
              />
              <!-- Navigation Button -->
              <q-btn
                flat
                dense
                class="col"
                icon="sym_o_navigation"
                color="secondary"
                aria-label="Navigate to Location"
                @click="launchMapsNavigation(suggestion)"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog
      class="detailsDialog"
      v-model="detailsDialogVisible"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="q-pa-md text-secondary" style="width: 475px">
        <q-card-section>
          <div class="text-h6">{{ selectedPlace?.name || 'Place Details' }}</div>
          <q-carousel
            v-if="selectedPlace?.photos?.length"
            v-model="carouselIndex"
            arrows
            infinite
            class="q-mt-md"
            @click="openFullScreenCarousel"
          >
            <q-carousel-slide
              v-for="(photo, index) in selectedPlace.photos"
              :key="index"
              :name="index"
              :img-src="photo"
            />
          </q-carousel>

          <div class="text-subtitle2 q-mb-md">{{ selectedPlace?.formattedAddress }}</div>
          <div v-if="selectedPlace?.rating" class="q-mb-sm">
            <q-icon name="star" color="amber" /> {{ selectedPlace.rating }} / 5
          </div>
          <div v-if="selectedPlace?.nationalPhoneNumber" class="q-mb-sm">
            <q-icon name="phone" color="secondary" /> {{ selectedPlace.nationalPhoneNumber }}
          </div>
          <div v-if="selectedPlace?.openNow !== undefined" class="q-mb-sm">
            <q-icon
              :name="selectedPlace.openNow ? 'check_circle' : 'cancel'"
              :color="selectedPlace.openNow ? 'positive' : 'negative'"
            />
            {{ selectedPlace.openNow ? 'Open Now' : 'Closed' }}
          </div>
          <div v-if="selectedPlace?.openingHours" class="q-mt-md">
            <div v-for="(hour, index) in selectedPlace.openingHours" :key="index">
              {{ hour }}
            </div>
          </div>
          <div v-if="selectedPlace?.websiteUri" class="q-mt-md">
            <q-btn
              class="full-width"
              color="secondary"
              label="Visit Website"
              :href="selectedPlace.websiteUri"
              target="_blank"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            color="secondary"
            icon="sym_o_location_on"
            aria-label="Open in Maps"
            @click="openInMaps"
          />
          <q-btn
            v-if="selectedPlace.nationalPhoneNumber"
            flat
            icon="sym_o_phone"
            color="secondary"
            @click="makePhoneCall"
            aria-label="Call"
          />
          <q-btn
            flat
            icon="sym_o_close"
            aria-label="close"
            color="secondary"
            @click="closeDetailsDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuggestionsStore } from 'src/features/suggestions/store/useSuggestionsStore'
import { getCurrentPosition } from 'src/features/shared/utils/geolocation'
import { useQuasar } from 'quasar'
import { fetchNearbySuggestions } from 'src/features/suggestions/api/fetchNearbySuggestions'
import { getActivityByMood } from 'src/features/suggestions/utils/activityTypesMapper'
import { useFavoritesStore } from 'src/stores/useFavoritesStore'
import { AppLauncher } from '@capacitor/app-launcher'
import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/places'
const $q = useQuasar()

const moodValue = ref(50) // Default mood value
const loading = ref(true) // Loading state for the page
const suggestionsStore = useSuggestionsStore()
const favoritesStore = useFavoritesStore()

const detailsDialogVisible = ref(false) // Controls dialog visibility
const selectedPlace = ref(null) // Holds details of the selected place

const carouselIndex = ref(0) // Tracks the current carousel index

const maximizedToggle = ref(true)

const makePhoneCall = async () => {
  const phoneNumber = selectedPlace.value.nationalPhoneNumber
  if (!phoneNumber) {
    $q.notify({
      type: 'negative',
      message: 'Phone number not available.',
    })
    return
  }

  const telUrl = `tel:${phoneNumber}`
  try {
    const { value } = await AppLauncher.canOpenUrl({ url: telUrl })
    if (value) {
      await AppLauncher.openUrl({ url: telUrl })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Unable to open the phone app.',
      })
    }
  } catch (error) {
    console.error('Error launching phone app:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to make the phone call.',
    })
  }
}
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
    const activityType = getActivityByMood(moodLabel) // Pull only the first activity for the mood

    if (!activityType) {
      console.warn(`No activity type found for mood: ${moodLabel}`)
      return
    }

    console.log(`Fetching suggestions for mood: "${moodLabel}" and activity: "${activityType}"`)

    const suggestions = await fetchNearbySuggestions(location, activityType)
    suggestionsStore.setSuggestions(suggestions)
    console.log('Suggestions fetched:', suggestions)
  } catch (error) {
    console.error('Error fetching suggestions:', error.message)
    $q.notify({ type: 'negative', message: 'Failed to load suggestions. Please try again.' })
  } finally {
    loading.value = false
  }
}

const fetchPhotoUrl = async (photoName, maxWidth = 400, maxHeight = 400) => {
  try {
    const response = await axios.get(`${BASE_URL}/photo`, {
      params: {
        photoName,
        maxWidth,
        maxHeight,
      },
    })
    return response.data.photoUrl
  } catch (error) {
    console.error(`Error fetching photo URL for ${photoName}:`, error.message)
    return null // Fallback to null in case of error
  }
}

// Navigate to suggestion details
const navigateTo = async (suggestion) => {
  // Fetch photo URLs for all photos in suggestion.photos
  const photoUrls = await Promise.all(
    suggestion.photos.map(async (photo) => {
      const photoUrl = await fetchPhotoUrl(photo.name)
      console.log('URL: ', photoUrl)
      return photoUrl // Append '/media' if photoUrl exists
    }),
  )

  selectedPlace.value = {
    name: suggestion.name,
    formattedAddress: suggestion.formattedAddress,
    rating: suggestion.rating,
    openingHours: suggestion.openingHours || [],
    websiteUri: suggestion.websiteUri,
    googleMapsUri: suggestion.googleMapsUri,
    openNow: suggestion.openingHours?.openNow,
    nationalPhoneNumber: suggestion.nationalPhoneNumber,
    photoUrl: photoUrls[0], // Set first photo as main image
    photos: photoUrls.filter((url) => url), // Filter out null values
  }
  detailsDialogVisible.value = true // Open the dialog
}

const closeDetailsDialog = () => {
  detailsDialogVisible.value = false // Close the dialog
  selectedPlace.value = null // Clear selected place
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

const openInMaps = async () => {
  try {
    const { value } = await AppLauncher.canOpenUrl({ url: selectedPlace.value?.googleMapsUri })
    if (value) {
      await AppLauncher.openUrl({ url: selectedPlace.value?.googleMapsUri })
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
  width: 375px;
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

.no-suggestions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 300px; // Adjust height as needed
}

.fallback-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
  @include card-shadow;
}

.retry-button {
  margin-top: 16px;
}

.q-mt-md {
  margin-top: 16px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-mt-md img {
  border-radius: 8px;
  max-height: 200px;
  width: 100%;
  object-fit: cover;
}

.detailsDialog {
  width: 375px;
}
</style>
