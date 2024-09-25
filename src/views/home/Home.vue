<template>
  <div class="home-container">
    <Button theme="submit" class="add-space-button" @click="addClientClicked" :disabled="store.state.spaceListing.length == 0">Add Client</Button>
    <Input placeholder="Search Client" />
    <!-- <div v-if="store.state.currentClient" class="space-details">
      <div class="space-title">✓ {{ store.state.currentClient.client_name }}</div>
    </div> -->
    <!-- <hr style="width: 100%"> -->
    <div v-if="allClients.length > 0" class="space-container">
      <div class="space-details" v-for="(client,clientInd) in allClients" :key="clientInd">
        <div class="space-title">
          <div>{{ client.client_name }}</div>
          <Button @click="addProjectClick(client)">Add Project</Button>
        </div>
        <div class="space-title space-sub-title">
          <img src="../../assets/dropdown/dropdown.png" :style="{ transform: `scaleY(${client.show ? '-1' : '1'})` }">
          <div @click="showClientsProjects(client)">Project Count: {{ client.project_count }}</div>
        </div>
        <div class="space-project-details" ref="projectsElement" v-if="client.show">
          <Loader text="Loading Client" v-if="client.loadingProjects" />
          <div v-else class="space-details project-details" v-for="(proj,projInd) in client.projects" :key="projInd">
            <div @click="projectClicked(proj)">
              <div>{{ store.state.currentClient ? (store.state.currentClient.client_uid == proj.client_uid ? '✓' : '') : '' }} {{ proj.project_location }}, {{ proj.country }}</div>
              <div>{{ proj.project_desc }}</div>
            </div>
            <Button theme="warning" @click="editProjectClicked(proj)">Edit</Button>
          </div>
        </div>
      </div>
    </div>
    <Loader v-else-if="clientLoading" text="Loading Clients" />

    <Popup v-model:show="showAddClientPopup" @enter="saveClientClicked">
      <template v-slot:header>{{ inEditMode ? 'Edit' : 'Add' }} Client</template>
      <template v-slot:content>
        <div class="popup-content-container">
          <FormInput placeholder="Client name" v-model:value="clientName" @focusOut="clientNameBlur" :disabled="isAddingProject || inEditMode" />
          <Dropdown placeholder="Country" :items="countryListing" v-model:selected="selectedCountry" :disabled="inEditMode" />
          <FormInput placeholder="Project Location" v-model:value="projectLocation" :disabled="inEditMode" />
          <FormInput placeholder="Project Description" v-model:value="projectDescription" />
          <Dropdown placeholder="Local Currency" :items="currencyListing" position="top" v-model:selected="selectedCurrency" />
          <FormInput placeholder="Budget Contingency (%)" v-model:value="budgetContingency" />
          <Dropdown placeholder="Space unit" :items="unitList" v-model:selected="selectedUnit" position="top" />
        </div>
      </template>
      <template v-slot:footer>
        <div class="popup-button-section">
          <Button theme="submit" @click="saveClientClicked" :loading="savingClient">{{ inEditMode ? 'Update' : 'Save' }}</Button>
          <Button theme="danger" @click="showAddClientPopup = false">Cancel</Button>
        </div>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { get, post, put } from '../../js/apiCall';
import { popup, showNoti } from '../../js/helper';

const store = useStore();

//#region Data
const allClients = ref([]); // The spaces that are available for the user
const clientLoading = ref(false); // Used to show the loading when loading the client from DB
const showAddClientPopup = ref(false); // Use to show the popup to add client
const isAddingProject = ref(false); // Used when adding project for the client
const inEditMode = ref(false); // To indicate the popup in edit mode
const countryListing = ref([]); // The list of all the countries
const currencyListing = ref([]); // Tje list of all the currencies
const unitList = ref([]); // The list of availale units
const savingClient = ref(false); // To show loading when saving the client
const projectsElement = ref(null); // The element reference to the projects for each of the clients
// For the popup model
const editClientUID = ref(''); // Used to update the client
const clientName = ref(''); // Used when adding a new client
const selectedCountry = ref(null); // The selected country
const projectLocation = ref(''); // The location of the project
const projectDescription = ref(''); // The description of the project
const selectedCurrency = ref(null); // The selected currency
const budgetContingency = ref(''); // The budget contingency (number)
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The unit when adding new client, default to sqft
//#endregion Data

