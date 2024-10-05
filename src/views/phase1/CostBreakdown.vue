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
        <td>{{ formatNumber(cb.var_sub_total_amnt) }}</td>
        <td>{{ formatNumber(Number(cb.ori_sub_total_amnt) + Number(cb.var_sub_total_amnt)) }}</td>
      </tr>
    </table>

    <div class="chart-container">
      <div class="top-chart-container">
        <div class="chart-box">
          <PieChart title="Original Amount" />
        </div>
        <div class="chart-box">
          <PieChart title="Variation Amount" />
        </div>
      </div>
      <div class="chart-box">
        <PieChart title="Total Amount" />
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

//#region Lifecycle
onMounted(async () => {
  if (store.state.currentClient) {
    // Getting the details for the currentclient
    costBreakdownListing.value = await get(`Budget/GetCostBreakdown?Client_uid=${store.state.currentClient.client_uid}`);

    if (costBreakdownListing.value.length > 0) {
      originalAmountPieItem.value = costBreakdownListing.value.map(cb => {
        return {
          name: cb.cost_breakdown_name,
          count: Number(cb.ori_sub_total_amnt)
        };
      });

      console.log(originalAmountPieItem.value);
      console.log(variationAmountPieItem.value);
      console.log(totalAmountPieItem.value);

      // variationAmountPieItem.value = costBreakdownListing.value.map(cb => {
      //   return {
      //     name: cb.cost_breakdown_name,
      //     count: Number(cb.var_sub_total_amnt)
      //   };
      // });

      // totalAmountPieItem.value = costBreakdownListing.value.map(cb => {
      //   return {
      //     name: cb.cost_breakdown_name,
      //     count: Number(cb.ori_sub_total_amnt) + Number(cb.var_sub_total_amnt)
      //   };
      // });
    }
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
</style>