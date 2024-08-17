<template>
  <div class="dev-main">
    <h1>Dev Pending Items</h1>
    <div>Below are the items that are pending from each of the developer.</div>
    <div>Please update where necessary.</div>
    <div>This will be our tracker.</div>

    <div :class="['dev-items', { 'dev-items-completed': dev.completedDate }]" v-for="(dev,devInd) in devItems" :key="devInd">
      <div class="dev-item-assigned">
        <div>{{ dev.assignedTo }}</div>
        <div>{{ dev.assignedDate }}</div>
      </div>
      <div>{{ dev.description }}</div>
      <div class="completed-date">{{ dev.completedDate }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import { dateFormat } from '../js/helper';

//#region Data
const devItems = ref([
  // {
  //   assignedTo: 'Azizi',
  //   description: 'Testing',
  //   assignedDate: dateFormat(new Date(), 'dd/MM/yyyy HH:mm:ss'),
  //   completedDate: ''
  // },
  // {
  //   assignedTo: 'Azizi',
  //   description: 'This is like a very super long text just to test ig you\'re putting a very long description so that it will go to next line. This is to make sure tha when the text is super long, or when the width of the screen is narrow, it will not affect anything.',
  //   assignedDate: dateFormat(new Date(), 'dd/MM/yyyy HH:mm:ss'),
  //   completedDate: '123123'
  // }
])
//#endregion Data
</script>

<style scoped>
.dev-main {
  width: 100vw;
  padding: 10px;
}
.dev-items {
  border: 1px solid gray;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
  border: 1px solid goldenrod;
  background-color: rgba(218,165,32,0.1);
}
.dev-items-completed {
  border: 1px solid limegreen;
  background-color: rgba(0,128,0,0.1);
}
.dev-items > :not(:first-child) {
  margin-top: 5px;
}
.dev-item-assigned {
  display: flex;
  align-items: center;
}
.dev-item-assigned > :first-child {
  width: 100%;
  font-weight: bold;
  font-size: 1.25em;
}
.dev-item-assigned > :nth-child(2), .completed-date {
  white-space: nowrap;
  font-size: 0.75em;
}
.completed-date {
  color: green;
}
</style>