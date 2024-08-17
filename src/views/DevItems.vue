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

    <div :class="['dev-items', { 'dev-items-completed': dev.completedDate }]" v-for="(dev,devInd) in devItems" :key="devInd">
      <div class="dev-item-assigned">
        <div>{{ dev.assignedTo }}</div>
        <div>{{ dev.assignedDate }}</div>
      </div>
      <div>{{ dev.description }}</div>
      <div class="completed-date">{{ dev.completedDate }}</div>
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
import { onMounted, ref } from 'vue';
import { get } from '../js/apiCall';
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
const selectedStatusFilter =ref(null); // Used for the selected status of the filter
//#endregion Data

//#region Methods
const addItemClicked = () => {
  // Only add the item if the developer is selected and the description is filled in
  if (selectedDev.value && itemDescription.value) {
    // Adding into the devitems obj
    fullDevItems.value.push({
      assignedTo: selectedDev.value.value,
      description: itemDescription.value,
      assignedDate: dateFormat(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      completedDate: ''
    });

    // Close the popup
    addItemPopup.value = false;
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
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Getting the data of the pending items
  fullDevItems.value = await get('SaveDevItems/GetDevItems');
  devItems.value = JSON.parse(JSON.stringify(fullDevItems.value));
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
</style>