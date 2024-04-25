<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  ChartDataLabels,
)

const props = withDefaults(
  defineProps<{
    data: any
    options: any
  }>(),
  {
    data: () => ({}),
    options: () => ({}),
  },
)
</script>

<template>
  <Doughnut :data="data" :options="options" ref="doughnut" />
</template>

<style lang="scss"></style>
