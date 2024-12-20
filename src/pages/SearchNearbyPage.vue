<template>
  <q-page class="search-nearby-page">
    <!-- Search Bar -->
    <q-input
      v-model="searchQuery"
      placeholder="Search for places..."
      clearable
      dense
      outlined
      class="search-bar"
      @input="fetchAutocompleteSuggestions"
      @keydown.enter="performSearch"
      :loading="loading"
    >
      <template v-slot:append>
        <q-icon name="search" class="icon-clickable text-accent" @click="performSearch" />
      </template>
    </q-input>

    <!-- Autocomplete Suggestions -->
    <q-list v-if="autocompleteSuggestions.length > 0" class="autocomplete-list">
      <q-item
        v-for="suggestion in autocompleteSuggestions"
        :key="suggestion.placePrediction.placeId"
        clickable
        tag="div"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <q-item-section>
          <q-item-label>{{ suggestion.placePrediction.text.text }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Results Section -->
    <div v-if="loading" class="skeleton-container">
      <!-- Skeleton loader for search results -->
      <q-list>
        <q-item v-for="n in 5" :key="n" class="skeleton-item">
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="text" class="q-mb-sm" />
            <q-skeleton type="text" width="70%" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else>
      <q-list class="results-list">
        <q-item
          v-for="place in places"
          :key="place.id"
          clickable
          tag="div"
          @click="viewDetails(place)"
          class="result-item"
        >
          <q-item-section avatar>
            <q-img :src="place.photoUrl || defaultImage" :alt="place.name" class="result-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="place-name">{{ place.name }}</q-item-label>
            <q-item-label caption class="place-address">{{ place.formattedAddress }}</q-item-label>
            <q-item-label caption class="place-rating text-secondary" v-if="place.rating">
              Rating: {{ place.rating }} ⭐
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && places.length === 0" class="empty-state grid">
      <q-icon name="place" size="100px" color="grey-5" />
      <p>No results found. Try a different search.</p>
    </div>

    <!-- Place Details Dialog -->
    <!-- Place Details Dialog -->
    <q-dialog v-model="detailsDialog" persistent>
      <q-card class="place-details-card">
        <q-card-section>
          <div class="place-details-header">
            <q-img
              :src="selectedPlace.photoUrl || defaultImage"
              :alt="selectedPlace.name"
              class="place-image"
            />
            <div class="place-info">
              <h4 class="place-title">{{ selectedPlace.name || 'Place Details' }}</h4>
              <p class="place-subtitle">{{ selectedPlace.formattedAddress }}</p>
              <p class="place-subtitle" v-if="selectedPlace.nationalPhoneNumber">
                <q-icon name="phone" color="secondary" /> {{ selectedPlace.nationalPhoneNumber }}
              </p>
              <p class="place-subtitle" v-if="selectedPlace.rating">
                <q-icon name="star" color="amber" /> {{ selectedPlace.rating }} / 5
              </p>
              <p class="place-subtitle" v-if="selectedPlace.openNow !== undefined">
                <q-icon
                  :name="selectedPlace.openNow ? 'check_circle' : 'cancel'"
                  :color="selectedPlace.openNow ? 'positive' : 'negative'"
                />
                {{ selectedPlace.openNow ? 'Open Now' : 'Closed' }}
              </p>
            </div>
          </div>
          <div v-if="selectedPlace.openingHours" class="opening-hours">
            <h6 class="text-subtitle1 text-black text-bold q-mt-md">Opening Hours:</h6>
            <ul>
              <li
                class="text-black"
                v-for="(hour, index) in selectedPlace.openingHours"
                :key="index"
              >
                {{ hour }}
              </li>
            </ul>
          </div>
          <div v-if="selectedPlace.websiteUri" class="website-link q-mt-md">
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
            icon="sym_o_location_on"
            color="secondary"
            @click="openGoogleMaps"
            aria-label="Navigate"
          />
          <q-btn
            v-if="selectedPlace.nationalPhoneNumber"
            flat
            icon="sym_o_phone"
            color="secondary"
            @click="makePhoneCall"
            aria-label="Call"
          />
          <q-btn flat icon="sym_o_close" color="accent" @click="closeDetailsDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { getCurrentPosition } from 'src/features/shared/utils/geolocation'
import googlePlacesApi from 'src/features/suggestions/api/googlePlacesApi'
import { AppLauncher } from '@capacitor/app-launcher'

const $q = useQuasar()

const { autocompleteSearch, textSearch, fetchPlacePhoto } = googlePlacesApi
const searchQuery = ref('')
const autocompleteSuggestions = ref([])
const places = ref([])
const loading = ref(false)
const defaultImage = 'https://via.placeholder.com/150?text=No+Image'

// Dialog state and selected place
const detailsDialog = ref(false)
const selectedPlace = ref({})

// Fetch autocomplete suggestions
const fetchAutocompleteSuggestions = async () => {
  if (!searchQuery.value) {
    autocompleteSuggestions.value = []
    return
  }

  try {
    const locationBias = { latitude: 37.7749, longitude: -122.4194, radius: 5000 }
    autocompleteSuggestions.value = await autocompleteSearch(searchQuery.value, locationBias)
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch autocomplete suggestions.',
    })
  }
}

// Select an autocomplete suggestion
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.placePrediction.text.text
  autocompleteSuggestions.value = []
  performSearch()
}

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

