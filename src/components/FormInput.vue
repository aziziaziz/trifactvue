<template>
	<div class="input-main">
		<div class="input-label">{{ props.placeholder }} <span v-if="isRequired" class="error-text">**</span></div>
		<input :class="[{ 'input-box-error': errorMessage }, 'input-box']" type="text" v-model="inputValue" @input="userInput">
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
});
const emit = defineEmits([
	'update:value',
	'update:errorMessage',
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
.input-box {
	width: 100%;
	padding: 5px 10px;
  background-color: rgba(211,211,211,0.2);
  border: 2px solid rgba(211,211,211,0.2);
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