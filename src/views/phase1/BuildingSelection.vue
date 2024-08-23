<template>
  <Loader v-if="loadingCriteria" text="Loading Criteria" />
  <div v-else class="building-selection-main">
    <div class="button-section">
      <Button class="save-button" @click="shareClicked">Share</Button>
      <Button class="save-button" theme="submit">Save</Button>
    </div>
    <table>
      <tr>
        <th>Criteria</th>
        <th>Preference</th>
        <th>Weighting (1-10)</th>
      </tr>
      <tr v-for="(crit,critInd) in criteria" :key="critInd">
        <td>
          <div class="criteria-section">
            <div>{{ crit.criteria }}</div>
            <input type="text" placeholder="Remarks" v-model="crit.remarks">
          </div>
        </td>
        <td><input type="text" v-model="crit.preference"></td>
        <td><input type="text" v-model="crit.weighting"></td>
      </tr>
    </table>
  </div>

  <Popup :show="showSharePopup">
    <template v-slot:header>Share Link</template>
    <template v-slot:content>
      <Loader v-if="loadingShareId" text="Generating Share Link" />
      <div v-else-if="!linkSharedDetails" class="share-link-popup-details">
        <div>You may share this form via the link below</div>
        <div>This link will only bbe available for up to 12 hours only</div>
      </div>
      <div v-else-if="linkSharedDetails" class="share-link-popup-details">
        <div>Link have been shared previously and will expire at {{ linkSharedDetails.expiry_datetime }}.</div>
        <div>You can extend the time for the share link or update the share details below</div>
        <div class="extend-share-id-section">
          <div>Extend</div>
          <select v-model="extendTime">
            <option value="" disabled selected>Please Select</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="6">6</option>
          </select>
          <div>Hours</div>
          <Button theme="submit" @click="extendTimeClicked">Extend</Button>
        </div>
        <div class="extend-share-id-section">
          <Button theme="submit" @click="updateShareDetailsClicked">Update Share Details</Button>
        </div>
      </div>
      <div v-if="!loadingShareId" class="share-link">
        <div class="link">{{ shareLink }}</div>
        <Button class="copy-link" @click="copyLinkClicked">Copy Link</Button>
      </div>
    </template>
    <template v-slot:footer>
      <Button theme="submit" @click="showSharePopup = false">Ok</Button>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showNoti } from '../../js/helper';
import { useStore } from 'vuex';
import { get, post, put } from '../../js/apiCall';

const store = useStore();

//#region Data
const criteria = ref([]); // The list of criteria for the user building selection
const loadingCriteria = ref(false); // Set to true whenn loading the criteria from DB
const showSharePopup = ref(false); // To show the share popup
const loadingShareId = ref(false); // When generating the share id
const shareLink = ref(''); // The share link that has been generated
const linkSharedDetails = ref(null); // To show that the link has been share and if user wants to extend the time
const extendTime = ref(''); // The value that the user selected to extend the time
//#endregion Data

//#region Methods
const shareClicked = async () => {
  // Resetting all the values
  shareLink.value = '';
  linkSharedDetails.value = null;
  extendTime.value = '';

  // Showing the share popup
  showSharePopup.value = true;
  loadingShareId.value = true;

  // Check if link has been generated
  let previousShare = await get(`FormShare/CheckShared?user=${localStorage.getItem('user')}&client=${store.state.currentClient.client_uid}`);
  if (previousShare.length > 0) { // If the share id has been generated
    linkSharedDetails.value = previousShare[0];
    shareLink.value = previousShare[0].share_id;
  } else { // Generate a new share id
    // Generating the share link from the backend
    let url = `FormShare/GenerateShareId?client=${store.state.currentClient.client_uid}&page=BuildingSelection&user=${localStorage.getItem('user')}&expire=0.1`;
    let shareId = await post(url, criteria.value);
    shareLink.value = shareId;
  }

  loadingShareId.value = false;
}
const copyLinkClicked = () => {
  // Copying the sharelink to clipboard
  navigator.clipboard.writeText(shareLink.value);

  // Showing that the copy successful
  showNoti('Copied to clipboard!', 'success');
}
const extendTimeClicked = async () => {
  // Check if the extend time is selected
  if (extendTime.value) {
    loadingShareId.value = true;

    let newTime = await put(`FormShare/ExtendShareTime?id=${shareLink.value}&time=${extendTime.value}`);
    linkSharedDetails.value.expiry_datetime = newTime;

    loadingShareId.value = false;

    // Reset back the value of the extendtime
    extendTime.value = '';
  }
}
const updateShareDetailsClicked = async () => {
  // Update the json for the particular share id
  loadingShareId.value = true;

  await put(`FormShare/UpdateJson?id=${shareLink.value}`, criteria.value);

  loadingShareId.value = false;
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // The list of criteria, call from DB once backend done
  loadingCriteria.value = true;
  let benchmark = [];

  // Getting the benchmark for the user
  benchmark = await get(`BuildingBenchmark/GetAllBuildingBenchmarkByClientUid?client_uid=${store.state.currentClient.client_uid}`);
  // If user benchmark has not been saved, then get all the benchmark
  if (benchmark.length == 0) {
    // Get all the benchmark
    benchmark = await get('BuildingBenchmark/GetAllBuildingBenchmark');
  }

  // Mapping the benchmark details to the criteria object
  criteria.value = benchmark.map(b => ({
    criteria: b.benchmark_description,
    preference: '',
    weighting: '',
    remarks: ''
  }));
  loadingCriteria.value = false;
});
//#endregion Lifecycle
</script>

<style scoped>
.building-selection-main {
  display: flex;
  flex-direction: column;
}
.building-selection-main > :not(:first-child) {
  margin-top: 5px;
}
table {
  border-collapse: collapse;
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
.button-section {
  display: flex;
  column-gap: 5px;
  justify-content: flex-end;
}
.save-button {
  width: fit-content;
}
.share-link-popup-details {
  text-align: center;
}
.share-link {
  display: flex;
  column-gap: 5px;
  align-items: center;
  margin: 10px 0;
}
.share-link > .link {
  text-align: center;
  width: 100%;
  padding: 5px;
  border: 1px solid gray;
  border-radius: 10px;
}
.share-link > .copy-link {
  width: fit-content;
  white-space: nowrap;
}
.extend-share-id-section {
  display: flex;
  align-items: center;
  column-gap: 5px;
  justify-content: center;
  margin-top: 5px;
}
.extend-share-id-section > Button {
  width: fit-content;
}
.extend-share-id-section > select {
  padding: 5px;
}
.criteria-section {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
</style>