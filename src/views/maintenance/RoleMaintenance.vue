<template>
  <Loader v-if="loadingRole" text="Loading Roles" />
  <div v-else class="role-main">
    <div>You may add, edit or delete role from below list</div>
    <Button class="add-role-button" theme="submit" @click="addRoleClicked">Add Role</Button>
    <div>There are total of {{ roleListing.length }} available roles</div>
    <div class="role-item-container" v-for="(role,roleInd) in roleListing" :key="roleInd">
      <div class="role-details">
        <div class="role-name">{{ role.role_desc }}</div>
        <div v-if="role.create_permission_desc.length > 0">Allowed to create: {{ role.create_permission_desc.join(', ') }}</div>
        <div v-else>Not allowed to create any user</div>
      </div>
      <Button class="role-delete-button" theme="danger">Delete</Button>
    </div>

    <Popup :show="addRolePopup">
      <template v-slot:header>Add New Role</template>
      <template v-slot:content>
        <div class="add-role-container">
          <FormInput placeholder="Role Name" v-model:value="newRoleName" />
          <div>Role that allowed to create this role</div>
          <div class="allowed-role-checkbox">
            <div class="role-checkbox-item" v-for="(role,roleInd) in roleListingCheckbox" :key="roleInd">
              <input type="checkbox" :id="`role_checkbox_${roleInd}`" v-model="role.isChecked">
              <label :for="`role_checkbox_${roleInd}`">{{ role.role_desc }}</label>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button theme="submit" @click="saveNewRoleClicked" :loading="savingNewRole">Add</Button>
        <Button theme="danger" @click="addRolePopup = false">Cancel</Button>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { get, post } from '../../js/apiCall';
import { showNoti } from '../../js/helper';

//#region Data
const loadingRole = ref(false); // When loading the role
const roleListing = ref([]); // The list of the available roles
const addRolePopup = ref(false); // To show or hide the add role popup
const roleListingCheckbox = ref([]); // The listing for the checkbox
const newRoleName = ref(''); // The new role name to add
const savingNewRole = ref(false); // The loading when saving new role
//#endregion Data

//#region Methods
const addRoleClicked = async () => {
  // Clearing the new role name
  newRoleName.value = '';

  // Setting the checkbox listing
  roleListingCheckbox.value = JSON.parse(JSON.stringify(roleListing.value));
  roleListingCheckbox.value.forEach(r => r.isChecked = false);

  // Showing the popup
  addRolePopup.value = true;
}
const saveNewRoleClicked = async () => {
  // Checking compulsory field
  if (!newRoleName.value) {
    showNoti('Please enter the role name', 'error');
    return;
  }

  // Preparing the obj to post
  let roleToSave = {
    role_desc: newRoleName.value,
    is_active: true,
    create_role_permission: roleListingCheckbox.value.filter(rc => rc.isChecked).map(rc => rc.role_id).join(',') || null
  }
  
  // Calling the API to save
  savingNewRole.value = true;
  let insertResult = await post('Role/InsertRole', roleToSave);
  savingNewRole.value = false;

  // Checking the result
  if (insertResult) {
    showNoti('Successfully inserted a new role', 'success');
    await getAllRoles();
  } else {
    showNoti('There was an error occurred when inserting new role. Please try again.', 'error');
  }
}
const getAllRoles = async () => {
  // Getting all the roles
  loadingRole.value = true;
  roleListing.value = await get('Role/GetAllRoles');
  // To show the allowed create premission in text not in ID
  roleListing.value.forEach(r => {
    let allowedCreate = r.create_role_permission;
    if (allowedCreate) {
      // To split in comma and get the desc back from role listing
      allowedCreate = allowedCreate.split(',');
      r.create_permission_desc = allowedCreate.map(a => roleListing.value.find(l => l.role_id == a).role_desc);
    } else {
      // To show that role not allowed to create
      r.create_permission_desc = [];
    }
  });
  loadingRole.value = false;
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  await getAllRoles();
});
//#endregion Lifecycle
</script>

<style scoped>
.role-main {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
.add-role-button {
  width: fit-content;
  align-self: flex-end;
}
.role-item-container {
  border: 1px solid gray;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
}
.role-item-container:hover {
  background-color: lightgray;
}
.role-details {
  width: 100%;
}
.role-delete-button {
  width: fit-content;
}
.role-name {
  font-weight: bold;
  font-size: 1.1em;
}
.add-role-container {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}
.allowed-role-checkbox {
  display: flex;
  row-gap: 5px;
  column-gap: 5px;
  flex-wrap: wrap;
}
.role-checkbox-item {
  min-width: calc(50% - 5px);
}
</style>