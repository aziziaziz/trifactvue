<template>
  <div class="floor-plan-main">
    <!-- This is the container to select the floor plan image -->
    <div v-if="!floorPlanImageBlob" class="plan-container">
      <div>There are no floor plan added. Please select an image to the floor plan.</div>
      <input type="file" accept="image/*" @change="floorPlanImageChanged" ref="floorPlanImageInput">
    </div>
    <!-- When loading the img src -->
    <Loader v-else-if="floorPlanImageLoading" text="Loading Image" />
    <!-- This is the container to add the pointer -->
    <div v-show="floorPlanImageBlob && !floorPlanImageLoading" class="plan-container" ref="planContainerEl" @click="addPointer">
      <img class="floor-plan-image" :src="floorPlanImageBlob"
        ref="floorPlanImageEl" @load="fullPlanImageLoaded">
      <div v-for="(pt,ptInd) in allPointers" :key="ptInd" class="pointer-container" :style="{
          height: `${planContainerSize * pointerScale}px`,
          width: `${planContainerSize * pointerScale}px`,
          top: getPosition(pt.top, true),
          left: getPosition(pt.left, false) }" @click="pointerSelectedIndex = ptInd">
        <img src="../assets/plan/pointer.png" :style="{ transform: `rotate(${Number(pt.rotate) + 90}deg)` }">
        <div class="pointer-text" :style="{ fontSize: `${planContainerSize * pointerTextScale}px` }">{{ ptInd + 1 }}</div>
        <!-- Below is for the pointer rotation -->
        <div v-if="pointerSelectedIndex == ptInd" class="pointer-rotation" :style="{ transform: `scale(${planContainerSize * (pointerTextScale / 12)})`,
          opacity: rotationChanging ? 0.2 : 1 }">
          <div>Rotation</div>
          <input type="range" min="-180" max="180" v-model="pt.rotate" @mousedown="rotationChanging = true" @mouseup="rotationChanging = false">
          <img class="close-rotation" src="../assets/input/clear.png" @click="closeRotationClicked">
          <Button theme="danger">Delete Pointer</Button>
        </div>
      </div>
    </div>

    <!-- This is the container on the right side -->
    <div class="plan-image-container">
      Right side
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fileToImgSrc } from '../js/helper';

//#region Data
const pointerScale = ref(0.05); // The scale of the pointer based on the plan container size
const pointerTextScale = ref(0.021739130434783); // The scale of the pointer text
const planContainerSize = ref(0); // This is the size of the plan container (height/width which is smaller)
const planContainerEl = ref(null); // The element reference of the plan container
const floorPlanImageEl = ref(null); // The element reference of the floor plan image
const allPointers = ref([]); // The list of the pointers to show
const floorPlanImage = ref(null); // The image of the floor plan
const floorPlanImageBlob = ref(null); // The blob image to assign to the img src
const floorPlanImageInput = ref(null); // The input of the floor plan image
const floorPlanImageLoading = ref(false); // When loading the image chosed
const pointerSelectedIndex = ref(-1); // The index of the selected pointer
const rotationChanging = ref(false); // When the user changing the rotation

const imageContainerHeight = ref(0);
const imageContainerWidth = ref(0);
const actualImageHeight = ref(0);
const actualImageWidth = ref(0);
const newImageHeight = ref(0);
const newImageWidth = ref(0);
const topImagePadding = ref(0);
const leftImagePadding = ref(0);
//#endregion Data

