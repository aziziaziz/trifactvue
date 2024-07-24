<template>
  <div class="space-main">
    <Button theme="submit" class="add-space-button" @click="addSpaceClicked">Add Space</Button>
    <Input placeholder="Search Space" />
    <div class="space-container">
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">This is a very long text testing for elipsis. This is only when the text overflow, so that it would be hidden. This is not done yet guys. If not enough, you can shrink down a bit your browser to see the effect. This section also clickable to edit or view.</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">This is a bit shorter text</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Somewhat longer than previous, but still shorter than the first</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Short</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Just a random text, I don't know what to write anymore</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Please help me, I'm running out of ideas</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">I'm doing this at 1:30AM :'(</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Hope all this is worth it</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">I'm sleepy</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Texted Shern, but no reply</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Been doing since 11PM just now</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Today is 20th July</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Oh sheet, actually it is already 21st</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Hahaha</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Btw, guys, gotten a new job</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">And already resigned from CIMB.</div>
      </div>
      <div class="space-details" @click="spaceDetailsClicked">
        <div class="space-title">Name</div>
        <div class="space-description-container">Bye bye</div>
      </div>
    </div>

    <Popup :show="showAddPopup">
      <template v-slot:header>Add a Space</template>
      <template v-slot:content>
        <div class="new-space-container">
          <FormInput placeholder="Location name" v-model:value="spaceLocation" />
          <Dropdown placeholder="Space unit" :items="unitListing" v-model:selected="selectedUnit" />
          <div>Contains of {{ currentSpaceDetails.length }} space{{ currentSpaceDetails.length > 1 ? 's' : '' }}</div>
          <div class="space-details-container" v-for="(space,spaceInd) in currentSpaceDetails" :key="spaceInd">
            <div class="space-description">
              <div>{{ space.name.value }}</div>
              <img @click="deleteSpaceDescription(spaceInd)" src="../../assets/delete.png" alt="">
            </div>
            <!-- <Dropdown placeholder="Space Decription" :items="allSpaceDetails" v-model:selected="space.name" /> -->
            <div class="space-count">
              <FormInput placeholder="Space Count" v-model:value="space.count" />
              <FormInput placeholder="Space Total Area" v-model:value="space.totalSpace" />
            </div>
            <div>{{ isNaN(Number(space.totalSpace) / Number(space.count)) ? 0 : roundNumber(Number(space.totalSpace) / Number(space.count), 2) }} {{ selectedUnit.acronym }} per {{ space.name.value }}</div>
          </div>
          <div v-if="remainingSpace.length > 0" class="space-details-container">
            <Dropdown placeholder="Space Decription" :items="remainingSpace" v-model:selected="newlySelectedSpace" position="top" />
            <Button theme="submit" @click="addNewSpaceClicked">Add Space</Button>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeClicked">Close</Button>
      </template>
    </Popup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { roundNumber } from '../../js/helper';

//#region Data
const showAddPopup = ref(false); // Use to show or hide the add space popup
const allSpaceDetails = ref([ // Use as a constant for all the available space details
  { value: 'Open Workstation' },
  { value: 'Enclose Manager Office' },
  { value: 'Phone Booth' },
  { value: 'Interview Room' },
  // { value: 'Small Meeting Room' },
  // { value: 'Medium Meeting Room' },
  // { value: 'Large Meeting Room' },
  // { value: 'Conference Room' },
  // { value: 'Townhall' },
  // { value: 'Pantry' },
  // { value: 'Canteen' },
  // { value: 'Collaboration Area' },
  // { value: 'Storage Room' },
  // { value: 'IT Room' },
  // { value: 'Reception Lobby' },
  // { value: 'Recreation Area' },
  // { value: 'Staff Welfare' },
  // { value: 'R&D Lab' },
  // { value: 'Theatre' },
]);
const remainingSpace = ref([]); // The remaining space that the user can choose to add
const currentSpaceDetails = ref([ // The current selected space with the details
  { name: { value: 'Open Workstation' }, count: '', totalSpace: '' },
  { name: { value: 'Enclose Manager Office' }, count: '', totalSpace: '' },
  // { name: { value: 'Interview Room' }, count: '', totalSpace: '' },
  // { name: { value: 'Small Meeting Room' }, count: '', totalSpace: '' },
  // { name: { value: 'Medium Meeting Room' }, count: '', totalSpace: '' },
  // { name: { value: 'Large Meeting Room' }, count: '', totalSpace: '' },
]);
const unitListing = ref([ // The value use to show in the dropdown for the available unit
  { value: 'Square Meter (sqm)', acronym: 'sqm' },
  { value: 'Square Feet (sqft)', acronym: 'sqft' },
]);
const selectedUnit = ref({ value: 'Square Feet (sqft)', acronym: 'sqft' }); // The default value of the unit
const spaceLocation = ref(''); // The location of the space
const newlySelectedSpace = ref(null);
//#endregion Data

//#region Methods
const addSpaceClicked = () => { // When adding a new space
  showAddPopup.value = true;

  getRemainingSpace();
}
const spaceDetailsClicked = () => {
  alert('Later in the future you can click to view or edit details, now not yet.');
}
const closeClicked = () => {
  console.log(currentSpaceDetails.value);
}
const addNewSpaceClicked = () => { // When adding a new details to the space
  currentSpaceDetails.value.push({
    name: newlySelectedSpace.value, count: '', totalSpace: ''
  });

  newlySelectedSpace.value = null;

  getRemainingSpace();
}
const deleteSpaceDescription = (ind) => {
  currentSpaceDetails.value.splice(ind, 1);
  getRemainingSpace();
}
const getRemainingSpace = () => {
  remainingSpace.value = allSpaceDetails.value.filter(s => !currentSpaceDetails.value.find(c => s.value == c.name.value));
}
//#endregion Methods
</script>

<style scoped>
.space-main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.add-space-button {
  width: fit-content;
  align-self: flex-end;
}
.space-container {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: auto;
  margin-top: 10px;
}
.space-details {
  display: flex;
  flex-direction: column;
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}
.space-details:not(:first-child) {
  margin-top: 10px;
}
.space-title {
  font-size: 1.2em;
  font-weight: bold;
}
.space-description-container {
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.space-details-container {
  border: 1px solid gray;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
}
.space-count {
  display: flex;
  align-items: center;
  column-gap: 10px;
}
.space-count > :first-child {
  width: 40%;
}
.space-count > :not(:first-child) {
  margin-top: 5px;
}
.new-space-container > :not(:first-child), .space-details-container > :not(:first-child) {
  margin-top: 5px;
}
.space-description {
  display: flex;
  align-items: center;
}
.space-description > div {
  font-weight: bold;
  font-size: 1.1em;
  width: 100%;
}
.space-description > img {
  height: 20px;
  cursor: pointer;
}
</style>