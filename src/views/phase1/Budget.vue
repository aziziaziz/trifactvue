<template>
  <Loader v-if="loadingBudget" text="Loading Budget" />
  <div class="budget-main" v-else>
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
        <td>
          <div v-if="savedExchangeRateText" class="exchange-rate-container">
            <div @click="showSavedRate = !showSavedRate">
              <input type="checkbox" :checked="showSavedRate">
              <label>{{ savedExchangeRateText }}</label>
            </div>
            <div @click="showSavedRate = !showSavedRate">
              <input type="checkbox" :checked="!showSavedRate">
              <label>{{ exchangeRateText }}</label>
            </div>
          </div>
          <div v-else>{{ exchangeRateText }}</div>
        </td>
      </tr>
      <tr>
        <td>Tax Percentage</td>
        <td></td>
      </tr>
    </table>

    <div class="budget-main-section">
      <table class="main-budget-table">
        <tr v-for="(bud,budInd) in budgetListing" :key="budInd" class="main-budget-row">
          <!-- Category, SubCategory, Name/Details -->
          <th v-if="bud.type == 'category' || bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col1 }}</th>
          <td v-else>
            <div class="budget-name">{{ bud.col1.split('\n')[0] }}</div>
            <div v-if="bud.col1.split('\n')[1]" class="budget-desc">{{ bud.col1.split('\n')[1] }}</div>
          </td>
          <!-- Unit Rate -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col2 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col2">
          </td>
          <!-- Size -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col3 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col3">
          </td>
          <!-- Functional Area -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col4 }}</th>
          <td v-else-if="bud.type == 'details'">
            <input v-model="bud.col4">
          </td>
          <!-- Local currency -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col5 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">
            {{ getLocalCurrencyValue(bud, bud.col2, bud.col3) }}
          </td>
          <!-- Home currency -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col6 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">
            {{ getLocalCurrencyValue(bud, bud.col2, bud.col3, true) }}
          </td>
          <!-- Cost (Local currency) -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col7 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">
            {{ getUnitRateConvertedValue(bud, bud.col2) }}
          </td>
          <!-- Cost (Home currency) -->
          <th v-if="bud.type == 'subCategory'" :class="{ 'category-header': bud.type == 'category' }" :colspan="bud.type == 'category' ? 8 : 0">{{ bud.col8 }}</th>
          <td v-else-if="bud.type == 'details'" class="number-right-text">
            {{ getUnitRateConvertedValue(bud, bud.col2, true) }}
          </td>
        </tr>
      </table>
    </div>
    
    <Button theme="submit" class="save-button" @click="saveClicked" :loading="savingBudget">Save Budget</Button>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get, post } from '../../js/apiCall';
import { compareData, dateFormat, formatNumber, getNumber, showNoti } from '../../js/helper';

const store = useStore();
const router = useRouter();

//#region Data
const projTotalArea = ref(''); // The total area to be shown at the header of the page
const projCompletionDate = ref(null); // The project completion date
const budgetListing = ref([]); // The list of the budget to show
const originalBudgetListing = ref([]); // The original budget listing if it is already saved before
const loadingBudget = ref(false); // When the budget is loading
const exchangeRate = ref(0); // The exchange rate from the local to home ccy this is the live rate
const savedExchangeRate = ref(0); // The exchange rate from the mp budget
const currencyListing = ref([]); // The list of the currencies
const selectedHomeCurrency = ref(''); // The selected of the home currency
const homeCurrencyShort = ref(''); // The short of the home currency
const localCurrencyShort = ref(''); // The short of the local currency
const selectedLocalCurrency = ref(''); // The selected of the local currency
const exchangeRateText = ref('0.00'); // The exchange rate to show
const savedExchangeRateText = ref(''); // The saved exchange rate to show
const showSavedRate = ref(false); // The toggling between saved and current rate
const savingBudget = ref(false); // When saving the budget
//#endregion Data

