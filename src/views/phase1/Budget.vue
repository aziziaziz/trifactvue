<template>
  <Loader v-if="loadingBudget" text="Loading Budget" />
  <div v-else>
    <table class="top-table">
      <tr>
        <td>Project Location</td>
        <td>{{ store.state.currentClient.project_location }}</td>
        <td>Date Prepared</td>
        <td>{{ dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss') }}</td>
      </tr>
      <tr>
        <td>Project Description</td>
        <td>{{ store.state.currentClient.project_desc }}</td>
        <td>Completion Date</td>
        <td></td>
      </tr>
      <tr>
        <td>Budget Contingency</td>
        <td>{{ store.state.currentClient.budget_contingency }} %</td>
        <td>Local Currency</td>
        <td>{{ store.state.currentClient.local_ccy }}</td>
      </tr>
      <tr>
        <td>Total Area</td>
        <td>
          <input />
        </td>
        <td>Exchange Rate</td>
        <td>{{ exchangeRate }}</td>
      </tr>
      <tr>
        <td>Area Unit</td>
        <td>{{ store.state.currentClient.sqm_sqft }}</td>
      </tr>
      <tr>
        <td>Tax Percentage</td>
        <td></td>
      </tr>
    </table>

    <div class="budget-main-section">
      <table class="main-budget-table">
        <template v-for="(budget,budgetInd) in budgetListing" :key="budgetInd">
          <tr>
            <th class="category-header" colspan="8">{{ budget.category }}</th>
          </tr>
          <div class="sub-category-section" v-for="(sub,subInd) in budget.details" :key="subInd">
            <tr>
              <th>{{ sub.subCategory }}</th>
              <th>Unit Rate</th>
              <th>Size</th>
              <th>Functional Area</th>
              <th>Local Currency</th>
              <th>Home Currency</th>
              <th>Cost/SM or SF (Local Currency)</th>
              <th>Cost/SM or SF (Home Currency)</th>
            </tr>
            <tr v-for="(dets,detsInd) in sub.details" :key="detsInd">
              <td>
                <div class="budget-name">{{ dets.budget_name }}</div>
                <div v-if="dets.budget_description" class="budget-desc">{{ dets.budget_description }}</div>
              </td>
              <td> <!-- Unit Rate -->
                <input v-model="dets.unitRateValue" />
              </td>
              <td> <!-- Size -->
                <input v-model="dets.sizeValue" />
              </td>
              <td> <!-- Functional Area -->
                <input v-model="dets.functionalAreaValue" />
              </td>
              <td> <!-- Local Currency -->
                {{ getLocalCurrencyValue(dets.unitRateValue, dets.sizeValue) }}
              </td>
              <td> <!-- Home Currency -->
                {{ getLocalCurrencyValue(dets.unitRateValue, dets.sizeValue, true) }}
              </td>
              <td> <!-- Cost/SM or SF (Local Currency) -->
                {{ dets.unitRateValue }}
              </td>
              <td> <!-- Cost/SM or SF (Home Currency) -->
                {{ getUnitRateConvertedValue(dets.unitRateValue) }}
              </td>
            </tr>
          </div>
        </template>
      </table>
    </div> 
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get } from '../../js/apiCall';
import { dateFormat } from '../../js/helper';

const store = useStore();
const router = useRouter();

//#region Data
const budgetListing = ref([]); // The list of the budget to show
const loadingBudget = ref(false); // When the budget is loading
const exchangeRate = ref(4.2); // The exchange rate from the local to home ccy (Hardcode for now until the API for conversion is done)
//#endregion Data

//#region Methods
const getLocalCurrencyValue = (unitRate, size, isHomeCcy) => {
  if (unitRate && !isNaN(Number(unitRate)) && size && !isNaN(Number(size))) {
    let value = Number(unitRate) * Number(size);
    // If home ccy, need to convert to the home currency
    if (isHomeCcy) {
      // Returning the unitRate * size for the home ccy
      return value * exchangeRate.value;
    } else {
      // Returning the unitRate * size only (local ccy)
      return value;
    }
  } else {
    // Returning empty string
    return '';
  }
}
const getUnitRateConvertedValue = (unitRate) => {
  // Check if the unitrate is empty
  if (unitRate && !isNaN(Number(unitRate))) {
    // Return the unit rate with the exchange rate
    return Number(unitRate) * exchangeRate.value;
  } else {
    // Returning empty string
    return '';
  }
}
//#endregion Methods

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    loadingBudget.value = true;
    // Get the budget based on the client
    budgetListing.value = await get(`Budget/GetAllBudgetClientList?client_uid=${store.state.currentClient.client_uid}`);

    // Checking if there is no saved budget for the current client
    if (budgetListing.value.length == 0) {
      budgetListing.value = await get('Budget/GetAllBudgetList');
    }

    // Putting all the value for the inputs
    budgetListing.value.forEach(b => {
      b.unitRateValue = '';
      b.sizeValue = '';
      b.functionalAreaValue = '';
    })

    // Grouping by category
    let allCategories = [...new Set(budgetListing.value.map(b => b.category))];
    let groupByCategory = allCategories.map(c => ({
      category: c,
      details: budgetListing.value.filter(b => b.category == c)
    }));

    // Group cateogry details by sub category
    groupByCategory.forEach(group => {
      let allSubCategory = [...new Set(group.details.map(d => d.sub_category))];

      let groupBySub = allSubCategory.map(s => ({
        subCategory: s,
        details: group.details.filter(g => g.sub_category == s)
      }));

      group.details = groupBySub;
    });

    // Set the budget listing to be the one that is grouped
    budgetListing.value = groupByCategory;

    // Close the loading
    loadingBudget.value = false;
  } else {
    // Push back to main page to selected client
    router.push('/Home?choose');
  }
});
//#endregion Lifecycle
</script>

<style scoped>
.top-table, .main-budget-table {
  border-collapse: collapse;
  width: 100%;
}
.top-table tr td, .main-budget-table tr td {
  /* border: 1px solid gray; */
  padding: 5px;
}
.top-table tr td:nth-child(odd) {
  width: 1%;
  white-space: nowrap;
  padding-right: 10px;
}
.category-header {
  text-align: left;
}
.budget-name {
  font-size: 1.1em;
}
.budget-desc {
  font-size: 0.9em;
  font-style: italic;
}
.sub-category-section {
  border: 1px solid gray;
  margin: 5px 0;
}
</style>