<template>
  <Transition name="popup-trans" :duration="300">
    <div v-if="show" class="popup-main">
      <div class="popup-background"></div>
      <div class="popup-container">
        <div class="popup-header">
          <slot name="header">Header</slot>
        </div>
        <div class="popup-content">
          <slot name="content">Content</slot>
        </div>
        <div class="popup-footer">
          <slot name="footer">Footer</slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/* eslint-disable */
import { defineProps, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false }, // To show or hide the popup
});
</script>

<style scoped>
.popup-main {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 21;
  height: 100dvh;
  width: 100vw;
  padding-left: 210px;
  padding-top: 60px;
}
.popup-background {
  background-color: rgba(128, 128, 128, 0.5);
  /* background-color: red; */
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 2;
  backdrop-filter: blur(1px);
}
.popup-container {
  background-color: white;
  width: calc(100% - 220px);
  max-width: 500px;
  max-height: calc(100% - 70px);
  padding: 10px;
  border-radius: 10px;
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
}
.popup-header {
  width: 100%;
  text-align: center;
  font-weight: bold;
  font-size: 1.2em;
  padding: 5px;
}
.popup-content {
  height: 100%;
  overflow: auto;
  padding: 5px;
}
.popup-footer {
  width: 100%;
  padding: 5px;
}

.popup-trans-enter-active .popup-background, .popup-trans-leave-active .popup-background,
.popup-trans-enter-active .popup-container, .popup-trans-leave-active .popup-container {
  transition: 0.3s;
}
.popup-trans-enter-from .popup-background, .popup-trans-leave-to .popup-background {
  opacity: 0;
}
.popup-trans-enter-from .popup-container, .popup-trans-leave-to .popup-container {
  transform: translateY(25%);
  opacity: 0;
}

@media screen and (max-width: 1000px) {
  .popup-main {
    padding-left: 10px;
  }
  .popup-container {
    width: calc(100% - 20px);
  }
}
</style>