<template>
  <button :class="['button-container', `${theme}-theme`]" :disabled="disabled || loading"
    @click="emit('click')">
    <slot>
      Button
    </slot>
    <div v-if="loading" class="loading-container">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  </button>
</template>

<script setup>
/* eslint-disable */
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  // The theme of the button. Possible values: default (green), danger (red), submit (blue), warning (yellow)
  theme: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits([
  'click'
]);
</script>

<style scoped>
.button-container {
  position:relative;
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
.button-container:disabled {
  pointer-events: none;
  outline: none;
  opacity: 1;
  color: inherit;
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
.loading-container {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(180,180,180,0.5);
  backdrop-filter: blur(2px);
  border-radius: 10px;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.loading-dot {
  border-radius: 100%;
  height: 0.8em;
  width: 0.8em;
  background-color: rgb(70,70,70);
  margin: 0 2px;
  transition: 0.3s;
  animation: loading-animation 1s linear infinite;
}
.loading-dot:nth-child(2) {
  animation-delay: 0.3s;
}
.loading-dot:nth-child(3) {
  animation-delay: 0.6s;
}
@keyframes loading-animation {
  0%, 66%, 100% {
    transform: scale(1);
  }
  33% {
    transform: scale(0.3);
  }
}
</style>