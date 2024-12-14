<template>
  <q-card class="suggestion-card">
    <q-img :src="suggestion.image_url" class="card-image" />
    <q-card-section>
      <div class="card-title">{{ suggestion.title }}</div>
      <div class="card-description">{{ suggestion.description }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps(['suggestion'])
</script>

<style scoped lang="scss">
.suggestion-card {
  width: 300px;
  @include card-shadow;

  .card-image {
    height: 150px;
  }
  .card-title {
    font-weight: bold;
  }
  .card-description {
    color: gray;
  }
}
</style>
