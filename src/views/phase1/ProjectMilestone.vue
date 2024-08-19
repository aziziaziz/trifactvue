<template>
  <div class="milestone-main">
    <FormInput :placeholder="`Size (${clientUnit})`" @enter="loadingDetails" v-model:value="inputTotalSize" />
    <Button theme="submit" @click="loadingDetails">Calculate Milestone</Button>
    <Loader v-if="isLoading" text="Loading Project Milestone" />
    <Button class="save-milestone-button" v-if="!isLoading && milestones.length > 0" theme="submit" @click="saveMilestone"
      :loading="isSaving">Save Milestone</Button>
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
        <td><input class="expected-input" v-model="m.user_input_days" /></td>
      </tr>
    </table>
    <div v-if="!isLoading && milestones.length == 0" class="no-milestone-text">No milestones saved</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get, put } from '../../js/apiCall';
import { compareData, showNoti } from '../../js/helper';

const router = useRouter();
const store = useStore();

//Region Data
const inputTotalSize = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const originalMilestones = ref([]);
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
    // Mapping to add user input
    milestones.value = milestones.value.map(m => {
      let obj = JSON.parse(JSON.stringify(m));
      obj.user_input_days = m.suggested_days;
      return obj;
    });

    // Hide the loading
    isLoading.value = false;
  } else { // if the input total size is not entered
    showNoti('Please enter the total size to calculate', 'error');
  }
}
const saveMilestone = async () => {
  // Get the data to post via compare data
  let milestoneToPost = compareData(originalMilestones, milestones, 'area_uid');

  // Mapping the milestone to post with the proper value
  milestoneToPost = milestoneToPost.map(m => {
    return {
      action: m.action,
      client_uid: store.state.currentClient.client_uid,
      area_uid: m.area_uid,
      total_size: Number(inputTotalSize.value),
      country_code: m.country_code,
      user_input_days: Number(m.user_input_days),
      min_days: m.min_days,
      suggested_days: m.suggested_days
    };
  })

  // Post the milestones to save in DB
  isSaving.value = true;
  await put(`ProjectMilestones/UpdateProjectMilestones?username=${localStorage.getItem('user')}`, milestoneToPost);
  isSaving.value = false;
}
//EndRegion Methods

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    // Setting the clientUnit
    clientUnit.value = store.state.currentClient.sqm_sqft;

    // Loading the client's project milestone from DB
    isLoading.value = true;
    milestones.value = await get(`ProjectMilestones/GetAllProjectMileStonesByClientUid?client_uid=${store.state.currentClient.client_uid}`);
    originalMilestones.value = JSON.parse(JSON.stringify(milestones.value));
    isLoading.value = false;
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
.no-milestone-text {
  font-weight: bold;
  text-align: center;
}
</style>