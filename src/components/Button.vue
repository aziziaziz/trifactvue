<template>
  <button :class="['button-container', `${theme}-theme`]">
    <slot>
      Testing
    </slot>
  </button>
</template>

<script setup>
/* eslint-disable */
import { defineProps } from 'vue';

const props = defineProps({
  // The theme of the button. Possible values: default (green), danger (red), submit (blue), warning (yellow)
  theme: { type: String, default: 'default' }
});
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
.danger-theme {
  background-color: rgb(208, 123, 123);
  color: white;
}
.danger-theme:focus {
  outline-color: red;
}
.submit-theme {
  background-color: cornflowerblue;
  color: white;
}
.submit-theme:focus {
  outline-color: blue;
}
.warning-theme {
  background-color: yellow;
}
.warning-theme:focus {
  outline-color: goldenrod
}
</style>