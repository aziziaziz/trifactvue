<template>
  <div class="building-dev-main">
    <FormInput placeholder="Developer name" v-model:value="devName" :disabled="currentCriteria.length > 0" />
    <Button class="generate-criteria-button" @click="generateFormClicked">Generate Form</Button>

    <Loader v-if="loadingCriteras" text="Loading Criterias" />
    <div v-else-if="currentCriteria.length > 0" class="criteria-listing-container">
      <div class="save-criteria-buttons">
        <Button @click="saveAndShareClicked">Save & Share</Button>
        <Button theme="submit" @click="saveClicked">Save</Button>
      </div>
      <table>
        <tr>
          <th>Criteria</th>
          <th>Value</th>
        </tr>
        <tr v-for="(crit,critInd) in currentCriteria" :key="critInd">
          <td>
            <div class="criteria-section">
              <div>{{ crit.benchmark_description }}</div>
              <input type="text" placeholder="Remarks" v-model="crit.remarks">
            </div>
          </td>
          <td><input type="text" v-model="crit.user_preference"></td>
        </tr>
      </table>

      <div class="available-criteria-container">
        <Dropdown :items="availableCriterias" placeholder="Criteria" v-model:selected="selectedCriteria" />
        <Button theme="submit" @click="addCriteriaClicked">Add Criteria</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { get } from '../../js/apiCall';
import { showNoti } from '../../js/helper';

//#region Data
const devName = ref(''); // The developer name
const allCriterias = ref([]); // The list of criterias
const currentCriteria = ref([]); // The list of the current criterias
// const originalCriteria = ref([]); // The list of the original criteria for comparing
const loadingCriteras = ref(false); // The loading of the criterias
const availableCriterias = ref([]); // The available criterias in the dropdown
const selectedCriteria = ref(null); // The selected criteria when add
//#endregion Data

//#region Methods
const generateFormClicked = async () => {
  // Checking if the developer name is filled in
  if (devName.value) {
    // Getting the all the criterias
    loadingCriteras.value = true;
    allCriterias.value = await get('BuildingBenchmark/GetAllBuildingBenchmark');
    // Adding value key to all the criterias
    allCriterias.value.forEach(c => c.value = c.benchmark_description)
    
    // First time, to get the top 5 criterias only
    currentCriteria.value = allCriterias.value.slice(0, 5);
    
    // Assigning for the dropdown listing
    availableCriterias.value = allCriterias.value.slice(5);

    loadingCriteras.value = false;
  } else {
    // Show noti that the developer name is empty
    showNoti('Developer name cannot be empty.', 'error');
  }
}
const addCriteriaClicked = () => {
  // Checkinng if the selected criteria is selected
  if (selectedCriteria.value) {
    // Get the selected index
    let index = availableCriterias.value.findIndex(a => a.benchmark_uid == selectedCriteria.value.benchmark_uid);
    // Removing from the available listing
    availableCriterias.value.splice(index, 1);

    // Adding into the current listing
    currentCriteria.value.push(selectedCriteria.value);

    // Clear the selected criteria
    selectedCriteria.value = null;
  } else {
    // Show noti that the criteria is not selected
    showNoti('Please select a criteria.', 'error');
  }
}
const saveAndShareClicked = () => {
  showNoti('Button is not ready.', 'warning');
}
const saveClicked = async () => {
  // Preparing the object to post
  let objToPost = currentCriteria.value.map(c => {
    return {
      action: 'I',
      developer_uid: 1,
      benchmark_uid: c.benchmark_uid,
      unit: 'sqft',
      description: c.benchmark_description,
      user_preference: c.value,
      weightage: 0
    };
  });

  console.log(objToPost);
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
</style>