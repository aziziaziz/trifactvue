<template>
  <div class="space-main">
    <Button v-if="!isLoading" class="save-space-button" theme="submit" @click="saveSpaceClicked" :loading="savingSpace">Save Space</Button>
    <div v-if="isLoading">Loading</div>
    <div v-else class="new-space-container">
      <Dropdown placeholder="Space unit" :items="unitListing" v-model:selected="selectedUnit" />
      <div>Contains of {{ currentSpaceDetails.length }} space{{ currentSpaceDetails.length > 1 ? 's' : '' }}</div>
      <div class="space-details-container" v-for="(space,spaceInd) in currentSpaceDetails" :key="spaceInd">
        <div class="space-description">
          <div>{{ space.description }}</div>
          <img @click="deleteSpaceDescription(spaceInd)" src="../../assets/delete.png" alt="">
        </div>
        <div class="space-count">
          <FormInput placeholder="Space Count" v-model:value="space.space_count" />
          <FormInput placeholder="Space Total Area" v-model:value="space.total_area" />
        </div>
        <div>{{ isNaN(Number(space.total_area) / Number(space.space_count)) ? 0 : roundNumber(Number(space.total_area) / Number(space.space_count), 2) }} {{ selectedUnit.acronym }} per {{ space.description }}</div>
      </div>
      <div v-if="remainingSpace.length > 0" class="space-details-container">
        <Dropdown placeholder="Space Decription" :items="remainingSpace" v-model:selected="newlySelectedSpace" :position="currentSpaceDetails.length > 1 ? 'top' : 'bottom'" />
        <Button theme="submit" @click="addNewSpaceClicked">Add Space</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { roundNumber, wait } from '../../js/helper';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { get } from '../../js/apiCall';

const store = useStore();
const router = useRouter();

//#region Data
const allSpaceDetails = ref([]); // All available space details
const remainingSpace = ref([]); // The remaining space that the user can choose to add
const currentSpaceDetails = ref([]); // The current selected space with the details
const unitListing = ref([]); // The value use to show in the dropdown for the available unit
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The default value of the unit
const newlySelectedSpace = ref(null); // The new space description to be added
const savingSpace = ref(false); // Loading when saving the space
const isLoading = ref(false); // Used when loading the space requirements from the DB
//#endregion Data

//#region Methods
const addNewSpaceClicked = () => { // When adding a new details to the space
  currentSpaceDetails.value.push({
    name: newlySelectedSpace.value, count: '', totalSpace: ''
  });

  newlySelectedSpace.value = null;

  getRemainingSpace();
}
const deleteSpaceDescription = (ind) => {
  currentSpaceDetails.value.splice(ind, 1);
  getRemainingSpace();
}
const getRemainingSpace = () => {
  remainingSpace.value = allSpaceDetails.value.filter(s => !currentSpaceDetails.value.find(c => s.value == c.description));
}
const saveSpaceClicked = async () => {
  // Simulate saving
  savingSpace.value = true;
  await wait(1000);
  savingSpace.value = false;

  // Update the store
  store.commit('updateLocation', {
    location: store.state.currentClient.location,
    description: currentSpaceDetails.value
  });
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Getting the space details and unitlisting from the store
  allSpaceDetails.value = store.state.spaceListing;
  unitListing.value = store.state.unitListing;

  // Populating value so that it will be available in the dropdown
  allSpaceDetails.value.forEach(s => s.value = s.space_description);

  if (store.state.currentClient) {
    // Loading the client space requirements from the DB
    currentSpaceDetails.value = await get(`Space/SpaceRequirements?client_uid=${store.state.currentClient.client_uid}`);
    isLoading.value = false;

    selectedUnit.value = unitListing.value.find(u => u.acronym == store.state.currentClient.sqm_sqft);

    getRemainingSpace();
  } else {
    router.push('/Home?choose');
  }
});
//#endregion Lifecycle
</script>

<style scoped>
.space-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.space-details-container {
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
}
.save-space-button {
  width: fit-content;
  align-self: flex-end;
}
.space-count {
  display: flex;
  align-items: center;
  column-gap: 10px;
}
.space-count > :first-child {
  width: 40%;
}
.space-count > :not(:first-child) {
  margin-top: 5px;
}
.new-space-container {
  margin-top: 5px;
  max-height: 100%;
  min-height: 90%;
  overflow: auto;
}
.new-space-container > :not(:first-child), .space-details-container > :not(:first-child) {
  margin-top: 5px;
}
.space-description {
  display: flex;
  align-items: center;
}
.space-description > div {
  font-weight: bold;
  font-size: 1.1em;
  width: 100%;
}
.space-description > img {
  height: 20px;
  cursor: pointer;
}
</style>