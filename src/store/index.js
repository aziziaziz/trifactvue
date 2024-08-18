import { createStore } from 'vuex'

export default createStore({
  state: {
    currentClient: null, // The current location that user selected from the home page
    spaceListing: [], // The listing of the space that gotten from DB
    unitListing: [ // The fix unit listing for now
      { value: 'Square Meter (sqm)', acronym: 'sqm' },
      { value: 'Square Feet (sqft)', acronym: 'sqft' },
    ]
  },
  mutations: {
    showPopup () {} // Nothing in this mutation since it is acting as a global event handler only
  },
  actions: {
  },
  modules: {
  }
})
