<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Logo -->
        <q-btn flat round icon="sym_o_near_me" aria-label="Spur Logo" class="logo" />
        <q-toolbar-title> Spur </q-toolbar-title>

        <!-- Navigation Links -->
        <q-btn flat round icon="sym_o_explore" aria-label="Discover" />
        <q-btn flat round icon="sym_o_diversity_1" aria-label="Groups" />
        <q-btn flat round icon="sym_o_account_circle" aria-label="Profile" to="/profile" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <!-- Footer -->
    <q-footer elevated class="bg-primary text-white">
      <q-tabs
        v-model="activeTab"
        no-caps
        dense
        class="justify-around"
        active-color="secondary"
        indicator-color="secondary"
      >
        <q-tab
          name="home"
          class="full-width"
          icon="sym_o_home"
          label="Home"
          @click="$router.push('/home')"
        />
        <q-tab
          name="favorites"
          icon="sym_o_favorite"
          label="Favorites"
          class="full-width"
          @click="$router.push('/favorites')"
        />
        <q-tab
          name="search"
          class="full-width"
          icon="sym_o_search"
          label="Search"
          @click="$router.push('/search')"
        />
        <q-tab
          name="profile"
          class="full-width"
          icon="sym_o_account_circle"
          label="Profile"
          @click="$router.push('/profile')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('home') // Tracks the active tab

// Quasar components are imported globally, so no need for specific imports.
</script>

<style lang="scss" scoped>
/* Header styles */
.logo {
  color: $color-white;
  font-size: 24px;
}

.q-toolbar-title {
  font-family: $font-family-main;
  font-weight: $font-weight-bold;
  font-size: $font-size-large;
}

/* Footer styles */
.q-footer .q-toolbar {
  justify-content: space-around;
}

.q-btn {
  font-size: $font-size-base;
}
</style>