//#region Methods
const planContainerSizeChanged = (e) => {
  // Get the width and height of the plan container
  let containerHeight = e[0].contentRect.height;
  let containerWidth = e[0].contentRect.width;

  // Set the plan container size based on the height and width, whichever is lower
  planContainerSize.value = Math.min(containerHeight, containerWidth);

  // Calculate the margin of the image
  calculateImageMargin();
}
const addPointer = (e) => {
  // Making sure that the plan container is clicked
  if (Array.from(e.target.classList).includes('floor-plan-image')) {
    // Setting the x and y
    let x = e.offsetX - leftImagePadding.value;
    let y = e.offsetY - topImagePadding.value;
  
    // Add the pointer
    allPointers.value.push({
      left: x / newImageWidth.value * 100, // The left position in percentage
      top: y / newImageHeight.value * 100, // The top position in percentage
      rotate: 0
    });

    // Set the selected index to the latest pointer
    pointerSelectedIndex.value = allPointers.value.length - 1;
  }
}
const fullPlanImageLoaded = () => {
  console.log('loading done');
  floorPlanImageLoading.value = false;
  calculateImageMargin();
}
const calculateImageMargin = () => {
  // The size of the image container
  imageContainerWidth.value = floorPlanImageEl.value.getBoundingClientRect().width;
  imageContainerHeight.value = floorPlanImageEl.value.getBoundingClientRect().height;

  // The size of the actual image
  actualImageWidth.value = floorPlanImageEl.value.naturalWidth;
  actualImageHeight.value = floorPlanImageEl.value.naturalHeight;

  // The ratio of the image container and the actual image
  let imageContainerRatio = imageContainerWidth.value / imageContainerHeight.value;
  let actualImageRatio = actualImageWidth.value / actualImageHeight.value;

  // Set the padding to 0
  topImagePadding.value = 0;
  leftImagePadding.value = 0;

  // Checking the image ratio
  if (imageContainerRatio < actualImageRatio) {
    // Set a new height and width based on the actual image ratio
    newImageWidth.value = imageContainerWidth.value;
    newImageHeight.value = newImageWidth.value / actualImageRatio;

    // Setting the top padding
    topImagePadding.value = (imageContainerHeight.value - newImageHeight.value) / 2;
  } else {
    // Set a new height and width based ont he actual image ratio
    newImageHeight.value = imageContainerHeight.value;
    newImageWidth.value = newImageHeight.value * actualImageRatio;

    // Setting the left padding
    leftImagePadding.value = (imageContainerWidth.value - newImageWidth.value) / 2;
  }
}
const getPosition = (perc, fromTop) => {
  // Checking if fromTop is true indicating that it is for the top position
  let midPosition = (planContainerSize.value * pointerScale.value) / 2;

  if (fromTop) {
    // Getting the value in px based on the percentage
    let top = perc / 100 * newImageHeight.value;

    // Return the top plus with the top padding
    return `${top + topImagePadding.value - midPosition}px`;
  } else {
    // Getting the value in px based on the percentage
    let left = perc / 100 * newImageWidth.value;

    // Return the left plus with the left padding
    return `${left + leftImagePadding.value - midPosition}px`;
  }
}
const floorPlanImageChanged = async (e) => {
  floorPlanImageLoading.value = true;
  // Assign the file
  floorPlanImage.value = e.target.files[0];
  // Get the img src
  floorPlanImageBlob.value = await fileToImgSrc(e.target.files[0]);
}
const closeRotationClicked = (e) => {
  e.stopPropagation();
  pointerSelectedIndex.value = -1;
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  // Listening to the plan container size change
  if (planContainerEl.value) {
    new ResizeObserver(planContainerSizeChanged).observe(planContainerEl.value);
  }
});
//#endregion Lifecycle
</script>

<style scoped>
.floor-plan-main {
  display: flex;
  height: 100%;
  width: 100%;
}
.plan-container {
  width: 40%;
  height: 100%;
  /* background-color: red; */
  position: relative;
  max-width: 40%;
}
.plan-image-container {
  width: 60%;
  height: 100%;
  margin-left: 10px;
  /* background-color: blue; */
}
.pointer-container {
  cursor: pointer;
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 3; /* must be height than .floor-plan-image */
  display: flex;
  justify-content: center;
}
.pointer-container > img {
  transform: rotate(90deg);
  height: 100%;
  width: 100%;
}
.pointer-container > .pointer-text {
  text-align: center;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.floor-plan-image {
  z-index: 2; /* Must be lower than .pointer-container */
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  object-fit: contain;
}
.pointer-rotation {
  position: absolute;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 5px;
  top: 100%;
  opacity: 0.5;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
  transform-origin: 50% 0;
}
.pointer-rotation:hover {
  opacity: 1;
}
.close-rotation {
  position: absolute;
  cursor: pointer;
  height: 20%;
  right: 5px;
}
.pointer-rotation > Button {
  padding: 5px 10px;
  font-size: 0.8em;
  width: fit-content;
}
</style>