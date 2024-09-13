<template>
  <Loader v-if="loadingCriteria" text="Loading Criteria" />
  <div v-else class="building-selection-main">
    <div class="button-section">
      <Button class="save-button" @click="saveAndShareClicked">Save & Share</Button>
      <Button class="save-button" theme="submit" @click="saveClicked">Save</Button>
    </div>
    <div class="criteria-table-container">
      <table class="main-criteria-table">
        <tr>
          <th colspan="3">Client's Details</th>
        </tr>
        <tr>
          <th>Criteria</th>
          <th>Preference</th>
          <th>Weighting (1-10)</th>
        </tr>
        <tr v-for="(crit,critInd) in currentBenchmark" :key="critInd">
          <td>
            <div class="criteria-section">
              <div>{{ crit.description }}</div>
              <input type="text" placeholder="Remarks" v-model="crit.remarks">
            </div>
          </td>
          <td><input type="text" v-model="crit.user_preference"></td>
          <td><input type="text" v-model="crit.weightage"></td>
        </tr>
      </table>

      <div v-for="(dev,devInd) in currentDeveloper" :key="devInd">
        <table class="developer-table">
          <tr>
            <th colspan="2">
              <div class="developer-table-name">
                <div>{{ dev.developer.developer_name }}</div>
                <img class="developer-delete" src="../../assets/delete.png" @click="developerDeleteClicked(dev)" alt="">
              </div>
            </th>
          </tr>
          <tr>
            <th>Value</th>
            <th>Score</th>
          </tr>
          <tr v-for="(devCrit,devCritInd) in dev.criterias" :key="devCritInd">
            <td>{{ devCrit.user_preference }}</td>
            <td>{{ devCrit.score }}</td>
          </tr>
        </table>
      </div>

      <div v-if="showChooseDeveloper" class="developer-section">
        <Dropdown :items="allDevelopers" v-model:selected="selectedDeveloper" />
        <Button @click="confirmDeveloperClicked" :loading="choosingDeveloper">Choose Developer</Button>
      </div>

      <Button v-if="currentDeveloper.length < 5 && allDevelopers.length > 0" class="add-developer-button" @click="chooseDeveloperClicked">+</Button>
    </div>
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
      </div>
      <div v-if="!loadingShareId" class="share-link">
        <div class="link" @click="linkClicked">{{ shareLink }}</div>
        <Button class="copy-link" @click="copyLinkClicked">Copy Link</Button>
      </div>
    </template>
    <template v-slot:footer>
      <Button theme="submit" @click="showSharePopup = false">Ok</Button>
    </template>
  </Popup>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { showNoti, compareData, buildSignalR, hubDetails } from '../../js/helper';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { get, post, put } from '../../js/apiCall';

const store = useStore();
const router = useRouter();

//#region Data
const currentBenchmark = ref([]); // The list of criteria for the user building selection
const originalBenchmark = ref([]); // The original set of criteria from the DB for the client
const loadingCriteria = ref(false); // Set to true whenn loading the criteria from DB
const showSharePopup = ref(false); // To show the share popup
const loadingShareId = ref(false); // When generating the share id
const shareId = ref(''); // The share id that has been generated
const linkSharedDetails = ref(null); // To show that the link has been share and if user wants to extend the time
const extendTime = ref(''); // The value that the user selected to extend the time
const signalHub = ref(null); // The connection to the signalR
const showChooseDeveloper = ref(false); // This is when the dropdown for the developer is shown
const selectedDeveloper = ref(null); // The selected developer
const currentDeveloper = ref([]);
const allDevelopers = ref([]); // The list of all the developers
const choosingDeveloper = ref(false); // Loading when getting the developer details
//#endregion Data

//#region Computed
const shareLink = computed(() => { // The shareable link
  // Check if the share id has already been generated, if not, return empty string
  if (shareId.value) {
    return `${window.location.origin}/BuildingSelection/${shareId.value}`;
  } else {
    return '';
  }
});
//#endregion Computed

