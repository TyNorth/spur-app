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
        <q-icon name="search" @click="performSearch" />
      </template>
    </q-input>

    <!-- Autocomplete Suggestions -->
    <q-list v-if="autocompleteSuggestions.length > 0" class="autocomplete-list">
      <q-item
        v-for="suggestion in autocompleteSuggestions"
        :key="suggestion.placePrediction.placeId"
        clickable
        tag="div"
        @click="selectSuggestion(suggestion)"
      >
        <q-item-section>
          <q-item-label>{{ suggestion.placePrediction.text.text }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Results Section -->
    <div v-if="loading" class="loading-container">
      <q-spinner size="50px" color="primary" />
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
            <q-item-label>{{ place.name }}</q-item-label>
            <q-item-label caption>{{ place.formattedAddress }}</q-item-label>
            <q-item-label caption v-if="place.rating"> Rating: {{ place.rating }} ⭐ </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && places.length === 0" class="empty-state">
      <q-icon name="place" size="100px" color="grey-5" />
      <p>No results found. Try a different search.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

import googlePlacesApi from 'src/features/suggestions/api/googlePlacesApi'

const $q = useQuasar()

const { autocompleteSearch, textSearch } = googlePlacesApi // Data
const searchQuery = ref('')
const autocompleteSuggestions = ref([])
const places = ref([])
const loading = ref(false)
const defaultImage = 'https://via.placeholder.com/150?text=No+Image'

// Fetch autocomplete suggestions
const fetchAutocompleteSuggestions = async () => {
  if (!searchQuery.value) {
    autocompleteSuggestions.value = []
    return
  }

  try {
    const locationBias = { latitude: 37.7749, longitude: -122.4194, radius: 5000 } // Replace with actual location
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

// Perform search using the Text Search API
const performSearch = async () => {
  if (!searchQuery.value) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a search query.',
    })
    return
  }

  loading.value = true
  try {
    const locationBias = { latitude: 37.7749, longitude: -122.4194, radius: 5000 } // Replace with actual location
    places.value = await textSearch(searchQuery.value, locationBias)

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
  console.log('Viewing details for:', place)
  // Navigate to place details page or open a modal
}
</script>

<style lang="scss" scoped>
.search-nearby-page {
  display: flex;
  flex-direction: column;
  padding: $spacing-medium;
  background: $color-neutral-light;
}

/* Search Bar */
.search-bar {
  margin-bottom: $spacing-medium;
  width: 100%;
}

/* Autocomplete List */
.autocomplete-list {
  background: white;
  margin-bottom: $spacing-small;
  border: 1px solid $color-neutral-dark;
  border-radius: 8px;
}

/* Results List */
.results-list {
  margin-top: $spacing-small;
  padding: 0;
}

.result-item {
  padding: $spacing-small;
  border: 1px solid $color-neutral-dark;
  border-radius: 8px;
  margin-bottom: $spacing-small;

  .result-image {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
  }
}

/* Loading Container */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  color: $color-neutral-dark;

  p {
    margin-top: $spacing-small;
  }
}
</style>
