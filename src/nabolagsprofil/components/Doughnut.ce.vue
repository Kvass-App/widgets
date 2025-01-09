<script setup>
import { computed, ref } from 'vue'
import { Flex } from '@kvass/ui'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps({
  data: Array,
  title: String,
  subtitle: String,
  value: String,
})

const doughnut = ref()

const chartData = computed(() => {
  if (!doughnut.value) return { datasets: [] }

  const style = window.getComputedStyle(doughnut.value.$el)

  const primaryColor = style.getPropertyValue(
    '--kvass-nabolagsprofil-doughnut-color-primary',
  )
  const secondaryColor = style.getPropertyValue(
    '--kvass-nabolagsprofil-doughnut-color-secondary',
  )

  return {
    datasets: [
      {
        backgroundColor: [primaryColor, secondaryColor],
        data: props.data,
        borderWidth: 0,
      },
    ],
  }
})

const chartOptions = computed(() => {
  return {
    animation: {
      duration: 2000,
    },
    radius: '100%',
    cutout: 90,
    events: [],
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
    },
  }
})
</script>

<template>
  <Flex class="doughnut" direction="column" ref="doughnut">
    <div class="doughnut__title">{{ title }}</div>

    <div class="doughnut__chart">
      <div class="doughnut__content">{{ value }}</div>
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div v-if="subtitle" class="doughnut__subtitle">{{ subtitle }}</div>
  </Flex>
</template>

<style lang="scss">
.doughnut {
  &__title {
    text-align: center;

    &:first-letter {
      text-transform: uppercase;
    }

    font-size: var(--kvass-nabolagsprofil-doughnut-title-font-size);
    font-weight: var(--kvass-nabolagsprofil-doughnut-title-font-weight);
    font-family: var(--kvass-nabolagsprofil-doughnut-title-font-family);
  }
  &__subtitle {
    text-align: center;
    font-size: var(--kvass-nabolagsprofil-doughnut-subtitle-font-size);
    font-weight: var(--kvass-nabolagsprofil-doughnut-subtitle-font-weight);
    font-family: var(--kvass-nabolagsprofil-doughnut-subtitle-font-family);
  }
  &__content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: var(--kvass-nabolagsprofil-doughnut-content-font-size);
    font-weight: var(--kvass-nabolagsprofil-doughnut-content-font-weight);
    font-family: var(--kvass-nabolagsprofil-doughnut-content-font-family);
  }
  &__chart {
    margin: 0 auto;
    position: relative;
    height: var(--kvass-nabolagsprofil-doughnut-size);
    width: var(--kvass-nabolagsprofil-doughnut-size);
  }
}
</style>
