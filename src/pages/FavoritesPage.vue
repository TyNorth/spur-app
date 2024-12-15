<template>
  <q-page class="favorites-page">
    <div v-if="bookmarkedSuggestions.length === 0" class="empty-state">
      <q-icon name="bookmark" size="100px" color="grey-5" />
      <p>No favorites added yet. Start bookmarking your favorite places!</p>
    </div>

    <div v-else class="favorites-container">
      <q-card
        v-for="suggestion in bookmarkedSuggestions"
        :key="suggestion.id"
        class="suggestion-card"
      >
        <q-img :src="suggestion.photoUrl" :alt="suggestion.name" class="card-image" />
        <q-card-section>
          <div class="card-title">{{ suggestion.name }}</div>
          <div class="card-details">
            <p>{{ suggestion.formattedAddress }}</p>
            <p v-if="suggestion.rating">Rating: {{ suggestion.rating }} ⭐</p>
            <p v-if="suggestion.websiteUri">
              <a :href="suggestion.websiteUri" target="_blank" class="place-link">Visit Website</a>
            </p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Remove from Favorites"
            color="negative"
            @click="removeFromFavorites(suggestion)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFavoritesStore } from 'src/stores/useFavoritesStore'
import { fetchPlaceDetails } from 'src/features/suggestions/api/googlePlacesApi' // API for fetching Place Details

const favoritesStore = useFavoritesStore()

// Computed list of bookmarked suggestions
const bookmarkedSuggestions = computed(() => favoritesStore.favorites)

// Method to remove a suggestion from favorites
const removeFromFavorites = (suggestion) => {
  favoritesStore.removeFavorite(suggestion)
}

// Fetch detailed info for all favorites on mount
onMounted(async () => {
  console.log('Mounting...')
  const updatedFavorites = await Promise.all(
    favoritesStore.favorites.map(async (favorite) => {
      if (!favorite.detailsFetched) {
        try {
          const details = await fetchPlaceDetails(favorite.id, [
            'id',
            'displayName',
            'formattedAddress',
            'rating',
            'websiteUri',
          ])
          return { ...favorite, ...details, detailsFetched: true }
        } catch (error) {
          console.error(`Failed to fetch details for ${favorite.name}:`, error.message)
          return favorite
        }
      }
      return favorite
    }),
  )
  favoritesStore.updateFavorites(updatedFavorites)
})
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: $spacing-medium;
  background: $color-neutral-light;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  color: $color-neutral-dark;

  p {
    font-family: $font-family-main;
    color: $dark;
    margin-top: $spacing-small;
  }
}

/* Favorites Container */
.favorites-container {
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

  .card-details {
    font-family: $font-family-main;
    font-size: $font-size-small;
    color: $color-neutral-dark;
    margin-bottom: $spacing-medium;

    .place-link {
      color: $primary;
      text-decoration: none;
    }
  }
}
</style>
