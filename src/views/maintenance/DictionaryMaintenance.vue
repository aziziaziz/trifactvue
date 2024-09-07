<template>
  <Loader v-if="allDictionaryLoading" text="Loading All Dictionaries" />
  <div v-else class="dictionary-main">
    <Dropdown :items="dictionaryListing" placeholder="Please select the dictionary that you would like to add, edit or remove." v-model:selected="selectedDictionary" />

    <Loader v-if="dictionaryLoading" text="Loading Dictionary Details" />
    <div v-else-if="dictionaryDetails.length > 0" class="details-main-container">
      <Button theme="submit" class="save-dictionary-button" @click="saveDictionaryClicked">Save {{ selectedDictionary.value }}</Button>
      <div v-for="(det, detInd) in dictionaryDetails" :key="detInd" class="details-container">
        <div class="details-key">{{ det.key }}</div>
        <Button class="dd-button" theme="danger" @click="deleteItemClicked(detInd)">Delete</Button>
      </div>
      
      <div class="details-container">
        <Input placeholder="New Item" v-model:value="newDetails" />
        <Button class="dd-button" theme="submit" @click="addNewDetailsClicked">Add</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { get } from '../../js/apiCall';
import { showNoti } from '../../js/helper';

//#region Data
const allDictionaryLoading = ref(false); // When loading all the dictionaries
const dictionaryListing = ref([]); // The list of available dictionary
const selectedDictionary = ref(null); // The dictionary that has been selected
const dictionaryLoading = ref(false); // When loading the dictionary from the DB
const dictionaryDetails = ref([]); // The details of the dictionary from the DB
const originalDictionaryDetails = ref([]); // The original dictionary details
const detailsKeyName = ref(''); // The key of the description
const newDetails = ref(''); // The new details text that will be added
//#endregion Data

//#region Methods
const loadDictionary = async () => {
  // Loading the dictionary from the DB based on the selected dictionary
  dictionaryLoading.value = true;
  let details = await get(`Dictionary/GetDictionaryDetails?name=${selectedDictionary.value.value}`);

  // Checking if the details length is more than 0
  if (details.length > 0) {
    // Check for the interface (UI) value to show the UI (1 being the default UI)
    if (selectedDictionary.value.interface == 1) {
      // Get the keyname and assign to key for the description
      detailsKeyName.value = Object.keys(details[0]).find(k => k.includes('description'));
      details.forEach(d => d.key = d[detailsKeyName.value]);

      // Set to the details and ori details
      dictionaryDetails.value = JSON.parse(JSON.stringify(details));
      originalDictionaryDetails.value = JSON.parse(JSON.stringify(details));
    }
  } else {
    // Clear the dictionary details if not found from the DB
    dictionaryDetails.value = [];
    originalDictionaryDetails.value = [];
    detailsKeyName.value = '';
  }

  // Close the loading
  dictionaryLoading.value = false;
}
const addNewDetailsClicked = () => {
  // Checking if the new details is not filled in
  if (newDetails.value) {
    // Checking if the details are already in the list
    var hasIndex = dictionaryDetails.value.findIndex(det => det.key == newDetails.value);

    if (hasIndex >= 0) { // Found within the list
      showNoti(`${newDetails.value} is already in the list`, 'warning');
    } else { // Not found within the list
      // Push with the details key name
      let objToAdd = {
        key: newDetails.value
      };
      objToAdd[detailsKeyName.value] = newDetails.value;
      dictionaryDetails.value.push(objToAdd);

      // Clearing the new details
      newDetails.value = '';
    }
  } else {
    // Show error when pressing add without anything
    showNoti('Please fill in the new details', 'error');
  }
}
const saveDictionaryClicked = () => {
  // Get the compared values from helper
  // [TOCHANGE] To change and call the API to save
}
const deleteItemClicked = (ind) => {
  // Remove from the dictionary details
  dictionaryDetails.value.splice(ind, 1);
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Get all the available dictionaries
  allDictionaryLoading.value = true;
  let dictionaries = await get('Dictionary/GetAllDictionaries');

  // Reformat to have the value
  dictionaryListing.value = dictionaries.map(d => {
    d.value = d.table_description;
    return d;
  });

  allDictionaryLoading.value = false;
})
//#endregion Lifecycle

//#region Watcher
watch(selectedDictionary, (newVal) => {
  if (newVal) {
    loadDictionary();
  }
})
//#endregion Watcher
</script>

<style scoped>
.dictionary-main {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
.details-main-container {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  margin-top: 5px;
}
.details-container {
  border-radius: 5px;
  border: 1px solid gray;
  display: flex;
  align-items: center;
  padding: 5px;
  column-gap: 5px;
}
.details-key {
  width: 100%;
}
.save-dictionary-button {
  width: fit-content;
  align-self: flex-end;
}
.dd-button {
  width: fit-content;
}
</style>