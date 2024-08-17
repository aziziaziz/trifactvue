<template>
  <div class="dev-main">
    <Button class="add-item-button" theme="submit" @click="addNewItemClicked">+</Button>

    <h1>Dev Pending Items</h1>
    <div>Below are the items that are pending from each of the developer.</div>
    <div>Please update where necessary.</div>
    <div>This will be our tracker.</div>

    <div class="filter-section">
      <div class="filter-with-clear">
        <div>Filter: </div>
        <img v-if="selectedAssignFilter || selectedStatusFilter" class="clear-filter-img" src="../assets/delete.png" alt="" height="20" @click="clearFilterClicked">
      </div>
      <Dropdown placeholder="Assigned To" :items="developers" v-model:selected="selectedAssignFilter" />
      <Dropdown placeholder="Status" :items="statusListing" v-model:selected="selectedStatusFilter" />
    </div>

    <div class="filter-text">
      <div>Found total of {{ devItems.length }} items. ({{ devItems.filter(d => !d.completedDate).length }} Pending, {{ devItems.filter(d => d.completedDate).length }} Completed) {{ getFilter() }}</div>
      <Button theme="submit" @click="saveItems" :loading="isSaving">Save</Button>
    </div>

    <div v-if="isLoading">Loading</div>
    <div :class="['dev-items', { 'dev-items-completed': dev.completedDate }]" v-for="(dev,devInd) in devItems" :key="devInd">
      <div class="dev-item-assigned">
        <div>{{ dev.assignedTo }}</div>
        <div>{{ dateFormat(new Date(dev.assignedDate), 'dd/MM/yyyy HH:mm:ss') }}</div>
      </div>
      <div class="description-section">
        <div>{{ dev.description }}</div>
        <label :for="`isCompleted${devInd}`">Completed</label>
        <input :id="`isCompleted${devInd}`" type="checkbox" :checked="dev.completedDate != ''" @change="markCompleted(devInd)">
      </div>
      <div class="completed-date" v-if="dev.completedDate">{{ dateFormat(new Date(dev.completedDate), 'dd/MM/yyyy HH:mm:ss') }}</div>
    </div>

    <Popup :show="addItemPopup" fullscreen>
      <template v-slot:header>Add Dev Item</template>
      <template v-slot:content>
        <br><br>
        <Dropdown placeholder="Assign To" :items="developers" v-model:selected="selectedDev" />
        <br>
        <div>Description</div>
        <textarea class="description-text" rows="5" v-model="itemDescription"></textarea>
        <br><br>
      </template>
      <template v-slot:footer>
        <div class="add-item-buttons">
          <Button theme="submit" @click="addItemClicked">Add</Button>
          <Button theme="danger" @click="addItemPopup = false">Cancel</Button>
        </div>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { get, put } from '../js/apiCall';
import { dateFormat } from '../js/helper';

//#region Data
const fullDevItems = ref([]); // The original items that gotten from backend
const devItems = ref([]); // The dev items that will be shown
const addItemPopup = ref(false); // Use to show or hide the popup when adding item
const developers = ref([ // The names of the developers that the assigned to can be
  { value: 'Azizi' },
  { value: 'Samuel' },
  { value: 'Shern Wei' }
]);
const selectedDev = ref(null); // Used for the selected developer
const itemDescription = ref(''); // Used for the description to add for the developer
const selectedAssignFilter = ref(null); // Used for the selected assigned to filter
const statusListing = ref([{ value: 'Pending' }, { value: 'Completed' }]); // Use to show the list of available status
const selectedStatusFilter = ref(null); // Used for the selected status of the filter
const isSaving = ref(false); // To show the button loading when saving
const isLoading = ref(false); // To show the loading text when loading the dev items from backend
//#endregion Data

