<template>
  <div class="home-container">
    <Button theme="submit" class="add-space-button" @click="addLocationClicked">Add Location</Button>
    <Input placeholder="Search Location" />
    <div v-if="allLocations.length > 0" class="space-container">
      <div class="space-details" v-for="(loc, locInd) in allLocations" :key="locInd" @click="locationDetailsClicked(locInd)">
        <div class="space-title">{{ store.state.currentLocation ? (store.state.currentLocation.client_name == loc.client_name ? '✓' : '') : '' }} {{ loc.client_name }}</div>
      </div>
    </div>
    <div v-else-if="locationLoading">Loading Locations</div>


    <Popup :show="showAddLocationPopup">
      <template v-slot:header>Add Location</template>
      <template v-slot:content>
        <FormInput placeholder="Location name" v-model:value="locationName" />
        <Dropdown placeholder="Space unit" :items="unitList" v-model:selected="selectedUnit" position="top" />
      </template>
      <template v-slot:footer>
        <Button theme="submit" @click="saveLocationClicked" :loading="savingLocation">Save</Button>
        <Button theme="danger" @click="showAddLocationPopup = false">Cancel</Button>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { wait } from '../../js/helper';
import { get } from '../../js/apiCall';

const store = useStore();

//#region Data
const allLocations = ref([]); // The spaces that are available for the user
const locationLoading = ref(false); // Used to show the loading when loading the location from DB
const showAddLocationPopup = ref(false); // Use to show the popup to add location
const locationName = ref(''); // Used when adding a new location
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The unit when adding new location, default to sqft
const unitList = ref([]); // The list of availale units
const savingLocation = ref(false); // To show loading when saving the location
//#endregion Data

//#region Methods
const locationDetailsClicked = (ind) => {
  // Get the location based on the index
  let location = allLocations.value[ind];
  // Assign the location to the store
  store.state.currentLocation = location;
}
const addLocationClicked = () => { // When adding a new location
  // Reset the values to default
  locationName.value = '';
  selectedUnit.value = { value: 'Square Feet (sqft)', acronym: 'sqft' };

  // To show the popup
  showAddLocationPopup.value = true;
}
const saveLocationClicked = async () => { // When a new location is saved
  // Simulate saving
  savingLocation.value = true;
  await wait(1000);
  savingLocation.value = false;

  // Insert to store [Call Backend in future]
  store.commit('insertLocation', {
    location: locationName.value,
    unit: selectedUnit.value.acronym,
    description: []
  });
  showAddLocationPopup.value = false;

  // Get from store [Call backend]
  allLocations.value = [];
  locationLoading.value = true;
  await wait(1000);
  locationLoading.value = false;
  allLocations.value = store.state.allLocation;
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  unitList.value = store.state.unitListing;

  // Getting all the clients from the DB
  locationLoading.value = true;
  allLocations.value = await get('Client/GetAllClient');
  locationLoading.value = false;
});
//#endregion Lifecycle
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.add-space-button {
  width: fit-content;
  align-self: flex-end;
}
.space-container {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: auto;
  margin-top: 10px;
}
.space-details {
  display: flex;
  flex-direction: column;
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}
.space-details:not(:first-child) {
  margin-top: 10px;
}
.space-title {
  font-size: 1.2em;
  font-weight: bold;
}
.space-description-container {
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>