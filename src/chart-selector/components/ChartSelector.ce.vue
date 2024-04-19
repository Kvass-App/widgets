<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { set, useCurrentElement } from '@vueuse/core'
import Doughnut from './Doughnut.ce.vue'
import {
  FormControl,
  Button,
  DataTable,
  Flex,
  Icon,
  Input,
  Checkbox,
  Switch,
  RadioGroup,
  Grid,
} from '@kvass/ui'

type labelPositions = 'top' | 'left' | 'bottom' | 'right'
type Type = 'pie' | 'doughnut'
type Format = 'percentage' | 'number'
type Item = {
  color: string
  label: string
  value: number
  selected: boolean
}

const props = withDefaults(
  defineProps<{
    showLabels: boolean
    showDataLabels: boolean
    label: string
    labelPosition: labelPositions
    type: Type
    colors: string
    value: string
    format: Format
  }>(),
  {
    showLabels: true,
    showDataLabels: false,
    label: 'Tittel',
    labelPosition: 'right',
    type: 'doughnut',
    format: 'number',
    colors:
      '#102B37,#27525D,#D6E4EB,#FBECD9,#FCFAF6,#8E789D,#D37468,#DE7549,#4A1A29,#7C2A26',
    value: '[{"color":"#102B37","label":"item 1","value":100}]',
  },
)

const getLabelPosition = computed(() => {
  switch (props.labelPosition) {
    case 'right':
      return 'row'
    case 'left':
      return 'row-reverse'
    case 'top':
      return 'column-reverse'
    case 'bottom':
      return 'column'
  }
})

const getLabelItemPosition = computed(() => {
  switch (props.labelPosition) {
    case 'left':
    case 'right':
      return 'column'
    case 'top':
    case 'bottom':
      return 'row'
  }
})

const showLabels = ref<boolean>(props.showLabels)
const showDataLabels = ref<boolean>(props.showDataLabels)
const colors = computed(() => props.colors.split(','))
const items = ref<Item[]>([])
const element = useCurrentElement()
const format = ref(props.format)
const label = ref(props.label)

const formatInput = (input: string) => {
  switch (format.value) {
    case 'percentage':
      return `${input} %`
    default:
      return input
  }
}

const cutout = computed(() => {
  switch (props.type) {
    case 'doughnut':
      return '60%'
    case 'pie':
    default:
      return '0%'
  }
})

const addItem = () => {
  const length = items.value.length

  items.value.push({
    //@ts-ignore
    color: colors.value.at(length) || '#000000',
    label: `item ${length + 1}`,
    value: 100,
    selected: false,
  })
}

const selected = computed(() => items.value.find((i) => i.selected))

const setSelected = (v: boolean, rowIndex: number) => {
  if (!v) return

  items.value = items.value.map((i, index) => {
    return {
      ...i,
      selected: rowIndex === index,
    }
  })
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const chartData = computed(() => {
  return {
    labels: items.value.map((i) => i.label),
    datasets: [
      {
        backgroundColor: items.value.map((i) => i.color),
        data: items.value.map((i) => i.value),
      },
    ],
  }
})

const chartOptions = computed(() => {
  return {
    radius: '100%',
    cutout: cutout.value,
    layout: {
      padding: showDataLabels.value ? 60 : 0,
    },
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
        color: 'black',
        display: Boolean(showDataLabels.value),
        clamp: false,
        clip: false,
        anchor: 'end',
        align: 'end',
        formatter: function (value, context) {
          return formatInput(value)
        },
      },
    },
  }
})

const columns = computed(() => {
  return [
    {
      id: 'color',
      label: 'Farge',
    },
    {
      id: 'label',
      label: 'Tittel',
    },
    {
      id: 'value',
      label: 'Verdi',
    },
    {
      id: 'select',
      label: 'Fremhev',
    },
    {
      id: 'remove',
      label: '',
    },
  ]
})

const formatTypes = computed(() => {
  return [
    {
      id: 'percentage',
      label: 'Prosent',
    },
    {
      id: 'number',
      label: 'Nummer',
    },
  ]
})

watch(
  () => props.value,
  () => {
    let v = JSON.parse(props.value) || []

    items.value = v instanceof Array ? v : [v]
  },
  {
    immediate: true,
  },
)

watch(
  [items, label, showLabels, showDataLabels, format],
  ([items, label, showLabels, showDataLabels, format]) => {
    // emit custom event
    //@ts-ignore
    element.value.dispatchEvent(
      new CustomEvent('webcomponent:update', {
        detail: {
          format,
          showLabels,
          showDataLabels,
          label,
          items,
        },
        bubbles: true,
        composed: true,
      }),
    )
  },
  {
    deep: true,
  },
)
</script>

