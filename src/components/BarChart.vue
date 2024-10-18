<template>
  <div class="bar-chart-main">
    <div class="chart-title">Title</div>
    <div class="bar-chart-container" ref="barChartEl">
      <!-- The y axis -->
      <div class="y-axis-line" :style="{ top: `${yAxisTop}px`, height: `calc(100% - ${yAxisBottom - yAxisTop}px)`, left: `${yAxisLeft}px` }">
        <div v-for="(y,yInd) in yAxisValues" :key="yInd" class="y-axis-value" :style="{ top: `${y.top}px` }">
          <div :style="{ transform: y.value == 0 ? `translate(calc(-100% - 3px), 100%)` : '' }">{{ y.value }}</div>
        </div>
      </div>

      <!-- The x axis -->
      <div class="x-axis-line" :style="{ top: `${xAxisLinePosition}px` }"></div>

      <!-- The container holder all the bars -->
      <div class="bar-container" :style="getBarContainerStyle()">
        <div v-for="(b,bInd) in barData" :key="bInd" class="bar-item" :style="{
          height: `${b.height}px`,
          transform: b.value < 0 ? `translateY(calc(100% + 3px))` : '',
          opacity: isBarHover(bInd) ? '1' : '0.4' }"
          @mouseover="barHoverIndex = bInd" @mouseleave="barHoverIndex = -1">
          <div class="bar-value-text" :style="{
            top: b.value < 0 ? 'calc(100% + 3px)' : '',
            transform: b.value >= 0 ? `translateY(calc(-100% - 3px))` : '',
            opacity: isBarHover(bInd) ? '1' : '0.4',
            fontWeight: isBarHover(bInd) ? 'bold' : 'normal' }">{{ b.value }}</div>
          <div class="bar-value-text bar-name small-bar-name" :style="{
            top: b.value < 0 ? '0' : 'calc(100% + 5px)',
            transform: b.value < 0 ? 'translateY(calc(-100% - 5px))' : '',
            whiteSpace: barHoverIndex == bInd ? (isBarHover(bInd) ? '' : 'nowrap') : 'nowrap' }">{{ b.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

//#region Data
const barData = ref([
  { name: "Liam Smith", value: 128.7 },
  { name: "Jane", value: 165.6 },
  { name: "Olivia Brown", value: 30500.4 },
  { name: "Noah Davis", value: 0 },
  { name: "Emma Wilson long", value: -450.0 },
  { name: "Ava Garcia", value: 250.3 },
  { name: "Isabella Martinez", value: 520 },
  { name: "Lucas Rodriguez", value: -389.1 },
  { name: "Mia Lee", value: 487.5 },
  { name: "Elijah Perez", value: 320.2 },
  { name: "Sophia Taylor", value: 165.6 },
  { name: "Bob name is a little bit longer than anyone else ab", value: 89 }
]);
const barChartEl = ref(null);
const barHoverIndex = ref(-1);

const yAxisTop = ref(10);
const yAxisBottom = ref(40);
const yAxisLeft = ref(50);
const yAxisValues = ref([]);

const xAxisLinePosition = ref(0);
const bottomLinePosition = ref(0);
//#endregion Data

