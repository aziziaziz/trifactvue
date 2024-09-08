<template>
  <Loader v-if="loadingRole" text="Loading Roles" />
  <div v-else class="role-main">
    <div>You may add, edit or delete role from below list</div>
    <Button class="add-role-button" theme="submit">Add Role</Button>
    <div>There are total of {{ roleListing.length }} available roles</div>
    <div class="role-item-container" v-for="(role,roleInd) in roleListing" :key="roleInd">
      <div class="role-details">
        <div class="role-name">{{ role.role_desc }}</div>
        <div v-if="role.create_permission_desc.length > 0">Allowed to create: {{ role.create_permission_desc.join(', ') }}</div>
        <div v-else>Not allowed to create any user</div>
      </div>
      <Button class="role-delete-button" theme="danger">Delete</Button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { get } from '../../js/apiCall';

//#region Data
const loadingRole = ref(false); // When loading the role
const roleListing = ref([]); // The list of the available roles
//#endregion Data

//#region Lifecycle
onMounted(async () => {
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
  console.log(roleListing.value);
  loadingRole.value = false;
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
</style>