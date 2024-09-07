<!-- FIND [TOCHANGE] AND CHANGE ACCORDINGLY -->

<template>
  <div>Please select the dictionary that you would like to add, edit or remove.</div>
  <!-- [TOCHANGE] Using dropdown -->
  <select v-model="selectedDictionary">
    <option value="" disabled selected>Select Dictionary</option>
    <option v-for="(d,dInd) in dictionaryListing" :key="dInd" :value="d.value">{{ d.value }}</option>
  </select>
  <!-- [TOCHANGE] Using dropdown -->

  <div v-if="dictionaryLoading">Loading</div>
  <div v-else-if="dictionaryDetails.length > 0" class="details-main-container">
    <Button theme="submit" class="save-dictionary-button" @click="saveDictionaryClicked">Save {{ selectedDictionary }}</Button>
    <div v-for="(det, detInd) in dictionaryDetails" :key="detInd" class="details-container">
      <div class="details-key">{{ det.key }}</div>
      <Button theme="danger" @click="deleteItemClicked(detInd)">Delete</Button>
    </div>
    
    <div class="details-container">
      <!-- [TOCHANGE] Using input -->
      <input type="text" v-model="newDetails">
      <!-- [TOCHANGE] Using input -->
      <Button theme="submit" @click="addNewDetailsClicked">Add</Button>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

  //#region Data
  const dictionaryListing = ref([ // The list of the dictionary that user able to update [TOCHANGE] Using store
    { value: 'Space Requirement' },
    { value: 'Project Milestone' },
    { value: 'Building Selection' }
  ]);
  const selectedDictionary = ref(''); // The dictionary that has been selected
  const dictionaryLoading = ref(false); // When loading the dictionary from the DB
  const dictionaryDetails = ref([]); // The details of the dictionary from the DB
  const newDetails = ref(''); // The new details text that will be added
  //#endregion Data

  //#region Methods
  const loadDictionary = async () => {
    // Loading the dictionary from the DB based on the selected dictionary
    dictionaryLoading.value = true;
    await wait(500);
    // [TOCHANGE] Getting the details from DB
    dictionaryDetails.value = [
      { key: `${selectedDictionary.value} 1` },
      { key: `${selectedDictionary.value} 2` },
      { key: `${selectedDictionary.value} 3` },
      { key: `${selectedDictionary.value} 4` },
      { key: `${selectedDictionary.value} 5` }
    ];
    dictionaryLoading.value = false;
  }
  const addNewDetailsClicked = () => {
    // Checking if the new details is not filled in
    if (newDetails.value) {
      // Checking if the details are already in the list
      var hasIndex = dictionaryDetails.value.findIndex(det => det.key == newDetails.value);

      if (hasIndex >= 0) { // Found within the list
        // [TOCHANGE] Using noti
        alert(`${newDetails.value} is already in the list`);
      } else { // Not found within the list
        // [TOCHANGE] This to change to properly push
        dictionaryDetails.value.push({ key: newDetails.value });
  
        // Clearing the new details
        newDetails.value = '';
      }
    } else {
      // [TOCHANGE] Using noti
      alert('Please fill in the new details');
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
  // [TOCHANGE] To remove as this is using wait method
  const wait = (time) => {
    let res = null;
    let prom = new Promise(r => res = r);

    setTimeout(() => res(), time);

    return prom
  }
  // [TOCHANGE] To remove as this is using wait method
  //#endregion Methods

  //#region Watcher
  watch(selectedDictionary, (newVal) => {
    if (newVal) {
      loadDictionary();
    }
  })
  //#endregion Watcher
</script>

<style scoped>
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
</style>