//#region Methods
// const clientDetailsClicked = async (ind) => {
//   // Check if currently client is selected and if it is, the need to add back into the client list
//   if (localStorage.getItem('client')) {
//     allClients.value.splice(ind, 0, JSON.parse(localStorage.getItem('client')));
//     ind++;
//   }

//   // Get the client based on the index
//   let client = allClients.value[ind];
//   // Assign the client to the store and save in the localstorage
//   store.state.currentClient = client;
//   localStorage.setItem('client', JSON.stringify(client));

//   // Remove the client from the full list and make it show at the top
//   allClients.value.splice(ind, 1);
// }
const addClientClicked = () => { // When adding a new client
  // Reset value to default
  resetFields();

  // To show the popup
  showAddClientPopup.value = true;
}
const saveClientClicked = async () => { // When a new client is saved
  // Stops the method if one or more fields is not selected/filled in
  if (!compulsoryFieldChecking()) {
    return;
  }

  // Saving to DB
  let saveObj = {
    client_name: clientName.value,
    country: selectedCountry.value.code,
    project_location: projectLocation.value,
    project_desc: projectDescription.value,
    local_ccy: selectedCurrency.value.currency_code,
    budget_contingency: Number(budgetContingency.value),
    sqm_sqft: selectedUnit.value.acronym,
    created_by: localStorage.getItem('user')
  };
  savingClient.value = true;

  // Checking if in new or edit mode
  if (!inEditMode.value) {
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
      
      // Show noti
      showNoti('Successfully created a new client', 'success');
    
      // Gett all clients from the DB
      getAllClients();
    } else { // If saving the client failed
      savingClient.value = false;
      showNoti('There was an error occured while creating new client.', 'error');
    }
  } else {
    // Set the client uid
    saveObj.client_uid = Number(editClientUID.value);

    // Calling the API to update the client
    let updateClient = await put('Client/UpdateClient', saveObj);
    savingClient.value = false;

    // Checking on the update result
    if (updateClient) {
      // Close the popup and show success noti
      showAddClientPopup.value = false;
      showNoti('Successfully updated your client', 'success');

      // Get all the clients again
      getAllClients();
    } else {
      // Show error noti
      showNoti('There was an error occurred while updating your client', 'error');
    }
  }
}
const getAllClients = async () => {
  // Empty the clients first
  allClients.value = [];

  // Getting all the clients from the DB
  clientLoading.value = true;
  allClients.value = await get('Client/GetAllClientsName');
  clientLoading.value = false;

  // Set the additional keys for the clients object
  allClients.value.forEach(c => {
    c.projects = [];
    c.loadingProjects = false;
    c.show = false;
  });

  // Checking if there is a current selected client
  if (store.state.currentClient) {
    // Get the selected client object
    let selectedClient = allClients.value.filter(c => c.client_name == store.state.currentClient.client_name);
    // Get all the clients besides the one selected
    let notSelectedClient = allClients.value.filter(c => c.client_name != store.state.currentClient.client_name);

    // Checking if there is any selected client within the list
    if (selectedClient.length > 0) {
      // Auto load the projects for the current selected client
      showClientsProjects(selectedClient[0]);
    }
    
    // Put the selected client at the top of the list
    allClients.value = [ ...selectedClient, ...notSelectedClient ];
  }

  // // Getting the unique client name
  // let clientNames = [...new Set(allClients.value.map(c => c.client_name))];
  // // Grouping the clients
  // allClients.value = clientNames.map(n => {
  //   return {
  //     name: n,
  //     show: true,
  //     projects: allClients.value.filter(c => c.client_name == n)
  //   }
  // });

  // // Checking if there is a client that is already selected
  // if (localStorage.getItem('client')) {
  //   // Parse the client string from localstorage to object
  //   let savedClient = JSON.parse(localStorage.getItem('client'));

  //   // Get the index based on id
  //   let ind = allClients.value.findIndex(c => c.client_uid == savedClient.client_uid);
  //   // Remove from the main list
  //   allClients.value.splice(ind, 1);
  // }
}
const compulsoryFieldChecking = () => {
  let pass = true;

  // Checking for all the compulsory fields
  if (!clientName.value) {
    showNoti('Client name cannot be empty', 'error');
    pass = false;
  } else if (!selectedCountry.value) {
    showNoti(`Country needs to be selected`, 'error');
    pass = false;
  } else if (!projectLocation.value) {
    showNoti('Project location cannot be empty', 'error');
    pass = false;
  } else if (!projectDescription.value) {
    showNoti('Project description cannot be empty', 'error');
    pass = false;
  } else if (!selectedCurrency.value) {
    showNoti('Currency needs to be selected', 'error');
    pass = false;
  } else if (!budgetContingency.value) {
    showNoti('Budget contingency cannot be empty', 'error');
    pass = false;
  }

  // Verifying the value
  if (pass) {
    // Checking for the budget contingency value
    if (isNaN(Number(budgetContingency.value))) {
      showNoti('Budget contingency must be a number', 'error');
      pass = false;
    }
  }

  return pass;
}
const resetFields = () => {
  // Reset the values to default
  editClientUID .value = '';
  clientName.value = '';
  selectedCountry.value = null;
  projectLocation.value = '';
  projectDescription.value = '';
  selectedCurrency.value = null;
  budgetContingency.value = '';
  selectedUnit.value = { value: 'Square Feet (sqft)', acronym: 'sqft' };
  isAddingProject.value = false;

  // Reset the edit mode as well
  inEditMode.value = false;
}
const addProjectClick = (client) => {
  // Reset the fields first
  resetFields();

  // Open the popup with adding project is true
  showAddClientPopup.value = true;
  isAddingProject.value = true;

  // Set the client name input
  clientName.value = client.client_name;
}
const projectClicked = (proj) => {
  // Assign the client to the store and save in the localstorage
  store.state.currentClient = proj;
  localStorage.setItem('client', JSON.stringify(proj));
}
const showClientsProjects = async (client) => {
  // Switch the show key to true or false
  client.show = !client.show;

  // Check if to show the projects
  if (client.show) {
    // Checking if the project is empty
    if (client.projects.length == 0) {
      client.loadingProjects = true;
      client.projects = await get(`Client/GetAllClientsByName?name=${client.client_name}`);
      client.loadingProjects = false;
    }
  }
}
const clientNameBlur = async () => {
  // Get the details of the client name that newly entered
  let projects = await get(`Client/GetAllClientsByName?name=${clientName.value}`);
  // Check if the client name already exists
  if (projects.length > 0) {
    // Show a popup
    popup('Client Exists', `Client ${clientName.value} already exists.\nYou are only allowed to add project for existing clients.`);
    // Close the popup
    showAddClientPopup.value = false;
  }
}
const editProjectClicked = (proj) => {
  // Reset the fields and show the popup in edit mode
  resetFields();
  showAddClientPopup.value = true;
  inEditMode.value = true;

  // Set the project client uid
  editClientUID.value = proj.client_uid;

  // Populate the project values
  clientName.value = proj.client_name;
  selectedCountry.value = countryListing.value.find(c => c.code == proj.country);
  projectLocation.value = proj.project_location;
  projectDescription.value = proj.project_desc;
  selectedCurrency.value = currencyListing.value.find(c => c.currency_code == proj.local_ccy);
  budgetContingency.value = proj.budget_contingency;
  selectedUnit.value = unitList.value.find(u => u.acronym == proj.sqm_sqft);
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  unitList.value = store.state.unitListing;

  // Getting the clients from the DB
  await getAllClients();

  // Populating the countries and currencies from store
  countryListing.value = store.state.countryListing;
  currencyListing.value = store.state.currencyListing;
});
//#endregion Lifecycle
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 5px;
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
  row-gap: 5px;
}
.space-details:not(:first-child) {
  margin-top: 10px;
}
.space-title {
  font-size: 1.2em;
  font-weight: bold;
  display: flex;
  column-gap: 5px;
  align-items: center;
  user-select: none;
}
.space-title > div {
  width: 100%;
}
.space-title > Button {
  width: fit-content;
  white-space: nowrap;
  font-size: 0.5em;
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
.space-project-details {
  margin-top: 5px;
}
.project-details {
  flex-direction: row;
}
.project-details > :first-child {
  cursor: pointer;
  width: 100%;
}
.project-details > Button {
  width: fit-content;
}
.space-sub-title {
  font-size: 1em;
  cursor: pointer;
}
.space-sub-title > :first-child {
  height: 0.5em;
}
</style>