//#region Methods
const addItemClicked = () => {
  // Only add the item if the developer is selected and the description is filled in
  if (selectedDev.value && itemDescription.value) {
    // Adding into the devitems obj
    fullDevItems.value.push({
      assignedTo: selectedDev.value.value,
      description: itemDescription.value,
      assignedDate: new Date(),
      completedDate: ''
    });

    // Close the popup
    addItemPopup.value = false;

    // Filter the items based on the filter
    filterItems();
  }
}
const addNewItemClicked = () => {
  // Clear the previous values
  selectedDev.value = null;
  itemDescription.value = '';

  // Show the popup
  addItemPopup.value = true;
}
const clearFilterClicked = () => {
  // Clearing the selected for teh filter items
  selectedAssignFilter.value = null;
  selectedStatusFilter.value = null;

  // Filter the items
  filterItems();
}
const filterItems = () => {
  // Set the devitems to full first
  devItems.value = JSON.parse(JSON.stringify(fullDevItems.value));
  // Filter based on the selected developer or status
  if (selectedAssignFilter.value || selectedStatusFilter.value) {
    // Check on which filter is not empty
    if (selectedAssignFilter.value) {
      devItems.value = devItems.value.filter(d => d.assignedTo == selectedAssignFilter.value.value);
    }

    if (selectedStatusFilter.value) {
      // Filter based on pending ot completed
      if (selectedStatusFilter.value.value == 'Pending') {
        devItems.value = devItems.value.filter(d => !d.completedDate);
      } else if (selectedStatusFilter.value.value == 'Completed') {
        devItems.value = devItems.value.filter(d => d.completedDate);
      }
    }
  }

  // Sorting based on the latest on top
  devItems.value = devItems.value.sort((a,b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
}
const markCompleted = (ind) => {
  // Get the current date
  let currentDate = new Date();
  // Check if the completed date is null or not
  let changeToComplete = devItems.value[ind].completedDate;
  // Get the index in the full items
  let index = fullDevItems.value.findIndex(f => JSON.stringify(f) == JSON.stringify(devItems.value[ind]));

  // Set the completed date for dev items
  devItems.value[ind].completedDate = changeToComplete ? '' : currentDate;
  if (index >= 0) {
    fullDevItems.value[index].completedDate = changeToComplete ? '' : currentDate;
  }
}
const getFilter = () => {
  if (selectedAssignFilter.value && selectedStatusFilter.value) {
    return `[Filter: ${selectedAssignFilter.value.value}, ${selectedStatusFilter.value.value}]`;
  } else if (selectedAssignFilter.value) {
    return `[Filter: ${selectedAssignFilter.value.value}]`;
  } else if (selectedStatusFilter.value) {
    return `[Filter: ${selectedStatusFilter.value.value}]`;
  }
}
const saveItems = async () => {
  // Save to backend
  isSaving.value = true;
  await put('SaveDevItems/SaveDevItems', fullDevItems.value);
  isSaving.value = false;
}
//#endregion Methods

//#region Watcher
watch(selectedAssignFilter, (val) => {
  // Only filter the items when the value is not null
  if (val) {
    filterItems();
  }
})
watch(selectedStatusFilter, (val) => {
  // Only filter the items when the value is not null
  if (val) {
    filterItems();
  }
})
//#endregion Watcher

//#region Lifecycle
onMounted(async () => {
  // Getting the data of the pending items
  isLoading.value = true;
  fullDevItems.value = await get('SaveDevItems/GetDevItems');
  devItems.value = JSON.parse(JSON.stringify(fullDevItems.value));
  isLoading.value = false;
});
//#endregion Lifecycle
</script>

<style scoped>
.dev-main {
  width: 100vw;
  padding: 10px;
}
.dev-items {
  border: 1px solid gray;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
  border: 1px solid goldenrod;
  background-color: rgba(218,165,32,0.1);
}
.dev-items-completed {
  border: 1px solid limegreen;
  background-color: rgba(0,128,0,0.1);
}
.dev-items > :not(:first-child) {
  margin-top: 5px;
}
.dev-item-assigned {
  display: flex;
  align-items: center;
}
.dev-item-assigned > :first-child {
  width: 100%;
  font-weight: bold;
  font-size: 1.25em;
}
.dev-item-assigned > :nth-child(2), .completed-date {
  white-space: nowrap;
  font-size: 0.75em;
}
.completed-date {
  color: green;
}
.add-item-button {
  position: fixed;
  top: 10px;
  right: 10px;
  min-height: 30px;
  max-height: 30px;
  min-width: 30px;
  max-width: 30px;
  padding: 0;
  width: fit-content;
  border-radius: 100%;
  font-size: 1.5em;
  font-weight: bold;
}
.add-item-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-item-buttons > Button {
  margin-top: 5px;
  width: 100%;
  max-width: 300px;
}
.description-text {
  resize: none;
  width: 100%;
  border: 1px solid lightgray;
  border-radius: 5px;
  padding: 5px;
}
.description-text:focus {
  outline: none;
}
.filter-section {
  display: flex;
  align-items: center;
  border: 1px solid gray;
  margin: 10px 0;
  border-radius: 10px;
  column-gap: 10px;
  padding: 10px;
}
.filter-with-clear {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.clear-filter-img {
  cursor: pointer;
}
.description-section {
  display: flex;
  align-items: flex-start;
}
.description-section > :first-child {
  width: 100%;
  padding-right: 10px;
  white-space: pre-wrap;
}
.filter-text {
  display: flex;
  align-items: center;
}
.filter-text > :first-child {
  width: 100%;
}
.filter-text > :nth-child(2) {
  width: fit-content;
}
</style>