//#region Methods
const shareClicked = async () => {
  // Resetting all the values
  shareId.value = '';
  linkSharedDetails.value = null;
  extendTime.value = '';

  // Showing the share popup
  showSharePopup.value = true;
  loadingShareId.value = true;

  // Check if link has been generated
  let previousShare = await get(`FormShare/CheckShared?user=${localStorage.getItem('user')}&client=${store.state.currentClient.client_uid}`);
  if (previousShare.length > 0) { // If the share id has been generated
    linkSharedDetails.value = previousShare[0];
    shareId.value = previousShare[0].share_id;

    // Update the json details
    await updateShareDetailsClicked();
  } else { // Generate a new share id
    // Generating the share link from the backend
    let url = `FormShare/GenerateShareId?client=${store.state.currentClient.client_uid}&page=BuildingSelection&user=${localStorage.getItem('user')}&expire=0.1`;
    let shareIdResult = await post(url, currentBenchmark.value);
    shareId.value = shareIdResult;
  }

  loadingShareId.value = false;
}
const copyLinkClicked = () => {
  // Copying the shareId to clipboard
  navigator.clipboard.writeText(shareLink.value);

  // Showing that the copy successful
  showNoti('Copied to clipboard!', 'success');
}
const extendTimeClicked = async () => {
  // Check if the extend time is selected
  if (extendTime.value) {
    loadingShareId.value = true;

    let newTime = await put(`FormShare/ExtendShareTime?id=${shareId.value}&time=${extendTime.value}`);
    linkSharedDetails.value.expiry_datetime = newTime;

    // Invoke the signalr
    if (signalHub.value) {
      signalHub.value.invoke(hubDetails.BUILDINGEXTENDTIME, shareId.value);
    }

    loadingShareId.value = false;

    // Reset back the value of the extendtime
    extendTime.value = '';
  }
}
const updateShareDetailsClicked = async () => {
  // Update the json for the particular share id
  loadingShareId.value = true;

  await put(`FormShare/UpdateJson?id=${shareId.value}`, currentBenchmark.value);

  loadingShareId.value = false;
}
const saveClicked = async () => {
  // Show loading
  loadingShareId.value = true;

  // Get the data to post with action
  let benchmarkToPost = compareData(originalBenchmark, currentBenchmark, 'benchmark_uid');
  benchmarkToPost = benchmarkToPost.map(b => {
    let obj = JSON.parse(JSON.stringify(b));
    obj.weightage = obj.weightage ? Number(obj.weightage) : 0;
    return obj;
  });

  // Posting the data
  await put('BuildingBenchmark/UpdateClientBuildingBenchmark', benchmarkToPost);
  loadingShareId.value = false;
}
const saveAndShareClicked = async () => {
  // Show the popup
  showSharePopup.value = true;

  // Save the data first, then generate the share link
  await saveClicked();
  await shareClicked();
}
const linkClicked = () => {
  window.open(shareLink.value, '_blank');
}
const chooseDeveloperClicked = () => {
  // Show the dropdown
  showChooseDeveloper.value = true;
}
const confirmDeveloperClicked = async () => {
  // Checking if the developer is already selected
  if (selectedDeveloper.value) {
    choosingDeveloper.value = true;

    // Calling API to get the details of the developer
    let developerDetails = await get(`BuildingBenchmark/GetAllDeveloperBuldingBenchmarkByDeveloperId?develop_uid=${selectedDeveloper.value.developer_uid}`);
    developerDetails.forEach(d => d.score = '-');

    // Formatting the object
    let objToAdd = {
      developer: selectedDeveloper.value,
      criterias: developerDetails
    };

    // Push into the current developer list
    currentDeveloper.value.push(objToAdd);

    // Removing the selected from the list of all developers
    let selectedIndex = allDevelopers.value.findIndex(d => d.developer_uid == selectedDeveloper.value.developer_uid);
    if (selectedIndex >= 0) {
      allDevelopers.value.splice(selectedIndex, 1);
    }

    // Clear the dropdown
    selectedDeveloper.value = null;
    showChooseDeveloper.value = false;
    
    choosingDeveloper.value = false;
  } else {
    // Showing noti for developer is not selected
    showNoti('Please select a developer.', 'error');
  }
}
const developerDeleteClicked = (dev) => {
  // Get the index of the deleted developer
  let devInd = currentDeveloper.value.findIndex(d => d.developer.developer_uid == dev.developer.developer_uid);

  if (devInd >= 0) {
    // Insert back into all the developers
    allDevelopers.value.push(currentDeveloper.value[devInd].developer);
    // Removed from the current developer list
    currentDeveloper.value.splice(devInd, 1);
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Go to home page if there are no client selected
  if (!store.state.currentClient) {
    router.push('/Home?choose');
    return;
  }

  // The list of criteria, call from DB once backend done
  loadingCriteria.value = true;

  // Getting all the developers
  allDevelopers.value = await get('BuildingBenchmark/GetAllDevelopers');
  allDevelopers.value.forEach(d => d.value = d.developer_name);

  // Build and connect to signalr
  if (!signalHub.value) {
    signalHub.value = buildSignalR(hubDetails.BUILDINGHUBNAME);
    signalHub.value.start();
  }

  // Getting the benchmark for the user
  currentBenchmark.value = await get(`BuildingBenchmark/GetAllBuildingBenchmarkByClientUid?client_uid=${store.state.currentClient.client_uid}`);
  // If user benchmark has not been saved, then get all the benchmark
  if (currentBenchmark.value.length == 0) { // There are no saved data for the client
    // Get all the benchmark
    currentBenchmark.value = await get('BuildingBenchmark/GetAllBuildingBenchmark');
    // Mapping the details and setting the remarks
    currentBenchmark.value = currentBenchmark.value.map(b => ({
      client_uid: store.state.currentClient.client_uid,
      benchmark_uid: b.benchmark_uid,
      unit: store.state.currentClient.sqm_sqft,
      description: b.benchmark_description,
      user_preference: '',
      weightage: '',
      remarks: ''
    }));
    originalBenchmark.value = [];
  } else { // There is saved data for the client
    // Getting the last share id
    let lastId = await get(`FormShare/GetLastSharedId?user=${localStorage.getItem('user')}&client=${store.state.currentClient.client_uid}`);
    // Checking if the last id is not empty, means it has been previously shared (without checking expiry)
    if (lastId) {
      // Getting the shared details
      let details = await get(`FormShare/GetShareDetails?id=${lastId}`);
      // Setting the current benchmark from the JSON that have been saved
      currentBenchmark.value = details;
    } else {
      // Mapping the details and setting the remarks
      currentBenchmark.value = currentBenchmark.value.map(b => ({
        client_uid: b.client_uid,
        benchmark_uid: b.benchmark_uid,
        unit: b.unit,
        description: b.description,
        user_preference: b.user_preference,
        weightage: b.weightage == 0 ? '' : b.weightage,
        remarks: ''
      }));
    }

    originalBenchmark.value = JSON.parse(JSON.stringify(currentBenchmark.value));
  }

  loadingCriteria.value = false;
});
onBeforeUnmount(() => {
  // Stop the hub connection
  if (signalHub.value) {
    signalHub.value.stop();
  }
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
td {
  min-height: 60px;
  max-height: 60px;
  height: 60px;
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
  cursor: pointer;
  text-decoration: underline;
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
.criteria-table-container {
  display: flex;
  align-items: flex-start;
  column-gap: 5px;
}
.main-criteria-table {
  width: 100%;
}
.add-developer-button {
  width: fit-content;
}
.developer-section {
  display: flex;
  flex-direction: column;
  width: 200px;
  row-gap: 5px;
}
.developer-table {
  min-width: 200px;
}
.developer-table-name {
  display: flex;
  align-items: center;
  column-gap: 5px;
  justify-content: center;
}
.developer-delete {
  height: 15px;
  cursor: pointer;
}
</style>