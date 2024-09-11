<template>
  <div class="building-dev-main">
    <div class="load-create-container">
      <div class="load-create-button" @click="loadMode = true">Load Developer</div>
      <div class="load-create-button" @click="loadMode = false">Create New Developer</div>
      <div :class="[ { 'load-create-switch-create': !loadMode }, 'load-create-switch' ]"></div>
    </div>
    
    <div v-if="loadMode" class="load-mode-section">
      <Dropdown placeholder="Developer" />
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
              <div>{{ crit.benchmark_description }}</div>
              <input type="text" placeholder="Remarks" v-model="crit.remarks">
            </div>
          </td>
          <td><input type="text" v-model="crit.user_preference"></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { get, put } from '../../js/apiCall';
import { showNoti } from '../../js/helper';

const store = useStore();

//#region Data
const loadMode = ref(true); // By default it will show the page as the load mode where the user needs to select the developer from the dropdown, it set to false, it will be a create mode where user will create a new developer
const devName = ref(''); // The developer name when creating the developer
const devUnit = ref(null); // The developer unit selection when creating the developer
const allCriterias = ref([]); // The list of criterias
// const originalCriteria = ref([]); // The list of the original criteria for comparing
const loadingCriteras = ref(false); // The loading of the criterias
const savingCriteria = ref(false); // To show loading when saving the criteria
//#endregion Data

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
  allCriterias.value.forEach(c => c.value = c.benchmark_description);

  loadingCriteras.value = false;
}
const saveAndShareClicked = () => {
  showNoti('Button is not ready.', 'warning');
}
const saveClicked = async () => {
  if (loadMode.value) {
    // When updating a current developer
    showNoti('Updating current developer is not yet ready.', 'warning');
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
//#endregion Methods
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
</style>