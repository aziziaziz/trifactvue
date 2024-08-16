<template>
  <div class="milestone-main">
    <FormInput :placeholder="`Size (${clientUnit})`" @enter="loadingDetails" v-model:value="inputTotalSize" />
    <Button theme="submit" @click="loadingDetails">Calculate Milestone</Button>
    <div v-if="isLoading">Loading</div>
    <Button class="save-milestone-button" v-if="!isLoading && milestones.length > 0" theme="submit">Save Milestone</Button>
    <table v-if="!isLoading && milestones.length > 0">
      <tr>
        <th>Description</th>
        <th>Optimal Days</th>
        <th>Minimum Days</th>
        <th>Expected Days</th>
      </tr>
      <tr v-for="(m,mInd) in milestones" :key="mInd">
        <td>{{ m.area_description }}</td>
        <td>{{ m.suggested_days }}</td>
        <td>{{ m.min_days }}</td>
        <td><input class="expected-input" v-model="m.suggested_days" /></td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get } from '../../js/apiCall';

const router = useRouter();
const store = useStore();

//Region Data
const inputTotalSize = ref('');
const isLoading = ref(false);
const milestones = ref([]);
const clientUnit = ref('');
//EndRegion Data

//Region Methods
const loadingDetails = async () => {
  if (inputTotalSize.value) {
    // Clear the milestone and set is loading
    milestones.value = [];
    isLoading.value = true;

    // Calculate the milestone from DB
    milestones.value = await get(`ProjectMilestones/GetAllProjectMileStonesAreaBySize?size=${inputTotalSize.value}`);

    // Hide the loading
    isLoading.value = false;
  }
}
//EndRegion Methods

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    // Setting the clientUnit
    clientUnit.value = store.state.currentClient.sqm_sqft;
    // Loading the client's project milestone from DB
    milestones.value = await get(`ProjectMilestones/GetAllProjectMileStonesByClientUid?client_uid=${store.state.currentClient.client_uid}`);
  } else {
    router.push('/Home?choose');
  }
});
//#endregion Lifecycle
</script>

<style scoped>
.milestone-main {
  display: flex;
  flex-direction: column;
}
.milestone-main > *:not(:first-child) {
  margin-top: 5px;
}
.save-milestone-button {
  width: fit-content;
  align-self: flex-end;
}
table {
  border-collapse: collapse;
}
table tr th, table tr td {
  border: 1px solid gray;
  padding: 5px;
  white-space: nowrap;
}
th:first-child {
  width: 100%;
}
td:not(:first-child) {
  text-align: center;
}
.expected-input {
  text-align: center;
}
</style>