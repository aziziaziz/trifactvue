<template>
  <div class="loading-main">
    <div class="loading-circle"></div>
    <div class="loading-text">{{ text }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  text: { type: String, default: 'Loading' } // The text for the loading
});
</script>

<style scoped>
.loading-main {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 10px;
}
.loading-circle {
  max-height: 25px;
  min-height: 25px;
  max-width: 25px;
  min-width: 25px;
  border-color: transparent gray gray gray;
  border-radius: 100%;
  border-style: solid;
  border-width: 3px;
  animation: loader 1s ease-in-out infinite;
}
.loading-text {
  font-weight: bold;
}

@keyframes loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
</style>