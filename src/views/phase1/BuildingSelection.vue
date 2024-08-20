<template>
  <Loader v-if="loadingCriteria" text="Loading Criteria" />
  <div v-else class="building-selection-main">
    <div class="button-section">
      <Button class="save-button">Share</Button>
      <Button class="save-button" theme="submit">Save</Button>
    </div>
    <table>
      <tr>
        <th>Criteria</th>
        <th>Preference</th>
        <th>Weighting (1-10)</th>
      </tr>
      <tr v-for="(crit,critInd) in criteria" :key="critInd">
        <td>{{ crit.criteria }}</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { wait } from '../../js/helper';

//#region Data
const criteria = ref([]); // The list of criteria for the user building selection
const loadingCriteria = ref(false); // Set to true whenn loading the criteria from DB
//#endregion Data

//#region Lifecycle
onMounted(async () => {
  // The list of criteria, call from DB once backend done
  loadingCriteria.value = true;
  criteria.value = [
    { criteria: 'Floor Size' },
    { criteria: 'Efficiency Rate' },
    { criteria: 'Ceiling Height' },
  ];
  await wait(2000);
  loadingCriteria.value = false;
});
//#endregion Lifecycle
</script>

<style scoped>
.building-selection-main {
  display: flex;
  flex-direction: column;
}
.building-selection-main > :not(:first-child) {
  margin-top: 5px;
}
table {
  border-collapse: collapse;
}
table tr th, table tr td {
  border: 1px solid gray;
  padding: 5px;
  white-space: nowrap;
}
td:first-child  {
  width: 100%;
}
td:not(:first-child) {
  text-align: center;
}
td > input {
  width: 100px;
}
.button-section {
  display: flex;
  column-gap: 5px;
  justify-content: flex-end;
}
.save-button {
  width: fit-content;
}
</style>