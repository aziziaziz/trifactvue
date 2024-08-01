import { createStore } from 'vuex'

export default createStore({
  state: {
    currentLocation: null,
    allLocation: [
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
    ],
    unitListing: [
      { value: 'Square Meter (sqm)', acronym: 'sqm' },
      { value: 'Square Feet (sqft)', acronym: 'sqft' },
    ]
  },
  mutations: {
    updateLocation (state, payload) {
      let location = state.allLocation.find(l => l.location == payload.location);
      let locationIndex = state.allLocation.findIndex(l => l.location == payload.location);

      location.description = payload.description;
      state.allLocation.splice(locationIndex, 1, location);
    },
    insertLocation (state, loc) {
      state.allLocation.push(loc);
    }
  },
  actions: {
  },
  modules: {
  }
})
