<template>
  <button class="button-container">
    <slot>
      Testing
    </slot>
  </button>
</template>

<script setup>
import {} from 'vue';
</script>

<style scoped>
.button-container {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: rgba(68,188,98,0.6);
  transition: 0.3s;
}
.button-container:focus {
  outline-color: rgb(43, 121, 63);
}
.button-container:active {
  transform: scale(0.9);
}
</style>