//#region Methods
const calculateBarInterval = () => {
  // Getting the size of the container element
  let containerHeight = barChartEl.value.getBoundingClientRect().height;

  // Getting the max and min value
  let maxValue = Math.max(...barData.value.map(b => b.value));
  let minValue = Math.min(...barData.value.map(b => b.value));

  // Set the intervals values
  yAxisValues.value = getYAxisValues(minValue, maxValue, containerHeight);

  // Calculate each of the bar height
  calculateBarHeight();
}
const getYAxisValues = (minValue, maxValue, containerHeight) => {
  // Closest minimum value to multiple of 5
  let min = Math.floor(minValue / 5) * 5;
  // Closest maximum value to multiple of 5
  let max = Math.ceil(maxValue / 5) * 5;

  // Set the min to 0 if it is more than 0
  if (min > 0) {
    min = 0;
  }

  // Get the range from the max to min
  let range = max - min;

  // Get the interval closest to higher multiple of 5
  let interval = range / 8;
  interval = Math.ceil(interval / 5) * 5;

  // Init the interval arrays
  let intervalArray = [ 0 ];
  
  // Create the negative intervals
  let start = 0;
  while (start > min) {
    start -= interval
    intervalArray.push(start);
  }

  // Create the positive intervals
  start = 0;
  while (start < max) {
    start += interval;
    intervalArray.push(start);
  }

  // Sort the intervals in descending order
  intervalArray.sort((a,b) => b - a);

  // Calculating the y axis height
  let topPosition = yAxisTop.value;
  let bottomPosition = containerHeight - yAxisTop.value;
  let yAxisHeight = bottomPosition - topPosition;

  // Calculate each interval position
  let intervalGap = yAxisHeight / intervalArray.length;
  let top = topPosition;
  intervalArray = intervalArray.map(i => {
    // Creating the interval object
    let obj = {
      value: i,
      top: top
    };
    
    // Add the top with the interval gap
    top += intervalGap;

    return obj;
  });

  // Getting the x axis position
  let xAxisPosition = intervalArray.find(i => i.value == 0);
  xAxisLinePosition.value = xAxisPosition.top + yAxisTop.value;

  // Setting the most bottom line position
  let lastPosition = intervalArray.at(-1);
  bottomLinePosition.value = lastPosition.top;

  return intervalArray;
}
const calculateBarHeight = () => {
  // Get the most top and bottom value
  let topValue = yAxisValues.value[0].value;
  let bottomValue = yAxisValues.value.at(-1).value;

  // Getting the top and bottom section height
  let topHeight = xAxisLinePosition.value - yAxisTop.value - 10;
  let bottomHeight = bottomLinePosition.value - xAxisLinePosition.value + 10;

  // Calculate the height in percentage
  barData.value.forEach(b => {
    if (b.value < 0) {
      b.height = b.value / bottomValue * bottomHeight;
    } else {
      b.height = b.value / topValue * topHeight;
    }
  });
}
const getBarContainerStyle = () => {
  // Use the left and top based on the y axis line
  let top = yAxisTop.value * 2;
  let left = yAxisLeft.value + 20;

  // Calculate the width based on the left value
  let width = `calc(100% - ${left + 30}px)`;
  // Calculate the height based on the x axis position
  let height = `${xAxisLinePosition.value - top}px`;

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: width,
    height: height
  };
}
const isBarHover = (ind) => {
  // If -1 or index same as the hover index, then true to show full opacity
  if (barHoverIndex.value == -1 || ind == barHoverIndex.value) {
    return true;
  } else {
    return false;
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  calculateBarInterval();
});
//#endregion Lifecycle
</script>

<style scoped>
.bar-chart-main {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  height: 100%;
  width: 100%;
}
.chart-title {
  font-weight: bold;
  text-align: center;
  width: 100%;
}
.bar-chart-container {
  height: 100%;
  position: relative;
  /* background-color: red; */
}
.y-axis-line {
  top: 10px;
  left: 40px;
  width: var(--bar-line-thick);
  background-color: black;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.x-axis-line {
  width: calc(100% - 20px);
  height: var(--bar-line-thick);
  background-color: black;
  position: absolute;
  left: 10px;
}
.y-axis-value {
  position: absolute;
  background-color: black;
  height: var(--bar-line-thick);
  width: 20px;
  display: flex;
  align-items: center;
}
.y-axis-value > div {
  transform: translateX(calc(-100% - 3px));
  font-size: 0.8em;
}
.bar-container {
  /* background-color: green; */
  position: relative;
  height: 100px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  column-gap: 10px;
}
.bar-item {
  height: 200px;
  width: 100%;
  background-color: blue;
  position: relative;
  bottom: 0;
  transition: 0.3s;
}
.bar-value-text {
  width: 100%;
  text-align: center;
  position: relative;
  font-size: 0.8em;
  transition: 0.3s;
}
.bar-name {
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  padding: 0 5px;
  transition: 0.3s;
}
</style>