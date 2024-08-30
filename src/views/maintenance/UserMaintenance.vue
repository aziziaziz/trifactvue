<template>
  <Loader v-if="loadingUsers" text="Loading Users" />
  <div class="user-maintenance-main" v-else>
    <Button class="add-user-button" theme="submit" @click="addUserClicked">Add User</Button>
    <div class="no-users" v-if="allUsers.length == 0">No available users</div>
    <div class="user-container" v-for="(u,uInd) in allUsers" :key="uInd">
      <div class="user-left">
        <div class="user-name">{{ u.username }} ({{ u.role_desc }})</div>
        <div>{{ u.email }}</div>
      </div>
      <div class="user-buttons">
        <Button theme="submit">Edit</Button>
        <Button theme="danger">Delete</Button>
      </div>
    </div>
  </div>

  <Popup :show="showAddPopup">
    <template v-slot:header>Add New User</template>
    <template v-slot:content>
      <Loader v-if="loadingRoles" text="Loading Roles" />
      <div v-else class="add-container">
        <FormInput placeholder="Username" v-model:value="newUsername" />
        <FormInput placeholder="Email" v-model:value="newEmail" />
        <Dropdown placeholder="Role" position="top" :items="roleListing" v-model:selected="selectedRole" />
      </div>
    </template>
    <template v-slot:footer>
      <Button theme="submit" @click="addNewUserClicked">Add User</Button>
      <Button theme="danger" @click="showAddPopup = false">Cancel</Button>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { get } from '../../js/apiCall';

//#region Data
const loadingUsers = ref(false); // To show the loading when loading the users from the DB
const allUsers = ref([]); // The list of all the users from the DB
const showAddPopup = ref(false); // To show the add user popup
const roleListing = ref([]); // The list of roles that the user can choose when adding a new user
const loadingRoles = ref(false); // The show loading when loading the role
const selectedRole = ref(null); // For the role selected when adding the user
const newUsername = ref(''); // The username when adding the user
const newEmail = ref(''); // The email when adding the user
//#endregion Data

//#region Methods
const addUserClicked = async () => {
  // Setting back to default values
  selectedRole.value = null;
  newUsername.value = '';
  newEmail.value = '';

  // To show the popup
  showAddPopup.value = true;

  // Getting the roles from DB
  loadingRoles.value = true;
  roleListing.value = await get(`Role/GetAllowedRoles?roleId=${localStorage.getItem('role')}`);
  roleListing.value.forEach(r => r.value = r.role_desc);
  loadingRoles.value = false;
}
const addNewUserClicked = async () => {
  console.log(newUsername.value);
  console.log(newEmail.value);
  console.log(selectedRole.value);
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  // Getting all the users from the DB
  loadingUsers.value = true;
  allUsers.value = await get('User/GetAllUsers');
  loadingUsers.value = false;
});
//#endregion Lifecycle
</script>

<style scoped>
.user-maintenance-main {
  display: flex;
  flex-direction: column;
}
.no-users {
  font-weight: bold;
  text-align: center;
}
.add-user-button {
  width: fit-content;
  align-self: flex-end;
}
.user-container {
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  margin-top: 5px;
  display: flex;
  column-gap: 5px;
  align-items: center;
}
.user-name {
  font-weight: bold;
  font-size: 1.1em;
}
.user-left {
  width: 100%;
}
.user-right {
  white-space: nowrap;
}
.user-buttons {
  display: flex;
  column-gap: 5px;
}
.add-container {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
</style>