//#region Methods
const getLocalCurrencyValue = (toUpdate, unitRate, size, isHomeCcy) => {
  // Setting up the result as empty string
  let result = '';

  // Setting the rate
  let rate = showSavedRate.value ? savedExchangeRate.value : exchangeRate.value;

  if (unitRate && !isNaN(Number(unitRate)) && size && !isNaN(Number(size))) {
    let value = Number(unitRate) * Number(size);
    // If home ccy, need to convert to the home currency
    if (isHomeCcy) {
      // Returning the unitRate * size for the home ccy
      result = `${homeCurrencyShort.value} ${formatNumber(value * rate)}`;
    } else {
      // Returning the unitRate * size only (local ccy)
      result = `${localCurrencyShort.value} ${formatNumber(value)}`;
    }
  } else {
    // Returning empty string
    result = '';
  }

  // Assigning back to the object
  if (isHomeCcy) {
    toUpdate.col6 = result;
  } else {
    toUpdate.col5 = result;
  }

  return result;
}
const getUnitRateConvertedValue = (toUpdate, unitRate, isHomeCcy) => {
  // Setting up the result as empty string
  let result = '';

  // Setting the rate
  let rate = showSavedRate.value ? savedExchangeRate.value : exchangeRate.value;

  // Check if the unitrate is empty
  if (unitRate && !isNaN(Number(unitRate))) {
    // Checking if home ccy
    if (isHomeCcy) {
      // Return the unit rate with the exchange rate
      result = `${homeCurrencyShort.value} ${formatNumber(Number(unitRate) * rate)}`;
    } else {
      // Returninng the local unit rate
      result = `${localCurrencyShort.value} ${formatNumber(unitRate)}`;
    }
  } else {
    // Returning empty string
    result = '';
  }

  // Assigning back to the object
  if (isHomeCcy) {
    toUpdate.col8 = result;
  } else {
    toUpdate.col7 = result;
  }

  return result;
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
    let exchangeRateObj = await get(`Currency/GetCurrencyRate?base_currency=${localCurrencyShort.value}&target_currency=${homeCurrencyShort.value}`);
    exchangeRate.value = exchangeRateObj.rate;
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
    type: '', // Can be category, subCategory or details
    uid: null, // The budget uid
    fullDetails: null // This is to be used if the type is details only
  };
}
const saveClicked = async () => {
  // Set the loading in the button
  savingBudget.value = true;

  // Getting all the details object only
  let details = budgetListing.value.filter(b => b.type == 'details');
  let oriDetails = originalBudgetListing.value.filter(b => b.type == 'details');

  // Getting the data with the action
  let toPost = compareData({ value: oriDetails }, { value: details }, 'uid');
  
  // Create the post object
  let objToPost = toPost.map(d => {
    return {
      action: d.action,
      client_uid: store.state.currentClient.client_uid,
      budget_uid: d.fullDetails.budget_uid,
      description: '', // What is this?
      category: d.fullDetails.category,
      sub_category: d.fullDetails.sub_category,
      budget_name: d.fullDetails.budget_name,
      budget_description: d.fullDetails.budget_description,
      subtype: '',
      unit_rate: d.col2,
      functional_area: isNaN(Number(d.col4)) ? 0 : Number(d.col4),
      area_size: Number(d.col3),
      local_ccy: localCurrencyShort.value,
      home_ccy: homeCurrencyShort.value,
      exchange_rate: exchangeRate.value,
      local_currency_cost: getNumber(d.col5),
      home_cost: getNumber(d.col6),
      local_currency_cost_sm: getNumber(d.col7),
      home_cost_sm: getNumber(d.col8),
      total_local_currency_cost: 0,
      total_home_cost: 0,
      total_local_currency_cost_sm: 0,
      total_home_cost_sm: 0,
      total_tax_local_currency_cost: 0,
      total_tax_home_cost: 0,
      total_tax_local_currency_cost_sm: 0,
      total_tax_home_cost_sm: 0
    };
  });
  
  // Post to backend
  let result = await post(`Budget/UpdateBudgetClient?username=${localStorage.getItem('user')}`, objToPost);
  // Checking on the result
  if (result) {
    showNoti('Budget successfully saved!', 'success');
  } else {
    showNoti('There was an error while saving your budget.', 'error');
  }

  // Hide the loading
  savingBudget.value = false;
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
    } else {
      // Get the saved exchange rate value
      savedExchangeRate.value = budgetListing.value[0].exchange_rate;
      savedExchangeRateText.value = `${savedExchangeRate.value.toFixed(4)} (${budgetListing.value[0].local_ccy} to ${budgetListing.value[0].home_ccy}) [Saved]`;
      showSavedRate.value = true;
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
          details.fullDetails = subDetails;

          // Checking if the subDetail is not null
          if (subDetails) {
            // Populating unit rate, size and functional area
            details.col2 = subDetails.unit_rate || '';
            details.col3 = subDetails.area_size || '';
            details.col4 = subDetails.functional_area || '';

            // Setting the UID for comparison
            details.uid = subDetails.budget_uid;
          }

          formattedListing.push(details);
        });
      });
    });

    // Set the budget listing to be the one that is formatted
    budgetListing.value = formattedListing;
    // Checking if it has been saved before
    if (savedExchangeRateText.value) {
      // Set the original listing
      originalBudgetListing.value = JSON.parse(JSON.stringify(formattedListing));

      // Assigning missing values
      originalBudgetListing.value.forEach(o => {
        // Only assign when the fulldetails is not empty or null
        if (o.fullDetails) {
          // Get the details
          let localCcy = o.fullDetails.local_ccy;
          let homeCcy = o.fullDetails.home_ccy;
          let col5 = o.fullDetails.local_currency_cost;
          let col6 = o.fullDetails.home_cost;
          let col7 = o.fullDetails.local_currency_cost_sm;
          let col8 = o.fullDetails.home_cost_sm;
  
          // Assign the values
          o.col5 = col5 ? `${localCcy} ${formatNumber(col5)}` : '';
          o.col6 = col6 ? `${homeCcy} ${formatNumber(col6)}` : '';
          o.col7 = col7 ? `${localCcy} ${formatNumber(col7)}` : '';
          o.col8 = col8 ? `${homeCcy} ${formatNumber(col8)}` : '';
        }
      });
    }

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
.budget-main {
  position: relative;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
}
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
.save-button {
  margin-top: 10px;
  position: sticky;
  bottom: 10px;
  width: fit-content;
  align-self: flex-end;
}
</style>