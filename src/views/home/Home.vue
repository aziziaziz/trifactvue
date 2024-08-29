<template>
  <div class="home-container">
    <Button theme="submit" class="add-space-button" @click="addClientClicked" :disabled="store.state.spaceListing.length == 0">Add Client</Button>
    <Input placeholder="Search Client" />
    <div v-if="store.state.currentClient" class="space-details">
      <div class="space-title">✓ {{ store.state.currentClient.client_name }}</div>
    </div>
    <hr style="width: 100%">
    <div v-if="allClients.length > 0" class="space-container">
      <div class="space-details" v-for="(loc, locInd) in allClients" :key="locInd" @click="clientDetailsClicked(locInd)">
        <div class="space-title">{{ loc.client_name }}</div>
      </div>
    </div>
    <Loader v-else-if="clientLoading" text="Loading Clients" />

    <Popup :show="showAddClientPopup">
      <template v-slot:header>Add Client</template>
      <template v-slot:content>
        <div class="popup-content-container">
          <FormInput placeholder="Client name" v-model:value="clientName" :isRequired="true" v-model:errorMessage="clientNameError" />
          <Dropdown placeholder="Space unit" :items="unitList" v-model:selected="selectedUnit" position="top" />
        </div>
      </template>
      <template v-slot:footer>
        <div class="popup-button-section">
          <Button theme="submit" @click="saveClientClicked" :loading="savingClient">Save</Button>
          <Button theme="danger" @click="showAddClientPopup = false">Cancel</Button>
        </div>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { get, post } from '../../js/apiCall';

const store = useStore();

//#region Data
const allClients = ref([]); // The spaces that are available for the user
const clientLoading = ref(false); // Used to show the loading when loading the client from DB
const showAddClientPopup = ref(false); // Use to show the popup to add client
const clientName = ref(''); // Used when adding a new client
const clientNameError = ref(''); // Used to show the error of the client name
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The unit when adding new client, default to sqft
const unitList = ref([]); // The list of availale units
const savingClient = ref(false); // To show loading when saving the client
//#endregion Data

//#region Methods
const clientDetailsClicked = async (ind) => {
  // Check if currently client is selected and if it is, the need to add back into the client list
  if (localStorage.getItem('client')) {
    allClients.value.splice(ind, 0, JSON.parse(localStorage.getItem('client')));
    ind++;
  }

  // Get the client based on the index
  let client = allClients.value[ind];
  // Assign the client to the store and save in the localstorage
  store.state.currentClient = client;
  localStorage.setItem('client', JSON.stringify(client));

  // Remove the client from the full list and make it show at the top
  allClients.value.splice(ind, 1);
}
const addClientClicked = () => { // When adding a new client
  // Reset the values to default
  clientName.value = '';
  clientNameError.value = '';
  selectedUnit.value = { value: 'Square Feet (sqft)', acronym: 'sqft' };

  // To show the popup
  showAddClientPopup.value = true;
}
const saveClientClicked = async () => { // When a new client is saved
  // Checking if the client name is empty
  if (!clientName.value) {
    // Show the error message
    clientNameError.value = 'Client Name is required!';
    // Stop the method from going further
    return;
  }

  // Saving to DB
  let saveObj = {
    client_name: clientName.value,
    sqm_sqft: selectedUnit.value.acronym
  };
  savingClient.value = true;
  let saveClient = await post('Client/InsertClient', saveObj);

  if (saveClient.success) { // If saving the client success
    // Getting the first 3 of the spacelisting
    let defaultSpace = store.state.spaceListing.slice(0, 3);

    // Reformat to the value to post for the body
    let spaceToAdd = defaultSpace.map(s => ({
      client_uid: Number(saveClient.objectID),
      space_uid: Number(s.space_uid),
      sqm_sqft: selectedUnit.value.acronym,
      description: s.space_description,
      types: '',
      number_ranking: 0,
      space_count: 1,
      total_area: selectedUnit.value.acronym == 'sqft' ? 30 : 10,
      layout_selection: ''
    }));
    
    // Saving the space requirements
    await post(`Space/InsertSpaceRequirements?username=${localStorage.getItem('user')}`, spaceToAdd);
    savingClient.value = false;
    
    // Close the popup
    showAddClientPopup.value = false;
  
    // Gett all clients from the DB
    getAllClients();
  } else { // If saving the client failed
    console.error('Failed to save the client');
  }
}
const getAllClients = async () => {
  // Empty the clients first
  allClients.value = [];

  // Getting all the clients from the DB
  clientLoading.value = true;
  allClients.value = await get('Client/GetAllClient');
  clientLoading.value = false;

  // Checking if there is a client that is already selected
  if (localStorage.getItem('client')) {
    // Parse the client string from localstorage to object
    let savedClient = JSON.parse(localStorage.getItem('client'));

    // Get the index based on id
    let ind = allClients.value.findIndex(c => c.client_uid == savedClient.client_uid);
    // Remove from the main list
    allClients.value.splice(ind, 1);
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  unitList.value = store.state.unitListing;

  // Getting the clients from the DB
  getAllClients();
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
.popup-content-container > :not(:first-child) {
  margin-top: 5px;
}
.popup-button-section {
  display: flex;
  column-gap: 5px;
  width: 100%;
  align-items: center;
  justify-content: center;
}
.popup-button-section > Button {
  max-width: 150px;
}
</style>