// Perform search
const performSearch = async () => {
  if (!searchQuery.value) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a search query.',
    })
    return
  }

  const currentPosition = await getCurrentPosition()
  loading.value = true
  try {
    const locationBias = {
      latitude: currentPosition.latitude,
      longitude: currentPosition.longitude,
      radius: 500,
    }
    places.value = await textSearch(searchQuery.value, locationBias)
    console.log('places:', places.value)

    for (const place of places.value) {
      if (place.photos) {
        try {
          const photoResponse = await fetchPlacePhoto(place.photos[0].name)
          place.photoUrl = photoResponse
        } catch (photoError) {
          console.error(`Error fetching photo for place ${place.id}:`, photoError)
          place.photoUrl = defaultImage
        }
      } else {
        place.photoUrl = defaultImage
      }
    }

    $q.notify({
      type: 'positive',
      message: `Found ${places.value.length} results.`,
    })
  } catch (error) {
    console.error('Error performing search:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch search results.',
    })
  } finally {
    loading.value = false
  }
}

// View details of a place
const viewDetails = (place) => {
  selectedPlace.value = {
    name: place.name,
    formattedAddress: place.formattedAddress,
    rating: place.rating,
    openingHours: place.openingHours?.weekdayDescriptions || [],
    websiteUri: place.websiteUri,
    googleMapsUri: place.googleMapsUri,
    openNow: place.openingHours?.openNow,
    nationalPhoneNumber: place.nationalPhoneNumber,
    photoUrl: place.photoUrl || defaultImage,
  }
  console.log('Selected Place Details:', selectedPlace.value)
  detailsDialog.value = true
}

// Close details dialog
const closeDetailsDialog = () => {
  detailsDialog.value = false
}

// Generate and open Google Maps link using Capacitor AppLauncher
const openGoogleMaps = async () => {
  const mapsUrl = selectedPlace.value.googleMapsUri

  try {
    const { value } = await AppLauncher.canOpenUrl({ url: mapsUrl })
    if (value) {
      await AppLauncher.openUrl({ url: mapsUrl })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Unable to open Google Maps app.',
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
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  place-items: center;
}
.search-nearby-page {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #f5f5f5;
}

/* Search Bar */
.search-bar {
  margin-bottom: 16px;
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6); // Subtle translucency
  backdrop-filter: blur(8px); // Glassmorphic effect
  -webkit-backdrop-filter: blur(8px); // Ensures browser support
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); // Soft shadow
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); // Enhanced shadow on hover
  }

  .q-input {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    color: #1a1a2e;
  }

  .icon-clickable {
    cursor: pointer;
    color: #4c8bf5; // Material You-inspired blue
    transition: color 0.3s ease;

    &:hover {
      color: darken(#4c8bf5, 10%);
    }
  }
}

.icon-clickable {
  cursor: pointer;
  color: #0056b3;
}

.autocomplete-list {
  background: white;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* Results List */
/* Results List */
.results-list {
  margin-top: 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px; // Adds spacing between items
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6); // Glass effect
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;

  &:hover {
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
    cursor: pointer;
  }

  .result-image {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    object-fit: cover;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .result-details {
    display: flex;
    flex-direction: column;

    .place-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a2e; // Material You deep navy
      margin-bottom: 4px;
    }

    .place-address,
    .place-rating {
      font-size: 0.875rem;
      color: #666;
    }

    .place-rating {
      color: $accent; // Accent color for ratings
      display: flex;
      align-items: center;
      gap: 4px;

      q-icon {
        color: $accent;
      }
    }
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  text-align: center;

  q-icon {
    color: rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 1rem;
    color: #999;
  }
}

.result-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: white;
  transition: box-shadow 0.3s;
}

.result-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.place-name {
  font-weight: bold;
  color: #333;
}

.place-address {
  font-size: 0.875rem;
  color: #666;
}

.place-rating {
  font-size: 0.875rem;
  color: #007bff;
}

.place-details-card {
  max-width: 500px;
  border-radius: 16px; // Softer, modern rounded corners
  background: rgba(255, 255, 255, 0.6); // Glassmorphic translucent white
  backdrop-filter: blur(12px); // Enhanced blur effect
  -webkit-backdrop-filter: blur(12px); // Ensures cross-browser support
  border: 1px solid rgba(255, 255, 255, 0.3); // Subtle border for structure
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); // Modern soft shadow
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-4px); // Adds a slight lift effect
  }

  /* Inner Content Styling */
  .place-details-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .place-image {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      object-fit: cover;
      margin-right: 16px;
    }

    .place-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e; // Deep navy for contrast
      margin-bottom: 4px;
    }

    .place-subtitle {
      font-size: 0.875rem;
      color: #666;
      display: flex;
      align-items: center;
      gap: 4px;

      q-icon {
        color: #4c8bf5; // Primary accent for icons
      }
    }
  }

  .opening-hours ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 0.875rem;
      color: #333;
      margin-bottom: 4px;
    }
  }

  .website-link {
    margin-top: 12px;
    text-align: center;

    a,
    .q-btn {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #4c8bf5;
      transition: color 0.3s ease;

      &:hover {
        color: darken(#4c8bf5, 10%);
      }
    }
  }
}

.place-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  margin-right: 16px;
}

.place-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.place-subtitle {
  font-size: 0.875rem;
  color: #666;
}

.place-details-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.place-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
}

.place-info {
  flex-grow: 1;
}

.opening-hours ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.opening-hours li {
  font-size: 0.875rem;
  color: #666;
}

.website-link {
  margin-top: 16px;
}

.q-card {
  max-width: 500px;
}
</style>
