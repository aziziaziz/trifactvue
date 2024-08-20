<template>
  <Loader v-if="loadingCriteria" text="Loading Criteria" />
  <div v-else class="building-selection-main">
    <div class="button-section">
      <Button class="save-button" @click="shareClicked">Share</Button>
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

  <Popup :show="showSharePopup">
    <template v-slot:header>Share Link</template>
    <template v-slot:content>
      <Loader v-if="loadingShareId" text="Generating Share Link" />
      <div v-else class="share-link-popup-details">
        <div>You may share this form via the link below</div>
        <div>This link will only bbe available for up to 12 hours only</div>
        <div class="share-link">
          <div class="link">{{ shareLink }}</div>
          <Button class="copy-link" @click="copyLinkClicked">Copy Link</Button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button theme="submit" @click="showSharePopup = false">Ok</Button>
    </template>
  </Popup>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { showNoti, wait } from '../../js/helper';

//#region Data
const criteria = ref([]); // The list of criteria for the user building selection
const loadingCriteria = ref(false); // Set to true whenn loading the criteria from DB
const showSharePopup = ref(false); // To show the share popup
const loadingShareId = ref(false); // When generating the share id
const shareLink = ref(''); // The share link that has been generated
//#endregion Data

//#region Lifecycle
const shareClicked = async () => {
  // Showing the share popup
  showSharePopup.value = true;

  // Generating the share link from the backend
  loadingShareId.value = true;
  await wait(1000);
  shareLink.value = 'https://theurllink.com/BuildingSelectionForm?id=ujkjsd-fasdfbadf-1231buas-iuygq3';
  loadingShareId.value = false;
}
const copyLinkClicked = () => {
  // Copying the sharelink to clipboard
  navigator.clipboard.writeText(shareLink.value);

  // Showing that the copy successful
  showNoti('Copied to clipboard!', 'success');
}
//#endregion Lifecycle

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
.share-link-popup-details {
  text-align: center;
}
.share-link {
  display: flex;
  column-gap: 5px;
  align-items: center;
  margin: 10px 0;
}
.share-link > .link {
  text-align: center;
  width: 100%;
  padding: 5px;
  border: 1px solid gray;
  border-radius: 10px;
}
.share-link > .copy-link {
  width: fit-content;
  white-space: nowrap;
}
</style>