<template>
  <div class="input-container">
    <!-- <img v-if="showIcon" class="input-logo" src="../assets/logo.png" alt=""> -->
    <img v-if="icon" class="input-logo" :src="require(`../assets/${icon}`)" alt="">
    <input class="input-element" :type="inputType" v-model="inputValue" :placeholder="placeholder"
      @focus="inputIsFocus = true" @blur="inputIsFocus = false" @input="onInput" @keydown="inputKeyDown" ref="inputEl">
    <Transition name="appear">
      <img v-if="inputValue && !disableClear" class="input-clear" @click="clearClicked"
        src="../assets/input/clear.png" alt="">
    </Transition>
    <div class="line-container">
      <div class="line"></div>
      <div class="line line-focus" :style="{ maxWidth: inputIsFocus ? '100%' : '0' }"></div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, defineProps, defineEmits, defineExpose, onMounted } from 'vue';

const props = defineProps({
  showIcon: { type: Boolean, default: false },
  value: String,
  icon: String,
  disableClear: { type: Boolean, default: false },
  inputType: { type: String, default: 'text' },
  placeholder: { type: String, default: 'Custom Input' }
});
const emit = defineEmits([
  'update:value',
  'enter'
]);

//#region Data Section
const inputValue = ref('');
const inputIsFocus = ref(false);
const inputEl = ref(null);
//#endregion Data Section

//#region Methods
const clearClicked = () => {
  inputValue.value = '';
  setFocus();

  emit('update:value', inputValue.value);
}
const onInput = () => {
  emit('update:value', inputValue.value);
}
const inputKeyDown = (e) => {
  if (e.key == 'Enter') {
    emit('enter');
  }
}
const setFocus = () => {
  inputEl.value.focus();
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  if (props.value) {
    inputValue.value = props.value;
  }
});
//#endregion Lifecycle

//#region Expose
defineExpose({
  setFocus
});
//#endregion Expose
</script>

<style scoped>
.input-container {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}
.input-logo {
  height: 20px;
}
.input-clear {
  height: 15px;
  cursor: pointer;
}
.input-element {
  width: 100%;
  border: none;
  margin: 0 5px;
  padding: 5px;
}
.input-element:focus {
  outline: none;
}
.line-container {
  width: 100%;
  bottom: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}
.line {
  height: 1px;
  background-color: gray;
  width: 100%;
  margin-top: 5px;
  position: absolute;
}
.line-focus {
  height: 2px;
  width: 100%;
  background-color: rgb(68,188,98);
  transition: 0.3s;
}

.appear-enter-active, .appear-leave-active {
  transition: 0.3s;
}
.appear-enter-from, .appear-leave-to {
  transform: scale(0.5);
  opacity: 0;
}
</style>