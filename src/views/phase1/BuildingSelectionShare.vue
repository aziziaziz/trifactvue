<template>
  <div class="building-selection-share-main">
    <div class="selection-title center">Building Selection {{ !pageErrorMessage && fullDetails ? `(${fullDetails.sqm_sqft})` : '' }}</div>
    <Loader v-if="loadingDetails" text="Loading Details" />
    <div v-else-if="pageErrorMessage" class="error-message error-text">{{ pageErrorMessage }}</div>
    <div v-else>
      <div class="center">Shared to client: {{ fullDetails?.client_name }}</div>
      <div class="center">Expiring in {{ expiryTime?.fullText() }}</div>
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
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { get } from '../../js/apiCall';
import { buildSignalR, dateDiff, hubDetails, showNoti } from '../../js/helper';

const route = useRoute();

//#region Data
const loadingDetails = ref(false); // When loading the page
const fullDetails = ref(null); // The full details of the share id including the client name and unit
const shareDetails = ref(null); // The details of the items that have been shared in the JSON file
const pageErrorMessage = ref(''); // The error message to show to the user if the share id has expired or invalid or any other messages
const currentExpiredTime = ref(null); // The current expired time
const expiryTime = ref(null); // The expiry time countdown
const countdownTimer = ref(null); // The timer for the countdown
const signalHub = ref(null); // The hub connection
//#endregion Data

//#region Methods
const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    // Get the current difference
    expiryTime.value = (dateDiff(currentExpiredTime.value, new Date()));

    // Clear the interval once it is expired and show the expire message
    if (expiryTime.value.millis < 0) {
      clearInterval(countdownTimer.value);
      pageErrorMessage.value = 'This link has expired. Please get a new link.';
    }
  }, 1000);
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Show the loading
  loadingDetails.value = true;

  // Connect to the signalr
  if (!signalHub.value) {
    signalHub.value = buildSignalR(hubDetails.BUILDINGHUBNAME);
    signalHub.value.start();
  }

  // Listening to the signal if there is an extend time
  signalHub.value.on(hubDetails.BUILDINGEXTENDTIME, async (id) => {
    // Checking if the id passed same as the current id
    if (id == route.params.id) {
      // Getting the full details again
      fullDetails.value = await get(`FormShare/GetShareFullDetails?id=${route.params.id}`);

      // Checking if the full details is not empty
      if (fullDetails.value) {
        // set the current expired time
        currentExpiredTime.value = new Date(fullDetails.value.expiry_datetime);
        // Show notification saying that the time has been extended
        showNoti('Expiry time extended', 'success');
      }
    }
  });

  // Get the full details for the share id
  fullDetails.value = await get(`FormShare/GetShareFullDetails?id=${route.params.id}`);

  // If the result from the DB is not empty
  if (fullDetails.value) {
    // Need to check here if the link has expired
    currentExpiredTime.value = new Date(fullDetails.value.expiry_datetime);
    expiryTime.value = (dateDiff(currentExpiredTime.value, new Date()));
    if (expiryTime.value.millis < 0) {
      pageErrorMessage.value = 'This link has expired. Please get a new link.';
    } else {
      // Set timeout to offset the millisecond difference
      setTimeout(() => {
        // Start the countdown
        startCountdown();
      }, expiryTime.value.millis);
      // Loading the details from the JSON saved
      shareDetails.value = await get(`FormShare/GetShareDetails?id=${route.params.id}`);
    }
  } else {
    pageErrorMessage.value = 'This link is invalid.';
  }
  
  // Hide the loading
  loadingDetails.value = false;
});
onBeforeUnmount(() => {
  // Stop the connection to the hub
  if (signalHub.value) {
    signalHub.value.stop();
  }
});
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