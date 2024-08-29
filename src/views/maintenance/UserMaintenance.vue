<template>
  <Loader v-if="loadingUsers" text="Loading Users" />
  <div class="user-maintenance-main" v-else>
    <Button class="add-user-button" theme="submit">Add User</Button>
    <div class="no-users" v-if="allUsers.length == 0">No available users</div>
    <div class="user-container" v-for="(u,uInd) in allUsers" :key="uInd">
      <div class="user-left">
        <div class="user-name">{{ u.username }} ({{ u.role }})</div>
        <div>{{ u.email }}</div>
      </div>
      <div class="user-buttons">
        <Button theme="submit">Edit</Button>
        <Button theme="danger">Delete</Button>
        <Button :theme="u.deleted == 'N' || u.deleted == null ? 'warning' : 'default'">{{ u.deleted == 'N' || u.deleted == null ? 'Deactivate' : 'Activate' }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { get } from '../../js/apiCall';

//#region Data
const loadingUsers = ref(false);
const allUsers = ref([]);
//#endregion Data

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
</style>