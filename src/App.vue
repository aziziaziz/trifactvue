<template>
  <router-view />

  <Popup :show="showPopup" align="center">
    <template v-slot:header>{{ popupHeader }}</template>
    <template v-slot:content>{{ popupContent }}</template>
    <template v-slot:footer>
      <div class="popup-footer">
        <Button class="popup-button" @click="showPopup = false" theme="submit">OK</Button>
      </div>
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
.popup-footer {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  align-items: center;
  width: 100%;
}
.popup-button {
  max-width: 300px;
}
</style>