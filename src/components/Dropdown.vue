<template>
  <div class="dropdown-main">
    <div class="dropdown-label">{{ placeholder }}</div>
    <div class="dropdown-container" tabindex="0" @keydown="dropdownKeydown" @click="dropdownClicked" @blur="dropdownFocusOut" ref="dropdownContainerEl">
      <div v-if="selectedObject">{{ selectedObject.value }}</div>
      <div v-else class="dropdown-placeholder">Please Select</div>
      
      <img class="dropdown-icon" src="../assets/dropdown/dropdown.png" alt="">
    </div>

    <div v-if="showDropdown" class="dropdown-select-container" ref="dropdownSelectEl">
      <div v-for="(item,ind) in items" :key="ind" class="dropdown-item" @click="itemClicked(item)" @mouseenter="dropdownItemHover = true" @mouseleave="dropdownItemHover = false"
        ref="dropdownItemEl">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, nextTick, watch, onMounted, defineEmits } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [ // Populate the items in the dropdown. Object my contain value key. Containing other keys will not impact the dropdown listing
    { value: 'Dropdown item 1' },
    { value: 'Dropdown item 2' },
    { value: 'Dropdown item 3' }
  ] },
  selected: Object, // The value of the selected object in the dropdown [2WB]
  placeholder: { type: String, default: "Label" }, // To assign the value of the placeholder/label
  position: String, // To default the position of the dropdown. Possible value [bottom, top]
});
const emit = defineEmits([
  'update:selected', // To handle 2 way binding for the selected when selectedObject changes
]);

//#region Data
const showDropdown = ref(false); // To show or hide the dropdown
const dropdownContainerEl = ref(null); // The container for the dropdown
const dropdownItemEl = ref(null); // The element for the dropdown item
const dropdownSelectEl = ref(null); // The container element for the dropdown element
const dropdownItemHover = ref(false); // When hovering on the item to make sure that the item is clickable
const dropdownPositionSet = ref('unset'); // To set the dropdown position either top or bottom based on the screen height
const selectedObject = ref(null); // Private selected object, bind to selected props
//#endregion Data

//#region Methods
const itemClicked = (item) => {
  selectedObject.value = item;
  showDropdown.value = false;

  dropdownContainerEl.value.focus();

  dropdownItemHover.value = false;
}
const dropdownKeydown = async (e) => {
  if (e.key == ' ') {
    e.preventDefault();
    showDropdown.value = !showDropdown.value;
    
    await nextTick();
    if (showDropdown.value) {
      highlightDropdownItem();
    }
  } else if (e.key == 'Enter') {
    showDropdown.value = false;
  } else if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
    e.preventDefault();
    let currentObjectIndex = -1;
    if (selectedObject.value) {
      currentObjectIndex = props.items.findIndex(i => i.value == selectedObject.value.value);
    }
    
    if (e.key == 'ArrowUp') {
      currentObjectIndex--;
    } else if (e.key == 'ArrowDown') {
      currentObjectIndex++;
    }

    if (currentObjectIndex < 0) {
      currentObjectIndex = props.items.length - 1;
    } else if (currentObjectIndex >= props.items.length) {
      currentObjectIndex = 0;
    }

    selectedObject.value = props.items[currentObjectIndex];

    if (showDropdown.value) {
      highlightDropdownItem(currentObjectIndex);
    }
  }
}
const dropdownClicked = async () => {
  showDropdown.value = !showDropdown.value;
  await nextTick();
  highlightDropdownItem();
}
const dropdownFocusOut = () => {
  if (!dropdownItemHover.value) {
    showDropdown.value = false;
  }
}
const highlightDropdownItem = (ind) => {
  if (selectedObject.value) {
    if (ind === undefined) {
      ind = props.items.findIndex(i => i.value == selectedObject.value.value);
    }
    dropdownItemEl.value.forEach(i => i.classList.remove('dropdown-selected'));
  
    let currentElement = dropdownItemEl.value[ind];
    currentElement.classList.add('dropdown-selected');
    currentElement.scrollIntoView({
      block: 'nearest'
    });
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(() => {
  if (props.selected) {
    selectedObject.value = props.selected;
  }
});
//#endregion Lifecycle

//#region Watchers
watch(showDropdown, async (newVal) => {
  if (newVal) {
    await nextTick();
    if (!props.position) {
      let pageHeight = window.innerHeight;
      let dropdownSelectBottom = dropdownSelectEl.value.getBoundingClientRect().bottom;

      if (pageHeight <= dropdownSelectBottom) {
        dropdownSelectEl.value.classList.add('dropdown-select-container-top');
        dropdownPositionSet.value = 'top';
      }
    } else if (props.position == 'top') {
      dropdownSelectEl.value.classList.add('dropdown-select-container-top');
    }
    
    dropdownSelectEl.value.focus();
  }
})
watch(selectedObject, (val) => {
  // Handle when the selected object changes and update the selected prop for 2 way binding
  emit('update:selected', val);
});
watch(() => props.selected, (val) => {
  selectedObject.value = val;
})
//#endregion Watchers
</script>

<style scoped>
.dropdown-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  /* background-color: red; */
  position: relative;
}
.dropdown-container {
  background-color: rgba(211,211,211,0.2);
  border: 2px solid rgba(211,211,211,0.2);
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  width: 100%;
  min-height: 30px;
  padding: 5px 10px;
  display: flex;
}
.dropdown-container:focus {
  border: 2px solid gray;
  outline: none;
}
.dropdown-placeholder {
  font-style: italic;
  color: gray;
}
.dropdown-select-container {
  position: absolute;
  top: 100%;
  width: 100%;
  max-height: 200px;
  overflow: auto;
  border: 2px solid gray;
  background-color: white;
  z-index: 99;
}
.dropdown-select-container-top {
  top: unset;
  bottom: calc(100% - 20px)
}
.dropdown-item {
  padding: 5px;
  cursor: pointer;
}
.dropdown-selected, .dropdown-item:hover {
  background-color: lightgray;
}
.dropdown-icon {
  height: 50%;
  max-height: 20px;
  position: absolute;
  right: 10px;
}
</style>