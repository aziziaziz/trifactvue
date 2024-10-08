<template>
	<div :class="[ 'input-main', { 'input-disabled': disabled } ]">
		<div class="input-label">{{ props.placeholder }} <span v-if="isRequired" class="error-text">**</span></div>
		<input :class="[{ 'input-box-error': errorMessage }, 'input-box']" :type="type" v-model="inputValue" @input="userInput"
			@keydown="inputKeyDown" :disabled="disabled" @blur="inputFocusOut">
		<div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>
	</div>
</template>

<script setup>
import { defineProps, ref, defineEmits, onMounted, watch } from 'vue';

const props = defineProps({
	placeholder: { type: String, default: 'Label' }, // Use the name the label/placeholder
	value: String, // Use for the value and it is binding to inputValue
	isRequired: Boolean, // Used to indicate that this input is required
	errorMessage: String, // Use to show the error message
	disabled: { type: Boolean, default: false }, // To set that the input is disabled
	type: { type: String, default: 'text' }, // The type of the input
});
const emit = defineEmits([
	'update:value',
	'update:errorMessage',
	'enter',
	'focusOut'
])

//#region Data
const inputValue = ref(''); // Private value binded to the input element
//#endregion Data

//#region Method
const userInput = () => {
	// Clear the error message from the parent component
	emit('update:errorMessage', '');
	// Updating the value back to the parent component
	emit('update:value', inputValue.value);
}
const inputKeyDown = (e) => {
  if (e.key == 'Enter') {
    emit('enter');
  }
}
const inputFocusOut = () => {
	emit('focusOut');
}
//#endregion Method

//#region Lifecycle
onMounted(() => {
	if (props.value) {
		inputValue.value = props.value;
	}
});
//#endregion Lifecycle

//#region Watchers
watch(() => props.value, (val) => {
	inputValue.value = val;
});
//#endregion Watchers
</script>

<style scoped>
.input-main {
	display: flex;
	flex-direction: column;
	width: 100%;
}
.input-disabled {
	pointer-events: none;
	opacity: 0.6;
}
.input-box {
	width: 100%;
	padding: 5px 10px;
  background-color: rgba(250, 250, 250, 0.2);
  border: 2px solid rgba(180, 180, 180, 0.4);
  border-radius: 5px;
}
.input-box-error {
	border: 2px solid indianred;
}
.input-box:focus {
  border: 2px solid gray;
  outline: none;
}
</style>