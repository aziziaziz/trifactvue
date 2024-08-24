<template>
  <div class="building-selection-share-main">
    <div class="selection-title center">Building Selection {{ fullDetails ? `(${fullDetails.sqm_sqft})` : '' }}</div>
    <Loader v-if="loadingDetails" text="Loading Details" />
    <div v-else-if="pageErrorMessage" class="error-message error-text">{{ pageErrorMessage }}</div>
    <div v-else>
      <div class="center">Shared to client: {{ fullDetails?.client_name }}</div>
      <div class="center">Expire at {{ fullDetails?.expiry_datetime }}</div>
      <table>
        <tr>
          <th>Criteria</th>
          <th>Preference</th>
          <th>Weighting (1-10)</th>
        </tr>
        <tr v-for="(det,detInd) in shareDetails" :key="detInd">
          <td>
            <div>{{ det.description }}</div>
            <div class="criteria-remarks">{{ det.remarks }}</div>
          </td>
          <td>{{ det.user_preference }}</td>
          <td>{{ det.weightage }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { get } from '../../js/apiCall';

const route = useRoute();

//#region Data
const loadingDetails = ref(false); // When loading the page
const fullDetails = ref(null); // The full details of the share id including the client name and unit
const shareDetails = ref(null); // The details of the items that have been shared in the JSON file
const pageErrorMessage = ref(''); // The error message to show to the user if the share id has expired or invalid or any other messages
//#endregion Data

//#region Lifecycle
onMounted(async () => {
  // Show the loading
  loadingDetails.value = true;

  // Get the full details for the share id
  fullDetails.value = await get(`FormShare/GetShareFullDetails?id=${route.params.id}`);

  // If the result from the DB is not empty
  if (fullDetails.value) {
    // Need to check here if the link has expired

    // Loading the details from the JSON saved
    shareDetails.value = await get(`FormShare/GetShareDetails?id=${route.params.id}`);
  } else {
    pageErrorMessage.value = 'This link is invalid.';
  }
  
  // Hide the loading
  loadingDetails.value = false;
})
//#endregion Lifecycle
</script>

<style scoped>
.building-selection-share-main {
  padding: 10px;
}
.selection-title {
  font-weight: bold;
  font-size: 1.3em;
}
.center {
  text-align: center;
}
.error-message {
  font-weight: bold;
  font-size: 1.1em;
  text-align: center;
  margin: 10px 0;
}
table {
  border-collapse: collapse;
  margin-top: 10px;
}
table tr th, table tr td {
  border: 1px solid gray;
  padding: 5px;
  white-space: nowrap;
}
td:first-child  {
  width: 100%;
}
td:not(:first-child) {
  text-align: center;
}
td > input {
  width: 100px;
}
.criteria-remarks {
  font-size: 0.8em;
  font-style: italic;
}
</style>