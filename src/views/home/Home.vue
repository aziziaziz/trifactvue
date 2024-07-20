<template>
  <div class="home-main">
    WELCOME BACK {{ username }}!
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

//#region Data
const username = ref('');
//#endregion Data

//#region Lifecycle
onMounted(() => {
  username.value = localStorage.getItem('user');
});
//#endregion Lifecycle
</script>

<style scoped>

</style>