<template>
  <Grid
    class="kvass-chart-selector"
    columns="1fr min-content"
    areas="chart settings | table table"
    gap="0rem 2rem"
  >
    <Flex
      :direction="getLabelPosition"
      justify="center"
      align="center"
      nowrap
      class="kvass-chart-selector__chart-wrapper"
    >
      <div class="kvass-chart-selector__chart">
        <Doughnut
          class="kvass-chart-selector__chart-chart"
          :data="chartData"
          :options="chartOptions"
          :items="items"
          :key="format"
        />
        <Flex
          v-if="selected"
          direction="column"
          justify="center"
          align="center"
          gap="xxs"
          class="kvass-chart-selector__chart-center"
        >
          <span class="kvass-chart-selector__chart-center-label">
            {{ formatInput(selected.value) }}
          </span>
          <span class="kvass-chart-selector__chart-center-sublabel">
            {{ selected.label }}
          </span>
        </Flex>
      </div>
      <Flex
        direction="column"
        v-if="showLabels"
        align="start"
        justify="center"
        class="kvass-chart-selector__labels"
      >
        <div>{{ label }}</div>
        <Flex :direction="getLabelItemPosition" align="start">
          <Flex
            direction="row"
            v-for="item in items"
            align="center"
            justify="center"
            gap="5px"
            nowrap
          >
            <Icon icon="icon-park-outline:dot" :style="{ color: item.color }" />
            {{ item.label }}
          </Flex>
        </Flex>
      </Flex>
    </Flex>

    <Grid
      :columns="1"
      areas="title | format | show-labels | show-data-labels"
      class="kvass-chart-selector__settings"
      gap="lg"
    >
      <FormControl
        label="Hovedtittel"
        class="kvass-chart-selector__chart-title"
      >
        <Input v-model="label" />
      </FormControl>

      <FormControl
        label="Formater verdier som"
        class="kvass-chart-selector__format"
      >
        <RadioGroup
          :items="formatTypes"
          v-model="format"
          direction="horizontal"
        />
      </FormControl>

      <FormControl
        label="Vis forklaring"
        class="kvass-chart-selector__show-labels"
      >
        <Switch v-model="showLabels" />
      </FormControl>
      <FormControl
        label="Vis etiketter"
        class="kvass-chart-selector__show-data-labels"
      >
        <Switch v-model="showDataLabels" />
      </FormControl>
    </Grid>

    <FormControl class="kvass-chart-selector__table">
      <DataTable :columns="columns" :items="items">
        <template #color="{ item }">
          <Input type="color" v-model="item.color" />
        </template>
        <template #label="{ item }">
          <Input type="text" v-model="item.label" />
        </template>
        <template #value="{ item }">
          <Input type="number" v-model="item.value" />
        </template>
        <template #select="{ item, rowIndex }">
          <Checkbox
            v-model="item.selected"
            @update:model-value="(v) => setSelected(v, rowIndex)"
          ></Checkbox>
        </template>
        <template #remove="{ item, rowIndex }">
          <Button
            :disabled="items.length <= 1"
            icon="fa-pro-light:times"
            @click="removeItem(rowIndex)"
          ></Button>
        </template>
      </DataTable>

      <Button
        icon-right="fa-pro-light:plus"
        label="Legg til"
        @click="addItem"
      ></Button>
    </FormControl>
  </Grid>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-chart-selector {
  // Default variables
  --__kvass-chart-selector-background-color: white;
  --__kvass-chart-selector-max-width: 100%;
  --__kvass-chart-selector-size: 300px;

  background-color: var(
    --kvass-chart-selector-background-color,
    var(--__kvass-chart-selector-background-color)
  );
  max-width: var(
    --kvass-chart-selector-max-width,
    var(--__kvass-chart-selector-max-width)
  );

  &__chart {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    &-chart {
      width: var(
        --kvass-chart-selector-size,
        var(--__kvass-chart-selector-size)
      ) !important;
      height: var(
        --kvass-chart-selector-size,
        var(--__kvass-chart-selector-size)
      ) !important;
    }

    &-center {
      position: absolute;
      width: 100%;
      height: 100%;

      &-label {
        font-weight: bold;
        font-size: 1.2rem;
      }
    }
  }

  &__settings {
    --k-grid-item-area: settings;
    align-content: start;
    justify-self: end;
    align-self: start;

    background-color: whitesmoke;
    padding: 2rem;
    border-radius: var(--k-ui-rounding);
  }

  &__chart-wrapper {
    --k-grid-item-area: chart;
    // --k-grid-item-align-self:
  }
  &__chart-title {
    --k-grid-item-area: title;
  }
  &__format {
    --k-grid-item-area: format;
  }
  &__show-labels {
    --k-grid-item-area: show-labels;
  }
  &__show-data-labels {
    --k-grid-item-area: show-data-labels;
  }
  &__table {
    --k-grid-item-area: table;
  }

  .k-radiogroup--variant-radio.k-radiogroup--direction-horizontal {
    align-items: center;
  }

  .k-formcontrol {
    align-items: start;
    width: 100%;
  }

  .k-input {
    input[type='color'] {
      cursor: pointer;
      padding: 0;
    }

    input[type='number'] {
      // hide arrows from input number
      /* Chrome, Safari, Edge, Opera */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;
    }
  }
}
</style>
