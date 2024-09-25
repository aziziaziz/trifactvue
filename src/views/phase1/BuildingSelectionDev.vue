<template>
  <Loader v-if="loadingAllDeveloper" text="Loading Developers" />

  <div v-else class="building-dev-main">
    <div class="load-create-container">
      <div class="load-create-button" @click="changePageType(true)">Load Developer</div>
      <div class="load-create-button" @click="changePageType(false)">Create New Developer</div>
      <div :class="[ { 'load-create-switch-create': !loadMode }, 'load-create-switch' ]"></div>
    </div>
    
    <div v-if="loadMode" class="load-mode-section">
      <Dropdown placeholder="Developer" :items="allDevelopers" v-model:selected="selectedDeveloper" />
      <Dropdown v-if="selectedDeveloper" :items="store.state.unitListing" placeholder="Unit" v-model:selected="devUnit" />
    </div>
    <div v-else class="create-mode-section">
      <FormInput placeholder="Developer name" v-model:value="devName" :disabled="allCriterias.length > 0" />
      <Dropdown :items="store.state.unitListing" placeholder="Unit" v-model:selected="devUnit" />
      <Button class="generate-criteria-button" @click="generateFormClicked">Generate Form</Button>
    </div>

    <Loader v-if="loadingCriteras" text="Loading Criterias" />
    <div v-else-if="allCriterias.length > 0" class="criteria-listing-container">
      <div class="save-criteria-buttons">
        <Button @click="saveAndShareClicked">Save & Share</Button>
        <Button theme="submit" @click="saveClicked" :loading="savingCriteria">Save</Button>
      </div>
      <table>
        <tr>
          <th>Criteria</th>
          <th>Value</th>
        </tr>
        <tr v-for="(crit,critInd) in allCriterias" :key="critInd">
          <td>
            <div class="criteria-section">
              <div>{{ crit.description }}</div>
              <input type="text" placeholder="Remarks" v-model="crit.remarks">
            </div>
          </td>
          <td><input type="text" v-model="crit.user_preference"></td>
        </tr>
      </table>
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
import { onMounted, ref, watch, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { get, put, post } from '../../js/apiCall';
import { showNoti, compareData, buildSignalR, hubDetails } from '../../js/helper';

const store = useStore();

//#region Data
const loadMode = ref(true); // By default it will show the page as the load mode where the user needs to select the developer from the dropdown, it set to false, it will be a create mode where user will create a new developer
const devName = ref(''); // The developer name when creating the developer
const devUnit = ref(null); // The developer unit selection when creating the developer
const allCriterias = ref([]); // The list of criterias
const originalCriterias = ref([]); // The original critierias when loading the details for the developer
const loadingCriteras = ref(false); // The loading of the criterias
const savingCriteria = ref(false); // To show loading when saving the criteria
const allDevelopers = ref([]); // The list of the developers
const loadingAllDeveloper = ref(false); // When loading all the developers
const selectedDeveloper = ref(null); // The selected developer
const showSharePopup = ref(false); // The data to use to show the share popup
const loadingShareId = ref(false); // When loading the share id
const shareId = ref(''); // The share id
const linkSharedDetails = ref(null); // The share details
const extendTime = ref(''); // How long the share time to be extend
const signalHub = ref(null); // The connection to the signalR
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
const generateFormClicked = async () => {
  // Checking if the developer name is filled in
  if (!devName.value) {
    // Show error noti
    showNoti('Developer name cannot be empty.', 'error');
    return;
  }
  // Checking if the developer unit is empty
  if (!devUnit.value) {
    // Show error noti
    showNoti('Developer unit must be selected.', 'error');
    return;
  }

  // Getting the all the criterias
  loadingCriteras.value = true;
  allCriterias.value = await get('BuildingBenchmark/GetAllBuildingBenchmark');
  // Adding value key to all the criterias
  allCriterias.value = allCriterias.value.map(c => ({
    action: null,
    developer_uid: null,
    benchmark_uid: c.benchmark_uid,
    unit: devUnit.value.acronym,
    description: c.benchmark_description,
    user_preference: '',
    weightage: 0
  }));

  loadingCriteras.value = false;
}
const saveAndShareClicked = async () => {
  // Show the share popup
  showSharePopup.value = true;
  loadingShareId.value = true;

  // First save the details first, then generate the share link
  await saveClicked();
  await shareClicked();

  // Hide the loading
  loadingShareId.value = false;
}
const saveClicked = async () => {
  if (loadMode.value) {
    // Getting the difference
    let objToPost = compareData(originalCriterias, allCriterias, 'benchmark_uid');
    
    // Updating the developer
    savingCriteria.value = true;
    let updateResult = await put(`BuildingBenchmark/UpdateDeveloperBuildingBenchmark?username=${localStorage.getItem('user')}`, objToPost);
    savingCriteria.value = false;

    // Checking for the result
    if (updateResult) {
      // Save successful
      showNoti('Successfully updated the developer.', 'success');
    } else {
      // Save failed
      showNoti('There was an error occured while updating the developer. Please try again.', 'error');
    }
  } else {
    // Preparing the object to post for new developer
    let objToPost = allCriterias.value.map(c => {
      return {
        action: 'I',
        developer_uid: 0,
        benchmark_uid: c.benchmark_uid,
        unit: devUnit.value.acronym,
        description: c.benchmark_description,
        user_preference: '',
        weightage: 0
      };
    });

    // Calling the API to insert the new developer
    savingCriteria.value = true;
    let insertResult = await put(`BuildingBenchmark/UpdateDeveloperBuildingBenchmark?username=${localStorage.getItem('user')}&developerName=${devName.value}`, objToPost);
    savingCriteria.value = false;
    
    // Checking for the result
    if (insertResult) {
      // Save successful
      showNoti('Successfully saved your new developer.', 'success');
    } else {
      // Save failed
      showNoti('There was an error occured while saving your new developer. Please try again.', 'error');
    }
  }
}
const changePageType = (isLoadMode) => {
  // Changing the load mode
  loadMode.value = isLoadMode;
}
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
    // await updateShareDetailsClicked();
  } else { // Generate a new share id
    // Generating the share link from the backend
    let url = `FormShare/GenerateShareId?client=${store.state.currentClient.client_uid}&page=BuildingSelectionDeveloper&user=${localStorage.getItem('user')}&expire=0.1`;
    let shareIdResult = await post(url, allCriterias.value);
    shareId.value = shareIdResult;
  }

  loadingShareId.value = false;
}
const linkClicked = () => {
  window.open(shareLink.value, '_blank');
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

    // Show noti that it ihas been extended
    showNoti('Time has been extended', 'success');
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Build and connect to signalr
  if (!signalHub.value) {
    signalHub.value = buildSignalR(hubDetails.BUILDINGHUBNAME);
    signalHub.value.start();
  }

  // Loading the list of the developers
  loadingAllDeveloper.value = true;
  let developers = await get('BuildingBenchmark/GetAllDevelopers');
  // Setting the value so that it will show in the dropdown
  developers.forEach(d => d.value = d.developer_name);

  // Assigning the developers to the developer item for the dropdown
  allDevelopers.value = developers;

  loadingAllDeveloper.value = false;
});
onBeforeUnmount(() => {
  // Stop the hub connection
  if (signalHub.value) {
    signalHub.value.stop();
  }
});
//#endregion Lifecycle

