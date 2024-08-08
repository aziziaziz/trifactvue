<template>
  <div class="home-container">
    <Button theme="submit" class="add-space-button" @click="addClientClicked" :disabled="store.state.spaceListing.length == 0">Add Client</Button>
    <Input placeholder="Search Client" />
    <div v-if="allClients.length > 0" class="space-container">
      <div class="space-details" v-for="(loc, locInd) in allClients" :key="locInd" @click="clientDetailsClicked(locInd)">
        <div class="space-title">{{ store.state.currentClient ? (store.state.currentClient.client_name == loc.client_name ? '✓' : '') : '' }} {{ loc.client_name }}</div>
      </div>
    </div>
    <div v-else-if="clientLoading">Loading Clients</div>


    <Popup :show="showAddClientPopup">
      <template v-slot:header>Add Client</template>
      <template v-slot:content>
        <FormInput placeholder="Client name" v-model:value="clientName" />
        <Dropdown placeholder="Space unit" :items="unitList" v-model:selected="selectedUnit" position="top" />
      </template>
      <template v-slot:footer>
        <Button theme="submit" @click="saveClientClicked" :loading="savingClient">Save</Button>
        <Button theme="danger" @click="showAddClientPopup = false">Cancel</Button>
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
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The unit when adding new client, default to sqft
const unitList = ref([]); // The list of availale units
const savingClient = ref(false); // To show loading when saving the client
//#endregion Data

//#region Methods
const clientDetailsClicked = (ind) => {
  // Get the client based on the index
  let client = allClients.value[ind];
  // Assign the client to the store
  store.state.currentClient = client;
}
const addClientClicked = () => { // When adding a new client
  // Reset the values to default
  clientName.value = '';
  selectedUnit.value = { value: 'Square Feet (sqft)', acronym: 'sqft' };

  // To show the popup
  showAddClientPopup.value = true;
}
const saveClientClicked = async () => { // When a new client is saved
  // Saving to DB
  let saveObj = {
    client_name: clientName.value,
    sqm_sqft: selectedUnit.value.acronym
  };
  savingClient.value = true;
  let saveClient = await post('Client/InsertClient', saveObj);
  savingClient.value = false;

  if (saveClient) { // If saving the client success
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