<script setup>
import { defineProps, onMounted, onUnmounted, ref, computed, watch } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  TimeScale,
  PointElement,
  CategoryScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { getLabel as getLabelFactory } from '../../utils/index.js'
import { Line } from 'vue-chartjs'
import { Flex, FormControl, Checkbox, Grid, Input, DataTable } from '@kvass/ui'

const props = defineProps({
  integration_id: {
    type: String,
    required: true,
  },
  app_url: {
    type: String,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const t = getLabelFactory(props.labels, {
  settings: 'Innstillinger',
  clicks: 'Klikk',
  impressions: 'Visninger',
  ctr: 'Klikkfrekvens',
  position: 'Posisjon',
  startDate: 'Startdato',
  endDate: 'Sluttdato',
})

const startDate = ref()
const endDate = ref()

// Registrer nødvendige komponenter fra Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  TimeScale,
  PointElement,
  CategoryScale,
)

const options = ref({
  responsive: true,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
      },
      title: {
        display: true,
        text: 'Dato',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Verdi',
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    title: {
      display: false,
    },
  },
})

onMounted(() => {
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
})

const chartInstance = ref(null)
function resizeChart() {
  chartInstance.value.chart.resize()
}

const datasets = ref({
  totalClicks: {
    show: true,
    graphData: {
      label: 'Totalt antall klikk',
      backgroundColor: 'rgba(67, 133, 244, 1)',
      borderColor: 'rgba(67, 133, 244, 1)',
      data: [],
      tension: 0,
    },
  },
  totalImpressions: {
    show: false,
    graphData: {
      label: 'Totalt antall visninger',
      backgroundColor: 'rgba(95, 54, 177, 1)',
      borderColor: 'rgba(95, 54, 177, 1)',
      data: [],
      tension: 0,
    },
  },
  clickThroughRate: {
    show: false,
    graphData: {
      label: 'Gjennomsnittlig klikkrate',
      backgroundColor: 'rgba(3, 137, 123, 1)',
      borderColor: 'rgba(3, 137, 123, 1)',
      data: [],
      tension: 0,
    },
  },
  avgPosition: {
    show: false,
    graphData: {
      label: 'Gjennomsnittlig posisjon i søk',
      backgroundColor: 'rgba(232, 113, 9, 1)',
      borderColor: 'rgba(232, 113, 9, 1)',
      data: [],
      tension: 0,
    },
  },
})

async function fetchData() {
  const url = new URL(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/gscData`,
  )
  url.searchParams.append('type', 'interactionData')
  if (startDate.value !== undefined)
    url.searchParams.append('startDate', startDate.value)
  if (endDate.value !== undefined)
    url.searchParams.append('endDate', endDate.value)

  const res = await fetch(url.toString())
  const data = await res.json()

  Object.entries(data).forEach(([k, v]) => {
    datasets.value[k].graphData = { ...datasets.value[k].graphData, data: v }
  })
}

watch(
  () => [
    Object.values(datasets.value).filter((dataset) => dataset.show),
    startDate.value,
    endDate.value,
  ],
  () => {
    fetchData()
  },
  { immediate: true },
)

const chartData = computed(() => {
  return {
    datasets: Object.values(datasets.value)
      .filter((dataset) => dataset.show)
      .flatMap((dataset) => dataset.graphData),
  }
})
</script>

<template>
  <Grid
    class="google-search-console-datachart"
    columns="1fr min-content"
    areas="chart chart | settings settings"
    gap="1rem"
  >
    <div class="kvass-google-search-console-datachart__chart">
      <!-- Vue-ChartJS-komponenten -->
      <Line
        :data="chartData"
        :options="options"
        class="kvass-google-search-console-datachart__chart-chart"
        ref="chartInstance"
      />
    </div>

    <div class="kvass-google-search-console-datachart__settings">
      <h2>{{ t('settings') }}</h2>
      <Flex>
        <Checkbox
          class="k-checkbox"
          :label="t('clicks')"
          v-model="datasets.totalClicks.show"
        />
        <Checkbox
          :label="t('impressions')"
          v-model="datasets.totalImpressions.show"
        />
        <Checkbox :label="t('ctr')" v-model="datasets.clickThroughRate.show" />
        <Checkbox :label="t('position')" v-model="datasets.avgPosition.show" />
      </Flex>

      <div class="kvass-google-search-console-datachart__settings-datepicker">
        <Flex>
          <FormControl :label="t('startDate')"
            ><Input type="date" v-model="startDate"
          /></FormControl>
          <FormControl :label="t('endDate')"
            ><Input type="date" v-model="endDate"
          /></FormControl>
        </Flex>
      </div>
    </div>
  </Grid>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-google-search-console-datachart {
  &__wrapper {
    color: var(--kvass-google-search-console-datachart-color, inherit);
    font-size: var(--kvass-google-search-console-datachart-font-size, inherit);
    font-family: var(
      --kvass-google-search-console-datachart-font-family,
      inherit
    );
  }

  // Default variables
  --__kvass-google-search-console-datachart-background-color: transparent;
  --__kvass-google-search-console-datachart-max-width: 100%;
  --__kvass-google-search-console-datachart-size: 25vw;
  --__kvass-google-search-console-datachart-size-min: 400px;
  --__kvass-google-search-console-datachart-size-max: 800px;
  --__kvass-google-search-console-datachart-border: 1px solid #eaeaea;
  --__kvass-google-search-console-datachart-height: 100%;

  background-color: var(
    --kvass-google-search-console-datachart-background-color,
    var(--__kvass-google-search-console-datachart-background-color)
  );
  max-width: var(
    --kvass-google-search-console-datachart-max-width,
    var(--__kvass-google-search-console-datachart-max-width)
  );
  margin-top: 0.5rem;

  height: var(
    --kvass-google-search-console-datachart-height,
    var(--__kvass-google-search-console-datachart-height)
  );

  border: var(
    --kvass-google-search-console-datachart-border,
    var(--__kvass-google-search-console-datachart-border)
  );

  border-radius: var(
    --kvass-google-search-console-datachart-border-radius,
    3px
  );

  h2 {
    margin: 0;
  }
  &__chart {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    &-chart {
      $size: clamp(
        var(
          (--kvass-google-search-console-datachart-size-min),
          var(--__kvass-google-search-console-datachart-size-min)
        ),
        var(
          (--kvass-google-search-console-datachart-size),
          var(--__kvass-google-search-console-datachart-size)
        ),
        var(
          (--kvass-google-search-console-datachart-size-max),
          var(--__kvass-google-search-console-datachart-size-max)
        )
      );
      width: $size !important;
      height: $size !important;
    }
  }
  &__settings {
    --k-grid-item-area: settings;
    display: flex;
    flex-direction: column;
    align-content: start;
    justify-self: auto;
    align-self: start;
    min-width: 300px;
    gap: 2rem;

    background-color: whitesmoke;
    padding: 2rem;
    border-radius: var(--k-ui-rounding);

    .k-checkbox {
      flex-grow: 1;
    }
  }
}
</style>
