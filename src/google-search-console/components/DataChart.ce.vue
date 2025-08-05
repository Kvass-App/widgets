<script setup>
import { defineProps, ref, computed, watch } from 'vue'
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
import {
  Flex,
  FormControl,
  Card,
  Checkbox,
  Input,
  DataTable,
  Grid,
  Alert,
} from '@kvass/ui'

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

const emit = defineEmits(['fetchInteractionData'])

const t = getLabelFactory(props.labels, {
  /* settings: 'Innstillinger',
  clicks: 'Klikk',
  impressions: 'Visninger',
  ctr: 'Klikkfrekvens',
  searchPosition: 'Rangering i søk',
  startDate: 'Startdato for oversikt',
  endDate: 'Sluttdato for oversikt',
  integrationGSCGeneralOverview: 'Generell oversikt over søket',
  integrationGSCAdjustOverview: 'Tilpass visningsoversikt',
  integrationGSCChooseFields: 'Velg hva som skal vises i oversikten',
  integrationGSCDetailedOverview: 'Detaljert visningsoversikt', */
})

const startDate = ref()
const endDate = ref()

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
  maintainAspectRatio: true,
  aspectRatio: 1,
  devicePixelRatio: 1,
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

const backgroundColors = {
  clicks: 'rgba(67, 133, 244, 1)',
  impressions: 'rgba(95, 54, 177, 1)',
  ctr: 'rgba(3, 137, 123, 1)',
  position: 'rgba(232, 113, 9, 1)',
}

const datasets = ref({
  clicks: {
    show: true,
    graphData: {
      label: t('clicks'),
      backgroundColor: backgroundColors.clicks,
      borderColor: backgroundColors.clicks,
      data: [],
      tension: 0,
    },
  },
  impressions: {
    show: true,
    graphData: {
      label: t('impressions'),
      backgroundColor: backgroundColors.impressions,
      borderColor: backgroundColors.impressions,
      data: [],
      tension: 0,
    },
  },
  ctr: {
    show: true,
    graphData: {
      label: t('ctr'),
      backgroundColor: backgroundColors.ctr,
      borderColor: backgroundColors.ctr,
      data: [],
      tension: 0,
    },
  },
  position: {
    show: true,
    graphData: {
      label: t('searchPosition'),
      backgroundColor: backgroundColors.position,
      borderColor: backgroundColors.position,
      data: [],
      tension: 0,
    },
  },
})

const totalInteractionData = ref({
  clicks: 0,
  impressions: 0,
  ctr: 0,
  position: 0,
})

async function fetchData(type) {
  const url = new URL(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/gscData`,
  )
  url.searchParams.append('type', type)
  if (startDate.value !== undefined && startDate.value !== '')
    url.searchParams.append('startDate', startDate.value)
  if (endDate.value !== undefined && endDate.value !== '')
    url.searchParams.append('endDate', endDate.value)

  const res = await fetch(url.toString())
  const data = await res.json()

  if (type === 'interactionData') {
    Object.entries(data).forEach(([k, v]) => {
      datasets.value[k].graphData = { ...datasets.value[k].graphData, data: v }
    })
  } else if (type === 'totalInteractionData') {
    totalInteractionData.value = data
  }

  emit('fetchInteractionData', !noData.value)
}

watch(
  () => [startDate.value, endDate.value],
  () => {
    fetchData('interactionData')
    fetchData('totalInteractionData')
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

const noData = computed(() => {
  return chartData.value.datasets.every((el) => {
    return el.data.length === 0
  })
})
</script>

<template>
  <div class="kvass-google-search-console-total-data">
    <h3>{{ t('integrationGSCGeneralOverview') }}</h3>
    <Grid columns="4">
      <Card
        v-for="(value, key) in totalInteractionData"
        :key
        :style="{ '--total-data-bg-color': backgroundColors[key] }"
      >
        <template #header
          ><h4>{{ t(key) }}</h4></template
        >
        <template #default
          ><h2>{{ value }}</h2></template
        >
      </Card>
    </Grid>
  </div>
  <Flex class="kvass-google-search-console-datachart">
    <div class="kvass-google-search-console-datachart__chart">
      <h3>{{ t('integrationGSCDetailedOverview') }}</h3>
      <Line
        :data="chartData"
        :options="options"
        class="kvass-google-search-console-datachart__chart-chart"
        ref="chartInstance"
      />
    </div>

    <div class="kvass-google-search-console-datachart__settings-container">
      <h3>{{ t('integrationGSCAdjustOverview') }}</h3>
      <div class="kvass-google-search-console-datachart__settings">
        <Flex>
          <p>{{ t('integrationGSCChooseFields') }}</p>
          <Checkbox
            class="k-checkbox"
            :label="t('clicks')"
            v-model="datasets.clicks.show"
          />
          <Checkbox
            :label="t('impressions')"
            v-model="datasets.impressions.show"
          />
          <Checkbox :label="t('ctr')" v-model="datasets.ctr.show" />
          <Checkbox :label="t('position')" v-model="datasets.position.show" />
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
    </div>
  </Flex>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-google-search-console-total-data {
  padding: 30px 30px 0 30px;

  h3 {
    margin-top: 0;
  }

  .k-grid {
    width: 100%;

    .k-card {
      background-color: var(--total-data-bg-color);

      h4 {
        font-size: 20px;
        color: whitesmoke;
        margin-block: 13px;
      }
      h2 {
        font-size: 28px;
        color: whitesmoke;
        margin: 0;
      }
    }
  }

  &::after {
    content: '';
    display: block;
    height: 1px; /* Høyde på linjen */
    background-color: #c9c9c9; /* Fargen på linjen */
    margin-top: 30px;
  }
}

.kvass-google-search-console-datachart {
  // Default variables
  --__kvass-google-search-console-datachart-background-color: white;
  --__kvass-google-search-console-datachart-max-width: 100%;
  --__kvass-google-search-console-datachart-size: 25vw;
  --__kvass-google-search-console-datachart-size-min: 200px;
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

  border-radius: var(
    --kvass-google-search-console-datachart-border-radius,
    3px
  );

  padding: 0px 30px 0 30px;

  h2 {
    margin: 0;
  }

  &__chart {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    flex-grow: 1;

    width: clamp(100px, 50%, 800px);

    background-color: white;
    border-radius: var(--k-ui-rounding);

    h3 {
      align-self: flex-start;
    }
  }
  &__settings {
    &-container {
      flex-grow: 1;
      justify-self: auto;
      align-self: start;
      margin-right: 30px;
    }
    width: 100%;
    display: flex;
    flex-direction: column;
    align-content: start;

    gap: 2rem;

    background-color: #f8f8f8;
    padding-inline: 20px;
    padding-block: 30px;
    border: 1px solid #c9c9c9;

    border-radius: var(--k-ui-rounding);

    .k-flex {
      flex-direction: column;
      gap: 10px;
    }

    --k-checkbox-accent: #102b37;
    --k-checkbox-size: 16px;
    p {
      margin: 0;
      font-weight: 700;
    }

    &-datepicker {
      .k-flex {
        flex-direction: row;
      }

      .k-formcontrol__label {
        font-size: 16px;
        font-weight: 700;
      }

      * {
        flex-grow: 1;
      }
    }
  }

  &::after {
    content: '';
    display: block;
    height: 1px;
    background-color: #c9c9c9;
    margin-top: 30px;
    width: 100%;
  }
}
</style>
