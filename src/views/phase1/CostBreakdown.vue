<template>
  <Loader v-if="loadingCostBreakdown" text="Loading Cost Breakdown" />
  <div v-else>
    <table>
      <tr>
        <th>Description</th>
        <th>Original Amount</th>
        <th>Variation Order</th>
        <th>Total</th>
      </tr>
      <tr v-for="(cb,cbInd) in costBreakdownListing" :key="cbInd">
        <td>{{ cb.cost_breakdown_name }}</td>
        <td>{{ formatNumber(cb.ori_sub_total_amnt) }}</td>
        <!-- <td>{{ formatNumber(cb.var_sub_total_amnt) }}</td> -->
        <td><input class="variation-text-box" type="text" v-model="cb.var_sub_total_amnt" @input="variationChanged"></td>
        <td>{{ formatNumber(Number(cb.ori_sub_total_amnt) + Number(cb.var_sub_total_amnt)) }}</td>
      </tr>
    </table>

    <div class="chart-container">
      <div class="top-chart-container">
        <div class="chart-box">
          <PieChart title="Original Amount" :item="originalAmountPieItem" />
        </div>
        <div class="chart-box">
          <PieChart title="Variation Amount" :item="variationAmountPieItem" />
        </div>
      </div>
      <div class="chart-box">
        <PieChart title="Total Amount" :item="totalAmountPieItem" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { get } from '../../js/apiCall';
import { formatNumber } from '../../js/helper';

const store = useStore();
const router = useRouter();

//#region Data
const costBreakdownListing = ref([]); // The listing of the cost breakdown
const loadingCostBreakdown = ref(false); // To used when loading the cost breakdown
const originalAmountPieItem = ref([]); // The item for the pie item original amount
const variationAmountPieItem = ref([]); // The item for the pie item variant amount
const totalAmountPieItem = ref([]); // The item for the pie item total amount
//#endregion Data

//#region Method
const generatePieItem = () => {
  originalAmountPieItem.value = costBreakdownListing.value.map(cb => {
    return {
      name: cb.cost_breakdown_name,
      count: Number(cb.ori_sub_total_amnt)
    };
  });

  variationAmountPieItem.value = costBreakdownListing.value.map(cb => {
    return {
      name: cb.cost_breakdown_name,
      count: Number(cb.var_sub_total_amnt)
    };
  });

  totalAmountPieItem.value = costBreakdownListing.value.map(cb => {
    return {
      name: cb.cost_breakdown_name,
      count: Number(cb.ori_sub_total_amnt) + Number(cb.var_sub_total_amnt)
    };
  });
}
const variationChanged = () => {
  // // Get the cost breakdown based on the index
  // let cost = costBreakdownListing.value[costIndex];
  // Regenerate the pie item
  generatePieItem();
}
//#endregion Method

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    // Show the loading
    loadingCostBreakdown.value = true;

    // Getting the details for the currentclient
    costBreakdownListing.value = await get(`Budget/GetCostBreakdown?Client_uid=${store.state.currentClient.client_uid}`);

    // Generate the pie item only when the listing is not 0
    if (costBreakdownListing.value.length > 0) {
      generatePieItem();
    }

    // Hide the loading
    loadingCostBreakdown.value = false;
  } else {
    // Push back to home page to choose client
    router.push('/Home?choose');
  }
});
//#endregion Lifecycle
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
table tr td, table tr th {
  border: 1px solid gray;
  padding: 5px;
}
td:not(:first-child) {
  text-align: center;
}
.chart-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
}
.top-chart-container {
  display: flex;
  width: 100%;
  column-gap: 10px;
}
.chart-box {
  width: 50%;
}
.variation-text-box {
  text-align: center;
  width: 100%;
}
</style>