//#region Watcher
watch(selectedDeveloper, async (dev) => {
  // Getting the developer details
  loadingCriteras.value = true;
  let criterias = await get(`BuildingBenchmark/GetAllDeveloperBuldingBenchmarkByDeveloperId?develop_uid=${dev.developer_uid}`);
  allCriterias.value = criterias;
  // Setting up the original criterias
  originalCriterias.value = JSON.parse(JSON.stringify(allCriterias.value));
  
  // Setting the selected unit
  devUnit.value = store.state.unitListing.find(u => u.acronym == allCriterias.value[0].unit);

  loadingCriteras.value = false;
})
//#endregion Watcher
</script>

<style scoped>
.building-dev-main, .criteria-listing-container {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
.generate-criteria-button, .save-criteria-buttons > Button {
  width: fit-content;
}
.save-criteria-buttons {
  display: flex;
  column-gap: 5px;
  justify-content: flex-end;
}
.criteria-listing-container {
  border-top: 2px solid gray;
  padding-top: 5px;
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
.criteria-section {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
.available-criteria-container {
  padding: 5px;
  border: 1px solid gray;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 5px;
}
.available-criteria-container > Button {
  max-width: 150px;
}
.load-create-container {
  display: flex;
  column-gap: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px gray;
  width: fit-content;
  position: relative;
}
.load-create-button {
  max-width: 200px;
  min-width: 200px;
  padding: 10px;
  text-align: center;
  z-index: 3;
  cursor: pointer;
}
.load-create-switch {
  position: absolute;
  left: 0;
  z-index: 2;
  background-color: rgba(68,188,98,0.6);
  max-width: 200px;
  min-width: 200px;
  height: 100%;
  border-radius: 5px;
  transition: 0.3s;
  transform: translateX(0);
}
.load-create-switch-create {
  transform: translateX(calc(100% + 10px));
}
.load-mode-section, .create-mode-section {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
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
</style>