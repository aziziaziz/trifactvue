<template>
  <router-view />

  <Popup :show="showAlert" align="center">
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

const store = useStore();

//#region Data
const showAlert = ref(false); // Show/Hide the alert
const popupHeader = ref(''); // The header/title of the popup
const popupContent = ref(''); // The content of the popup
const isQuestion = ref(false); // Setting if the popup is a question or just an alert
const yesText = ref('Yes'); // The text to change on the yes button
const noText = ref('No'); // The text to change on the no button
const isDestructive = ref(false); // To set if the answer is destuctive (meaning that if like deleting something, this must be true)
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
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  // Subscribe when a commit is done on the store
  store.subscribe((mutation) => {
    // Only show the popup when the mutation is showAlert
    if (mutation.type == 'showAlert' || mutation.type == 'showAlertQuestion') {
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