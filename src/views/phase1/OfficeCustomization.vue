<template>
  <div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';

//#region Data
const allSpaces = ref([ // The spaces that are available for the user
  {
    "location": "KLCC",
    "unit": "sqft",
    "description": [
      { "name": { "value": "Open Workstation" }, "count": "7", "totalSpace": "300" },
      { "name": { "value": "Enclose Manager Office" }, "count": "3", "totalSpace": "250" },
      { "name": { "value": "Small Meeting Room" }, "count": "5", "totalSpace": "800" },
      { "name": { "value": "Medium Meeting Room" }, "count": "3", "totalSpace": "800" },
      { "name": { "value": "Large Meeting Room" }, "count": "1", "totalSpace": "400"  }
    ]
  },
  {
    "location": "Test",
    "unit": "sqm",
    "description": [
      { "name": { "value": "Open Workstation" }, "count": "15", "totalSpace": "1000" },
      { "name": { "value": "Large Meeting Room" }, "count": "1", "totalSpace": "400"  }
    ]
  }
]);
//#endregion Data
</script>

<style scoped>

</style>