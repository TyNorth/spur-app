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
    <q-footer elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round icon="sym_o_home" aria-label="Home" to="/home" />
        <q-btn flat round icon="sym_o_favorite" aria-label="Favorites" to="/favorites" />
        <q-btn flat round icon="sym_o_search" aria-label="Search" to="/search" />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
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
