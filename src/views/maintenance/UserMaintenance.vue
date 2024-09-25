<template>
  <Loader v-if="loadingUsers" text="Loading Users" />
  <Loader v-else-if="deletingUser" :text="deleteUserText" />
  <div class="user-maintenance-main" v-else>
    <Button class="add-user-button" theme="submit" @click="addUserClicked">Add User</Button>
    <div class="no-users" v-if="allUsers.length == 0">No available users</div>
    <div class="user-container" v-for="(u,uInd) in allUsers" :key="uInd">
      <div class="user-left">
        <div class="user-name">{{ u.username }} ({{ u.role_desc }})</div>
        <div>{{ u.email }}</div>
      </div>
      <div class="user-buttons">
        <Button v-if="(currentUser.match(/master1/gi) || currentUser.match(/master2/gi)) ? true : (u.username != 'Master1' && u.username != 'Master2')" theme="submit" @click="editUserClicked(u)">Edit</Button>
        <Button v-if="(u.username != 'Master1' && u.username != 'Master2') && u.username != currentUser" theme="danger" @click="deleteUserClicked(u)">Delete</Button>
      </div>
    </div>
  </div>

  <Popup :show="showAddPopup">
    <template v-slot:header>{{ editingUser ? 'Edit' : 'Add New' }} User</template>
    <template v-slot:content>
      <Loader v-if="loadingRoles" text="Loading Roles" />
      <div v-else class="add-container">
        <FormInput placeholder="Username" v-model:value="newUsername" :disabled="editingUser != null" />
        <FormInput placeholder="Email" v-model:value="newEmail" :disabled="editingUser != null" />
        <Dropdown placeholder="Role" position="top" :items="roleListing" v-model:selected="selectedRole" />
      </div>
    </template>
    <template v-slot:footer>
      <Button theme="submit" @click="addNewUserClicked" :loading="addNewUserLoading">{{ editingUser ? 'Update' : 'Add' }} User</Button>
      <Button theme="danger" @click="showAddPopup = false">Cancel</Button>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { get, httpDelete, post, put } from '../../js/apiCall';
import { question, showNoti } from '../../js/helper';

//#region Data
const currentUser = ref(''); // The current logged in user
const loadingUsers = ref(false); // To show the loading when loading the users from the DB
const deletingUser = ref(false); // To show loading when deleting a user
const allUsers = ref([]); // The list of all the users from the DB
const showAddPopup = ref(false); // To show the add user popup
const roleListing = ref([]); // The list of roles that the user can choose when adding a new user
const loadingRoles = ref(false); // The show loading when loading the role
const selectedRole = ref(null); // For the role selected when adding the user
const newUsername = ref(''); // The username when adding the user
const newEmail = ref(''); // The email when adding the user
const addNewUserLoading = ref(false); // Loading when saving the new user
const deleteUserText = ref(''); // The text to show when deleting a user
const editingUser = ref(null); // The user object that is being edit
//#endregion Data

//#region Methods
const addUserClicked = async () => {
  setPopupDefaultValues();

  // To show the popup
  showAddPopup.value = true;

  // Getting the roles from DB
  getAllRoles();
}
const getAllUsers = async () => {
  // Clear the current users first
  allUsers.value = [];

  // Getting all the users from the DB
  loadingUsers.value = true;
  allUsers.value = await get('User/GetAllUsers');
  loadingUsers.value = false;
}
const addNewUserClicked = async () => {
  // Checking if the username is empty
  if (!newUsername.value) {
    showNoti('Please enter the username.', 'error');
    return;
  }

  // Checking if the email is empty
  if (!newEmail.value) {
    showNoti('Please enter the email.', 'error');
    return;
  }

  // Checking if the role is not selected
  if (!selectedRole.value) {
    showNoti('Please select the role.', 'error');
    return;
  }

  if (editingUser.value) { // For edit
    // Generate the update to update
    let userToUpdate = {
      user_id: editingUser.value.user_id,
      username: editingUser.value.username,
      email: editingUser.value.email,
      role: selectedRole.value.role_id,
      deleted: 'N',
    };
    
    // Update the user
    addNewUserLoading.value = true;
    let updateUserResult = await put('User/UpdateUser', userToUpdate);
    addNewUserLoading.value = false;

    // Check if update successful
    if (updateUserResult) {
      // Close the popup
      showAddPopup.value = false;

      // Show success noti
      showNoti(`Successfully updated ${editingUser.value.username}`, 'success');

      // Reload all the users
      await getAllUsers()
    } else {
      // Show error noti
      showNoti('Failed to update user. Please try again.', 'error');
    }
  } else { // For new
    // Asking if the email is correct
    let confirmEmail = await question('Confirm User Email', `Do you confirm that the user email (${newEmail.value}) is correct?\nUser will receive an email with the password for first time login.\nWrong email will cause the user unable to login.`, 'Confirm', 'Cancel');

    // Checking if user confirms the email
    if (confirmEmail == 'Confirm') {
      // Inserting the new user to DB
      addNewUserLoading.value = true;
      let addUserResult = await post('User/Register', {
        username: newUsername.value,
        email: newEmail.value,
        role: selectedRole.value.role_id
      });
      addNewUserLoading.value = false;

      // Check if the insertion of new user success
      if (addUserResult) {
        // Close the popup
        showAddPopup.value = false;

        // Show success noti
        showNoti('Successfully created a new user and email has been sent to the user containing their new password.', 'success');

        // Call back the load user api so that the list gets updated
        await getAllUsers();
      } else {
        // Show error noti
        showNoti('There was an error while creating the user. Please try again.', 'error');
      }
    }
  }
}
const deleteUserClicked = async (user) => {
  // Show a popup asking to confirm delete user
  var confirmDelete = await question('Delete User', `Do you confirm you want to delete ${user.username} from the list of users?\nThis action cannot be undone,`, 'Delete', 'Cancel', true);
  
  // Checking if the user confirm to delete
  if (confirmDelete == 'Delete') {
    // Showing the name of the user that is being deleted
    deleteUserText.value = `Deleting ${user.username}`;

    // Call API to delete the user
    deletingUser.value = true;
    let deleteUser = await httpDelete(`User/DeleteUser?user_id=${user.user_id}`);
    deletingUser.value = false;

    // Check if the deletion is successful
    if (deleteUser) {
      showNoti(`User ${user.username} is successfully deleted.`, 'success');
    } else {
      showNoti(`There was an error while deleting ${user.username}. Please try again.`, 'error');
    }

    // Reload all the users again
    await getAllUsers();
  }
}
const editUserClicked = async (user) => {
  // Setting back to default values
  setPopupDefaultValues();

  // Getting all the roles
  await getAllRoles();

  // Set the editing user
  editingUser.value = user;

  // Set to the current editing user
  newUsername.value = editingUser.value.username;
  newEmail.value = editingUser.value.email;
  selectedRole.value = roleListing.value.find(r => r.role_id == editingUser.value.role);

  // Show the popup
  showAddPopup.value = true;
}
const setPopupDefaultValues = () => {
  // Setting back to default values
  selectedRole.value = null;
  newUsername.value = '';
  newEmail.value = '';
  editingUser.value = null;
}
const getAllRoles = async () => {
  // Getting all the roles
  loadingRoles.value = true;
  roleListing.value = await get(`Role/GetAllowedRoles?roleId=${localStorage.getItem('role')}`);
  roleListing.value.forEach(r => r.value = r.role_desc);
  loadingRoles.value = false;
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  currentUser.value = localStorage.getItem('user');
  await getAllUsers();
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