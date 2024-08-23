<template>
  <Loader v-if="loadingDetails" text="Loading Details" />
  <div v-else class="building-selection-share-main">
    Share detials
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { get } from '../../js/apiCall';

const route = useRoute();

//#region Data
const loadingDetails = ref(false); // When loading the details from the JSON
//#endregion Data

//#region Lifecycle
onMounted(async () => {
  // Loading the details from the JSON saved
  loadingDetails.value = true;
  let details = await get(`FormShare/GetShareDetails?id=${route.params.id}`);
  console.log(details);
  loadingDetails.value = false;
})
//#endregion Lifecycle
</script>

<style scoped>
.building-selection-share-main {
  padding: 10px;
}
</style>