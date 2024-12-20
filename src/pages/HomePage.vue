<template>
  <q-page class="home-page">
    <div v-if="loading" class="loading-container">
      <q-spinner size="50px" color="primary" />
    </div>
    <div v-else>
      <!-- Mood Label -->
      <div class="mood-label text-center text-primary">
        {{ getMoodLabel(moodValue) }}
      </div>

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

        <!-- Activity Label Label -->
        <div class="mood-label text-center text-primary">
          {{ formatString(activityType) }}
        </div>
      </div>

      <!-- Suggestion Posts -->
      <div class="suggestions-container">
        <div v-if="filteredSuggestions.length === 0" class="no-suggestions">
          <div class="fallback-post">
            <div class="text-h6 text-center">No places or events found nearby</div>
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
          </div>
        </div>

        <!-- Post Format -->
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.place_id"
          class="suggestion-post"
        >
          <!-- Post Header -->
          <div class="post-header">
            <q-avatar square>
              <q-img :src="suggestion.photoUrl || defaultAvatar" />
            </q-avatar>
            <div class="post-info">
              <div class="post-title">{{ suggestion.name }}</div>
              <div class="post-subtitle">{{ suggestion.formattedAddress }}</div>
            </div>
          </div>

          <!-- Post Image -->
          <q-img
            :src="suggestion.photoUrl || defaultImage"
            :alt="suggestion.name"
            class="post-image"
          />

          <!-- Post Actions -->
          <div class="post-actions">
            <q-btn
              flat
              icon="sym_o_info"
              aria-label="View Details"
              color="secondary"
              @click="navigateTo(suggestion)"
            />
            <q-btn
              flat
              icon="sym_o_heart_plus"
              :color="favoritesStore.isFavorite(suggestion) ? 'accent' : 'secondary'"
              aria-label="Save Suggestion"
              @click="bookmarkSuggestion(suggestion)"
            />
            <q-btn
              v-if="suggestion?.nationalPhoneNumber"
              flat
              icon="sym_o_phone"
              color="secondary"
              @click="makePhoneCall(suggestion)"
              aria-label="Call"
            />
            <q-btn
              flat
              icon="sym_o_navigation"
              color="secondary"
              aria-label="Navigate to Location"
              @click="launchMapsNavigation(suggestion)"
            />
          </div>

          <!-- Post Footer -->
          <div class="post-footer">
            <div class="post-rating" v-if="suggestion.rating">
              Rating: {{ suggestion.rating }} ⭐
            </div>
            <div class="post-status">
              {{ suggestion.businessStatus || 'Status Unavailable' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Section -->
    <div class="events-container q-mt-lg">
      <div v-if="loadingEvents" class="loading-container">
        <q-spinner size="30px" color="primary" />
      </div>

      <!-- No Events Fallback -->
      <div v-else-if="events.length === 0" class="no-events">
        <div class="fallback-post">
          <div class="text-h6 text-center">No events found nearby</div>
          <p class="text-center">Try checking again later or adjusting your location settings.</p>
        </div>
      </div>

      <!-- Event Posts -->
      <div v-for="event in events" :key="event.id" class="event-post">
        <!-- Post Header -->
        <div class="post-header">
          <q-avatar square>
            <q-img :src="event.event_location_map.image || event.thumbnail" />
          </q-avatar>
          <div class="post-info">
            <div class="post-title">{{ event.title }}</div>
            <div class="post-subtitle">{{ event.date.when }}</div>
          </div>
        </div>

        <!-- Post Image -->
        <q-img :src="event.image || defaultImage" :alt="event.name" class="post-image" />

        <!-- Post Actions -->
        <div class="post-actions">
          <q-btn
            flat
            icon="sym_o_info"
            aria-label="View Details"
            color="secondary"
            @click="navigateToEvent(event)"
          />
          <q-btn
            flat
            icon="sym_o_calendar_today"
            aria-label="Add to Calendar"
            color="secondary"
            @click="addToCalendar(event)"
          />
          <q-btn
            flat
            icon="sym_o_share"
            aria-label="Share Event"
            color="secondary"
            @click="shareEvent(event)"
          />
          <q-btn
            flat
            icon="sym_o_navigation"
            color="secondary"
            aria-label="Navigate to Location"
            @click="launchMapsNavigation(event)"
          />
        </div>

        <!-- Post Footer -->
        <div class="post-footer">
          <div class="post-location">{{ event.venue?.name }} {{ event.venue?.rating }} ⭐</div>
          <div class="post-status">{{ event.isFree ? 'Free Event' : 'Paid Event' }}</div>
        </div>
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
      <q-card class="q-pa-md text-black" style="width: 475px">
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
              color="primary"
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
import { useSuggestionsStore } from 'src/stores/useSuggestionsStore'
import { getCurrentPosition } from 'src/features/shared/utils/geolocation'
import { useQuasar } from 'quasar'
import { fetchNearbySuggestions } from 'src/features/suggestions/api/fetchNearbySuggestions'
import { getActivityByMood } from 'src/features/suggestions/utils/activityTypesMapper'
import { useFavoritesStore } from 'src/stores/useFavoritesStore'
import { AppLauncher } from '@capacitor/app-launcher'
import axios from 'axios'
import { fetchEventSuggestions } from 'src/features/events/api/fetchEventSuggestions'
import { useEventsStore } from 'src/stores/useEventsStore'

const BASE_URL = 'http://localhost:5000/api/places'
const $q = useQuasar()

const moodValue = ref(50) // Default mood value
const loading = ref(true) // Loading state for the page
const suggestionsStore = useSuggestionsStore()
const favoritesStore = useFavoritesStore()
const eventsStore = useEventsStore()

const detailsDialogVisible = ref(false) // Controls dialog visibility
const selectedPlace = ref(null) // Holds details of the selected place

const carouselIndex = ref(0) // Tracks the current carousel index

const maximizedToggle = ref(true)

const events = ref([]) // Stores fetched events
const loadingEvents = ref(false) // Loading state for events

const formatEventDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}

// Fetch Event Suggestions
const fetchEvents = async () => {
  try {
    loadingEvents.value = true
    const location = await getCurrentPosition()
    events.value = await fetchEventSuggestions(location, 'events') // Use the existing utility
    console.log('Events fetched:', events.value)
  } catch (error) {
    console.error('Error fetching events:', error.message)
    $q.notify({ type: 'negative', message: 'Failed to load events. Please try again.' })
  } finally {
    loadingEvents.value = false
  }
}

const makePhoneCall = async (suggestion) => {
  selectedPlace.value = {
    nationalPhoneNumber: suggestion.nationalPhoneNumber,
  }

  console.log(selectedPlace.value)

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
  { min: 0, max: 20, label: 'Relaxed' },
  { min: 21, max: 40, label: 'Focused' },
  { min: 41, max: 60, label: 'Adventurous' },
  { min: 61, max: 80, label: 'Excited' },
  { min: 81, max: 100, label: 'Energetic' },
]

// Get mood label based on slider value
const getMoodLabel = (value) => {
  const mood = moodRanges.find((range) => value >= range.min && value <= range.max)
  return mood ? mood.label : 'Unknown'
}

// Filtered suggestions for UI
const filteredSuggestions = computed(() => suggestionsStore.suggestions)
const activityType = ref('')
// Update suggestions based on mood and location
const updateSuggestions = async () => {
  try {
    loading.value = true
    const location = await getCurrentPosition()
    const moodLabel = getMoodLabel(moodValue.value)
    activityType.value = getActivityByMood(moodLabel) // Pull only the first activity for the mood

    if (!activityType.value) {
      console.warn(`No activity type found for mood: ${moodLabel}`)
      return
    }

    console.log(
      `Fetching suggestions for mood: "${moodLabel}" and activity: "${activityType.value}"`,
    )

    const suggestions = await fetchNearbySuggestions(location, activityType.value)
    suggestionsStore.setSuggestions(suggestions)
    console.log('Suggestions fetched:', suggestions)
  } catch (error) {
    console.error('Error fetching suggestions:', error.message)
    $q.notify({ type: 'negative', message: 'Failed to load suggestions. Please try again.' })
  } finally {
    loading.value = false
  }
}

const formatString = (input) => {
  const words = input.split('_') // Replace underscores with spaces and split into words
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
  return capitalizedWords.join(' ') // Join the words back into a single string
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
  console.log(selectedPlace.value)
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

const latitude = ref()
const longitude = ref()
const mapsUrl = ref()

const launchMapsNavigation = async (suggestion) => {
  try {
    latitude.value = suggestion.location.latitude
    longitude.value = suggestion.location.longitude

    if (latitude.value && longitude.value) {
      mapsUrl.value = `https://www.google.com/maps/dir/?api=1&destination=${latitude.value},${longitude.value}`

      const { value } = await AppLauncher.canOpenUrl({ url: mapsUrl.value })
      if (value) {
        await AppLauncher.openUrl({ url: mapsUrl })
      } else {
        console.error('Cannot open Google Maps.')
        $q.notify({
          type: 'negative',
          message: 'Unable to open Google Maps.',
        })
      }
    } else {
      /* https://maps.googleapis.com/maps/api/directions/json
  ?destination=Montreal
  &origin=Toronto
  &key=YOUR_API_KEY
  */
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
  fetchEvents()
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

.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-post {
  border-radius: 8px;
  background: white;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
}

.post-info {
  margin-left: 16px;
}

.post-title {
  font-size: 1rem;
  font-weight: bold;
}

.post-subtitle {
  font-size: 0.875rem;
  color: gray;
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding: 8px 16px;
  background: #f9f9f9;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f5f5f5;
}

.post-rating {
  font-size: 0.875rem;
  color: #ff9800;
}

.post-status {
  font-size: 0.875rem;
  color: gray;
}
</style>
