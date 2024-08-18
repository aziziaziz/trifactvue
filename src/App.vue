<template>
  <router-view />

  <Popup :show="showPopup">
    <template v-slot:header>{{ popupHeader }}</template>
    <template v-slot:content>{{ popupContent }}</template>
    <template v-slot:footer>
      <Button @click="showPopup = false" theme="submit">OK</Button>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex'

const store = useStore();

//#region Data
const showPopup = ref(false);
const popupHeader = ref('');
const popupContent = ref('');
//#endregion Data

//#region Lifecycle
onMounted(() => {
  // Subscribe when a commit is done on the store
  store.subscribe((mutation) => {
    console.log(mutation);
    // Only show the popup when the mutation is showPopup
    if (mutation.type == 'showPopup') {
      // Set the header and the content
      popupHeader.value =  mutation.payload?.header;
      popupContent.value = mutation.payload?.content;

      // Show the popup
      showPopup.value = true;
    }
  });
});
//#endregion Lifecycle
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
.horizontal-spacer {
  width: 100%;
}
.vertical-spacer {
  height: 100%;
}
.error-text {
  color: indianred;
}
</style>
