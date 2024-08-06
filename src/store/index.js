import { createStore } from 'vuex'

export default createStore({
  state: {
    currentLocation: null,
    unitListing: [
      { value: 'Square Meter (sqm)', acronym: 'sqm' },
      { value: 'Square Feet (sqft)', acronym: 'sqft' },
    ]
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
