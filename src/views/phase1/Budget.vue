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
        <td>
          <input type="date" v-model="projCompletionDate" />
        </td>
      </tr>
      <tr>
        <td>Budget Contingency</td>
        <td>{{ store.state.currentClient.budget_contingency }} %</td>
        <td>Local Currency</td>
        <td>
          <select v-model="selectedLocalCurrency">
            <option value="" disabled>Please Select</option>
            <option v-for="(ccy,ccyInd) in currencyListing" :key="ccyInd" :value="ccy.value">{{ ccy.value }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <td>Total Area</td>
        <td>
          <input v-model="projTotalArea" />
        </td>
        <td>Home Currency</td>
        <td>
          <select v-model="selectedHomeCurrency">
            <option value="" disabled>Please Select</option>
            <option v-for="(ccy,ccyInd) in currencyListing" :key="ccyInd" :value="ccy.value">{{ ccy.value }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <td>Area Unit</td>
        <td>{{ store.state.currentClient.sqm_sqft }}</td>
        <td>Exchange Rate</td>
        <td>{{ exchangeRateText }}</td>
      </tr>
      <tr>
        <td>Tax Percentage</td>
        <td></td>
      </tr>
    </table>

    <div class="budget-main-section">
      <table class="main-budget-table">
        <tr v-for="(bud,budInd) in budgetListing" :key="budInd" class="main-budget-row">
          <th v-if="bud.type == 'category' || bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col1 }}</th>
          <td v-else>
            <div class="budget-name">{{ bud.col1.split('\n')[0] }}</div>
            <div v-if="bud.col1.split('\n')[1]" class="budget-desc">{{ bud.col1.split('\n')[1] }}</div>
          </td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col2 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col2">
          </td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col3 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col3">
          </td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col4 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col4">
          </td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col5 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">{{ getLocalCurrencyValue(bud.col2, bud.col3) }}</td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col6 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">{{ getLocalCurrencyValue(bud.col2, bud.col3, true) }}</td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col7 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">{{ (isNaN(Number(bud.col2)) || !bud.col2) ? '' : `${localCurrencyShort} ${Number(bud.col2).toFixed(2)}` }}</td>
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col8 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">{{ getUnitRateConvertedValue(bud.col2) }}</td>
        </tr>
      </table>
    </div> 
  </div>
</template>

<script setup>
/* eslint-disable */
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get } from '../../js/apiCall';
import { dateFormat } from '../../js/helper';

const store = useStore();
const router = useRouter();

//#region Data
const projTotalArea = ref(''); // The total area to be shown at the header of the page
const projCompletionDate = ref(null); // The project completion date
const budgetListing = ref([]); // The list of the budget to show
const loadingBudget = ref(false); // When the budget is loading
const exchangeRate = ref(0); // The exchange rate from the local to home ccy (Hardcode for now until the API for conversion is done)
const currencyListing = ref([]); // The list of the currencies
const selectedHomeCurrency = ref(''); // The selected of the home currency
const homeCurrencyShort = ref(''); // The short of the home currency
const localCurrencyShort = ref(''); // The short of the local currency
const selectedLocalCurrency = ref(''); // The selected of the local currency
const exchangeRateText = ref('0.00'); // The exchange rate to show
//#endregion Data

//#region Methods
const getLocalCurrencyValue = (unitRate, size, isHomeCcy) => {
  if (unitRate && !isNaN(Number(unitRate)) && size && !isNaN(Number(size))) {
    let value = Number(unitRate) * Number(size);
    // If home ccy, need to convert to the home currency
    if (isHomeCcy) {
      // Returning the unitRate * size for the home ccy
      return `${homeCurrencyShort.value} ${(value * exchangeRate.value).toFixed(2)}`;
    } else {
      // Returning the unitRate * size only (local ccy)
      return `${localCurrencyShort.value} ${value.toFixed(2)}`;
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
    return `${homeCurrencyShort.value} ${(Number(unitRate) * exchangeRate.value).toFixed(2)}`;
  } else {
    // Returning empty string
    return '';
  }
}
const getExchangeRate = async () => {
  // Checking if the current client has both local and home ccy selected
  if (selectedHomeCurrency.value && selectedLocalCurrency.value) {
    // Getting the currency code of the local and home ccy
    localCurrencyShort.value = currencyListing.value.find(c => c.value == selectedLocalCurrency.value)?.currency_code;
    homeCurrencyShort.value = currencyListing.value.find(c => c.value == selectedHomeCurrency.value)?.currency_code;

    // Show something like loading
    exchangeRateText.value = 'Getting Rates . . .';
    exchangeRate.value = 0;

    // Getting the current exchange rate and assign to exchange rate and text
    exchangeRate.value = await get(`Currency/GetCurrencyRate?base_currency=${localCurrencyShort.value}&target_currency=${homeCurrencyShort.value}`);
    exchangeRateText.value = `${exchangeRate.value.toFixed(4)} (${localCurrencyShort.value} to ${homeCurrencyShort.value})`;
  } else {
    // Setting default value for the rates and text
    exchangeRate.value = 0;
    exchangeRateText.value = '0.00';
  }
}
const generateTableObj = (col1,col2,col3,col4,col5,col6,col7,col8) => {
  // This will return all the 8 columns with the type
  return {
    col1: col1 || '', // The category, subCategory or budget name
    col2: col2 || '', // unit rate
    col3: col3 || '', // Size
    col4: col4 || '', // Functional are
    col5: col5 || '', // local currency
    col6: col6 || '', // Home Currency
    col7: col7 || '', // Cost (Local)
    col8: col8 || '', // Cost (Home)
    type: '' // Can be category, subCategory or details
  };
}
//#endregion Methods

//#region Watcher
watch(selectedHomeCurrency, () => {
  getExchangeRate();
});
watch(selectedLocalCurrency, () => {
  getExchangeRate();
});
//#endregion Watcher

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    // Populating the currency listing
    currencyListing.value = store.state.currencyListing;

    // Set the loading to true
    loadingBudget.value = true;

    // Getting all the space requirements to get the total area
    let spaces = await get(`Space/SpaceRequirements?client_uid=${store.state.currentClient.client_uid}`);
    projTotalArea.value = spaces.map(s => s.total_area).reduce((a,b) => a + b, 0);

    // Populating the home currency
    if (store.state.currentClient.home_ccy) {
      selectedHomeCurrency.value = currencyListing.value.find(c => c.currency_code == store.state.currentClient.home_ccy)?.value;
    }
    
    // Populating the local currency
    if (store.state.currentClient.local_ccy) {
      selectedLocalCurrency.value = currencyListing.value.find(c => c.currency_code == store.state.currentClient.local_ccy)?.value;
    }

    // Populating the project completion date while checking if the date is not empty
    let compDate = new Date(store.state.currentClient.proj_end_date);
    if (compDate.getFullYear() != 1) {
      projCompletionDate.value = dateFormat(compDate, 'yyyy-MM-dd');
    }

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

    // Modifying the value so that it is only 1 level array
    let formattedListing = [];
    groupByCategory.forEach(grp => {
      // Adding the category
      let cat = generateTableObj(grp.category);
      cat.type = 'category';
      formattedListing.push(cat);

      // Looping through the details
      grp.details.forEach(sub => {
        // Adding the sub category header
        let subCat = generateTableObj(sub.subCategory,'Unit Rate','Size','Functional Area','Local Currency','Home Currency','Cost/SM or SF\n(Local Currency)','Cost/SM or SF\n(Home Currency)');
        subCat.type = 'subCategory';
        formattedListing.push(subCat);

        // Pushing all the details
        sub.details.forEach(subDetails => {
          let details = generateTableObj(`${subDetails.budget_name}\n${subDetails.budget_description}`,'','','','','','','');
          details.type = 'details';
          formattedListing.push(details);
        });
      });
    });

    // Set the budget listing to be the one that is formatted
    budgetListing.value = formattedListing;

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
.main-budget-table tr td, .main-budget-table tr th {
  border: 1px solid gray;
  padding: 5px;
}
.main-budget-table tr th {
  white-space: pre-wrap;
}
.main-budget-table tr td > input {
  width: 100%;
  height: 100%;
  padding: 5px;
  text-align: right;
}
.main-budget-table tr td:not(:first-child) {
  width: 10%;
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
.number-right-text {
  text-align: right;
}
.main-budget-row:hover > td {
  background-color: rgba(200,200,200,0.4);
}
</style>