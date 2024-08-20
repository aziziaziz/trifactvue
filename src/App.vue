<template>
  <router-view />

  <div class="global-noti-container">
    <TransitionGroup name="notification">
      <div v-for="(noti,notiInd) in notiListing" :key="notiInd" :class="['noti-item', `${noti.theme}-noti-theme`]">{{ noti.text }}</div>
    </TransitionGroup>
  </div>

  <Popup class="global-popup-container" :show="showAlert" align="center">
    <template v-slot:header>{{ popupHeader }}</template>
    <template v-slot:content>{{ popupContent }}</template>
    <template v-slot:footer>
      <div class="popup-footer">
        <Button v-if="!isQuestion" class="popup-button" @click="showAlert = false" theme="submit">OK</Button>
        <Button v-if="isQuestion" class="popup-button" :theme="isDestructive ? 'danger' : 'submit'" @click="answerButtonClicked(yesText)">{{ yesText }}</Button>
        <Button v-if="isQuestion" class="popup-button" :theme="!isDestructive ? 'danger' : 'submit'" @click="answerButtonClicked(noText)">{{ noText }}</Button>
      </div>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex'
import { wait } from './js/helper';

const store = useStore();

//#region Data
const showAlert = ref(false); // Show/Hide the alert
const popupHeader = ref(''); // The header/title of the popup
const popupContent = ref(''); // The content of the popup
const isQuestion = ref(false); // Setting if the popup is a question or just an alert
const yesText = ref('Yes'); // The text to change on the yes button
const noText = ref('No'); // The text to change on the no button
const isDestructive = ref(false); // To set if the answer is destuctive (meaning that if like deleting something, this must be true)
const notiListing = ref([
  // { text: 'Alert 1' },
  // { text: 'Alert 2' },
  // { text: 'Alert 3' },
  // { text: 'Alert 4' },
]);
const maxNoti = ref(3); // To allow max number of notification to show
//#endregion Data

//#region Methods
const answerButtonClicked = (answer) => {
  // Commit the answer
  store.commit('questionAnswered', {
    answer: answer
  });

  // Close the popup
  showAlert.value = false;
}
const insertNoti = (noti) => {
  // Add the notification
  notiListing.value.push(noti);
  // Close the noti based on the expires
  setTimeout(() => closeNoti(noti.id), noti.expires);
}
const closeNoti = (id) => {
  // Find the index of the noti to close
  let index = notiListing.value.findIndex(n => n.id == id);
  // Only remove if the noti index is more than or equals to 9
  if (index >= 0) {
    notiListing.value.splice(index, 1);
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  // Subscribe when a commit is done on the store
  store.subscribe(async (mutation) => {
    // Only show the popup when the mutation is showAlert
    if (mutation.type == 'showAlert' || mutation.type == 'showAlertQuestion') {
      // Reset the details
      isQuestion.value = false;
      yesText.value = 'Yes';
      noText.value = 'No';
      isDestructive.value = false;

      // Set the header and the content
      popupHeader.value =  mutation.payload?.header;
      popupContent.value = mutation.payload?.content;

      // Check if it is a question
      if (mutation.type == 'showAlertQuestion') {
        // Set that the properties of the question alert
        isQuestion.value = true;
        yesText.value = mutation.payload.yesText;
        noText.value = mutation.payload.noText;
        isDestructive.value = mutation.payload.isDestructive;
      }

      // Show the popup
      showAlert.value = true;
    }

    // Listening mutation for notification
    if (mutation.type == 'showNoti') {
      // Allowing on max number of notification
      if (notiListing.value.length >= maxNoti.value) {
        notiListing.value.splice(0, 1);
      }

      await wait(10);
      // Modify the payload
      let notiObj = JSON.parse(JSON.stringify(mutation.payload));
      notiObj.id = `noti${new Date().getTime()}`;
      // Insert the notification
      insertNoti(notiObj);
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
.global-noti-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  left: 0;
  bottom: 20px;
  z-index: 1002;
  pointer-events: none;
  row-gap: 5px;
}
.global-popup-container {
  z-index: 1001;
}
.noti-item {
  border: 1px solid gray;
  border-radius: 10px;
  background-color: white;
  padding: 10px;
  width: fit-content;
  max-width: 90%;
  text-align: center;
  transition: 0.5s;
  white-space: pre-wrap;
}
.notification-move,
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.notification-leave-active {
  position: absolute;
}
.default-noti-theme {
  background-color: white;
}
.warning-noti-theme {
  background-color: goldenrod;
  border: 1px solid yellow;
  color: white;
}
.error-noti-theme {
  background-color: indianred;
  border: 1px solid red;
  color: white;
}
.success-noti-theme {
  background-color: limegreen;
  border: 1px solid green;
  color: white;
}
</style>