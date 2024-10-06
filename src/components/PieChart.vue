<template>
  <div class="pie-title">{{ props.title }}</div>
  <div v-if="chartMessage" class="chart-message">{{ chartMessage }}</div>
  <div v-else class="pie-chart-main">
    <div class="pie-container">
      <svg class="svg-container" :viewBox="`-${svgSize / 2} -${svgSize / 2} ${svgSize} ${svgSize}`" xmlns="http://www.w3.org/2000/svg" ref="svgEl">
        <g transform="rotate(-90)">
          <circle class="pie-arc" v-for="(it,itInd) in pieItem" :key="itInd" :r="pieSize / 4" :stroke="it.color" :stroke-width="pieSize / 2" pathLength="360" :stroke-dasharray="it.dashArray" fill="none"
            @mouseover="hoverIndex = itInd" @mouseout="hoverIndex = -1" />
        </g>
      </svg>
       <div v-for="(it,itInd) in pieItem" :key="itInd" class="pie-text" :style="{
        top: `${svgHeight * 0.1}px`,
        fontSize: `${svgHeight * 0.0375}px`,
        color: `${it.textColor}`,
        transform: `rotate(${it.midAngle}deg)`,
        opacity: it.angle > 20 ? 1 : (hoverIndex == itInd ? 1 : 0),
        transformOrigin: `${svgHeight / 2}px ${svgHeight * 0.4}px` }">{{ it.percentage }}%</div>
    </div>
    <div class="pie-legends">
      <div v-for="(it,itInd) in pieItem" :key="itInd" class="legend-items">
        <div class="legend-color" :style="{ backgroundColor: pieColors[itInd].color }"></div>
        <div class="legend-text" :style="{ fontWeight: hoverIndex == itInd ? 'bold' : 'normal' }">{{ it.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, defineProps } from 'vue';
import { ref } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Title' }, // To set the title name of the pie chart
  item: { type: Array, default: () => { return [] } }, // The item for the chart
});

//#region Data
const svgSize = ref(500);
const pieSize = ref(0);
const pieColors = ref([
  { "color": "#FF0000", "text": "#000000" },  // Red
  { "color": "#00FF00", "text": "#000000" },  // Green
  { "color": "#0000FF", "text": "#FFFFFF" },  // Blue
  { "color": "#FFFF00", "text": "#000000" },  // Yellow
  { "color": "#00FFFF", "text": "#000000" },  // Cyan
  { "color": "#FF00FF", "text": "#FFFFFF" },  // Magenta
  { "color": "#FFA500", "text": "#000000" },  // Orange
  { "color": "#800080", "text": "#FFFFFF" },  // Purple
  { "color": "#FFC0CB", "text": "#000000" },  // Pink
  { "color": "#A52A2A", "text": "#FFFFFF" },  // Brown
  { "color": "#808080", "text": "#FFFFFF" },  // Gray
  { "color": "#000000", "text": "#FFFFFF" },  // Black
  { "color": "#87CEEB", "text": "#000000" },  // Sky Blue
  { "color": "#FFD700", "text": "#000000" },  // Gold
  { "color": "#C0C0C0", "text": "#000000" },  // Silver
  { "color": "#008080", "text": "#FFFFFF" },  // Teal
  { "color": "#000080", "text": "#FFFFFF" },  // Navy
  { "color": "#808000", "text": "#FFFFFF" },  // Olive
  { "color": "#FF7F50", "text": "#000000" },  // Coral
  { "color": "#00FF00", "text": "#000000" },  // Lime
  { "color": "#E6E6FA", "text": "#000000" },  // Lavender
  { "color": "#4B0082", "text": "#FFFFFF" },  // Indigo
  { "color": "#FFDAB9", "text": "#000000" },  // Peach
  { "color": "#98FF98", "text": "#000000" }   // Mint
]
);
const hoverIndex = ref(-1);
const svgEl = ref(null);
const svgHeight = ref(0);
const pieItem = ref([ // The default of the pie item
  // { "name": "Apple", "count": 25 },
  // { "name": "Banana", "count": 25 },
  { "name": "Apple", "count": 23 },
  { "name": "Banana", "count": 24 },
  { "name": "Cherry", "count": 15 },
  { "name": "Mango", "count": 32 },
  { "name": "Orange", "count": 28 },
  { "name": "Grape", "count": 12 },
  { "name": "Pineapple", "count": 39 },
  { "name": "Strawberry", "count": 8 },
  { "name": "Kiwi", "count": 26 },
  { "name": "Watermelon", "count": 31 },
  { "name": "Dragon Fruit", "count": 31 },
  { "name": "This is a very long fruit name", "count": 31 },
]);
const chartMessage = ref(''); // The message to show for the chart (used when the chart could not be generated)
//#endregion Data

//#region Methods
const svgSizeChanged = (e) => {
  svgHeight.value = e[0].contentRect.height;
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  // The pie size is 90% of the svg container
  pieSize.value = svgSize.value * 0.9;

  if (props.item.length > 0) {
    pieItem.value = props.item;
  }

  // Get the total of the item count
  let total = pieItem.value.map(i => i.count).reduce((a,b) => a + b, 0);
  // Checking if the total is 0
  if (total == 0) {
    chartMessage.value = 'Could not generated pie chart as the total is 0';
  } else if (total < 0) {
    chartMessage.value = 'Could not generated pie chart as the total is below 0';
  }

  // Reformat the items to put the angle and for the dasharray
  let currentAngle = 0;
  pieItem.value.forEach((i,ind) => {
    // The start is always at 0
    let start = 0;
    // Getting the angle by getting the count / by total * 360 (total circle angle)
    let angle = i.count / total * 360;
    // For stop, total circle angle - start - angle - currentangle
    let stop = Number((360 - currentAngle - start - angle).toFixed(10));
    // Getting the midpoint angle
    let midAngle = (start + angle) / 2;
    // Getting the percentage
    let perc = i.count / total * 100;

    i['dashArray'] = `${start} ${currentAngle} ${angle} ${stop}`;
    i['color'] = pieColors.value[ind].color;
    i['textColor'] = pieColors.value[ind].text;
    i['midAngle'] = midAngle + currentAngle;
    i['percentage'] = Math.round(perc);
    i['angle'] = angle;

    // Add the angle to make sure the next one is added properly
    currentAngle += angle;
  });
  
  new ResizeObserver(svgSizeChanged).observe(svgEl.value);
});
//#endregion Lifecycle
</script>

<style scoped>

.pie-container {
  width: 100%;
  position: relative;
}
.svg-container {
  background-color: transparent;
}
.pie-arc {
  transition: 0.3s;
}
.pie-arc:hover {
  transform: scale(1.1);
}
.pie-text {
  width: 100%;
  position: absolute;
  text-align: center;
  pointer-events: none;
}
.pie-chart-main {
  display: flex;
}
.legend-items {
  display: flex;
  column-gap: 5px;
  margin-bottom: 5px;
  align-items: center;
}
.legend-color {
  height: 20px;
  width: 20px;
  min-width: 20px;
  max-width: 20px;
  min-height: 20px;
  max-height: 20px;
}
.pie-legends {
  max-width: 200px;
}
.pie-title {
  font-weight: bold;
  font-size: 1.1em;
  width: 100%;
  text-align: center;
}
.chart-message {
  font-style: italic;
  text-align: center;
}
</style>