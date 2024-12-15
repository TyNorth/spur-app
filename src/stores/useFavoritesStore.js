import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [], // Array to store bookmarked suggestions
  }),
  actions: {
    addFavorite(suggestion) {
      if (!this.favorites.find((fav) => fav.id === suggestion.id)) {
        this.favorites.push(suggestion)
      }
    },
    removeFavorite(suggestion) {
      this.favorites = this.favorites.filter((fav) => fav.id !== suggestion.id)
    },
    updateFavorites(updatedFavorites) {
      this.favorites = updatedFavorites
    },
    isFavorite(suggestion) {
      return this.favorites.some((fav) => fav.name === suggestion.name)
    },
  },
})
