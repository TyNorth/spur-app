<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Logo -->
        <q-btn flat round icon="near_me" aria-label="Spur Logo" class="logo" />
        <q-toolbar-title> Spur </q-toolbar-title>

        <!-- Navigation Links -->
        <q-btn flat round icon="explore" aria-label="Discover" />
        <q-btn flat round icon="groups" aria-label="Groups" />
        <q-btn flat round icon="account_circle" aria-label="Profile" to="/profile" />
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-btn flat round icon="home" aria-label="Home" to="/home" />
        <q-btn flat round icon="favorite" aria-label="Favorites" />
        <q-btn flat round icon="search" aria-label="Search" />
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
