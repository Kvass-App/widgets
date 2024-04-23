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

const getProperty = (property: string): any =>
  window.getComputedStyle(document.body).getPropertyValue(property)

ChartJS.defaults.font.size = getProperty('font-size').replace(/\D/g, '') as any
ChartJS.defaults.font.family = getProperty('font-family')

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
