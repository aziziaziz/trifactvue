<template>
  <!-- <input v-model="inputTotalSize" /><br> -->
  <FormInput :placeholder="`Size (${clientUnit})`" />
  <button @click="loadingDetails">Calculate</button><br><br>
  <div v-if="isLoading">Loading</div>
  <table v-if="!isLoading && milestones.length > 0">
    <tr>
      <th>Description</th>
      <th>Optimal Days</th>
      <th>Minimum Days</th>
      <th>Expected Days</th>
    </tr>
    <tr v-for="(m,mInd) in milestones" :key="mInd">
      <td>{{ m.desc }}</td>
      <td>{{ m.optimal }}</td>
      <td>{{ m.minimum }}</td>
      <td><input class="expected-input" v-model="m.expected" /></td>
    </tr>
  </table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

//Region Data
const inputTotalSize = ref('');
const isLoading = ref(false);
const milestones = ref([]);
const clientUnit = ref('');
//EndRegion Data

//Region Methods
const loadingDetails = () => {
  if (inputTotalSize.value) {
    milestones.value = [];
    isLoading.value = true;

    setTimeout(() => {
      milestones.value = [
        { desc: 'Site visit and gather details', optimal: 5, minimum: 2, expected: 2 },
        { desc: 'Buying materials', optimal: 7, minimum: 4, expected: 4 },
        { desc: 'Deliver materials', optimal: 3, minimum: 1, expected: 1 },
        { desc: 'Demolishing current building', optimal: 4, minimum: 2, expected: 2 },
        { desc: 'Building new walls', optimal: 15, minimum: 10, expected: 10 },
        { desc: 'Installation of water pipes', optimal: 8, minimum: 5, expected: 5 },
        { desc: 'Installation of wiring', optimal: 7, minimum: 4, expected: 4 },
        { desc: 'Installation of tiles', optimal: 12, minimum: 7, expected: 7 },
        { desc: 'Painting', optimal: 6, minimum: 4, expected: 4 },
        { desc: 'Cleaning up', optimal: 5, minimum: 2, expected: 2 },
      ];
      isLoading.value = false
    }, 2000);
  }
}
//EndRegion Methods

//#region Lifecycle
onMounted(() => {
  if (store.state.currentClient) {
    // Setting the clientUnit
    clientUnit.value = store.state.currentClient.sqm_sqft;
    // Loading the client's project milestone from DB
  } else {
    router.push('/Home?choose');
  }
});
//#endregion Lifecycle
</script>

<style scoped>
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