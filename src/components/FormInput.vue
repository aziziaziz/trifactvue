<template>
	<div class="input-main">
		<div class="input-label">{{ props.placeholder }}</div>
		<input class="input-box" type="text">
	</div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
	placeholder: { type: String, default: 'Label' }, // Use the name the label/placeholder
});
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
.input-box:focus {
  border: 2px solid gray;
  outline: none;
}
</style>