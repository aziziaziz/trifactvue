<template>
  <div class="office-custom-main">
    <Input placeholder="Search Space" />
    <Button @click="testClicked">Test</Button>
    <div>{{ status }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showNoti } from '../../js/helper';
// import { HubConnectionBuilder } from '@microsoft/signalr';

//#region Data
const status = ref('');
const count = ref(0);
//#endregion Data

//#region Methods
const testClicked = () => {
  // status.value = 'Question asked';
  // let ans = await question('Delete Data', 'Are you sure you want to delete this data?', 'Delete', 'Cancel', true);
  // status.value = `Replied with ${ans}`;
  showNoti(`Noti ${++count.value}`, 'success');
}
//#endregion Methods

//#region Lifecycle
// onMounted(() => {
  // let hub = new HubConnectionBuilder().withUrl('https://localhost:7248/buildingSelectionHub').build();
  // hub.start();
  
  // hub.on('ShareTimeExtended', (id) => {
  //   console.log('received : ', id);
  // });

  // setTimeout(() => {
  //   console.log('invoked');
  //   hub.invoke('ShareTimeExtended', 'thisismyid');

  //   hub.stop();
  // }, 3000);
// });
//#endregion Lifecycle
</script>

<style scoped>
.office-custom-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>