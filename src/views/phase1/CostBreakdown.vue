<template>
  <div>
    <table>
      <tr>
        <th>Description</th>
        <th>Original Amount</th>
        <th>Variation Order</th>
        <th>Total</th>
      </tr>
      <tr>
        <td>Preliminary</td>
        <td>100</td>
        <td></td>
        <td>100</td>
      </tr>
      <tr>
        <td>Fit out Work</td>
        <td>400</td>
        <td>29</td>
        <td>429</td>
      </tr>
      <tr>
        <td>MEP Work</td>
        <td>1200</td>
        <td>300</td>
        <td>1500</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import {} from 'vue';
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
</style>