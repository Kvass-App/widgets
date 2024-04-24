<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
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
    labelPosition: labelPositions
    type: Type
    colors: string
    value: string
    label: string
  }>(),
  {
    labelPosition: 'right',
    type: 'doughnut',
    colors:
      '#102B37,#27525D,#D6E4EB,#FBECD9,#FCFAF6,#8E789D,#D37468,#DE7549,#4A1A29,#7C2A26',
    value: '',
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

const showLabels = ref<boolean>(true)
const showDataLabels = ref<boolean>(true)
const colors = computed(() => props.colors.split(','))
const items = ref<Item[]>([
  { color: '#102B37', label: 'item 1', value: 100, selected: false },
  { color: '#27525D', label: 'item 2', value: 100, selected: false },
])
const element = useCurrentElement()
const format = ref('percentage')
const label = ref('Diagram')

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

//set data from prop value
if (props.value) {
  let v = JSON.parse(props.value) || []

  Object.entries(v).forEach(([key, value]) => {
    if (!value) return
    switch (key) {
      case 'items':
        items.value = v.items
      case 'label':
        label.value = v.label
      case 'showLabels':
        showLabels.value = v.showLabels
      case 'showDataLabels':
        showDataLabels.value = v.showDataLabels
      case 'format':
        format.value = v.format
    }
  })
}
</script>

<template>
  <div class="kvass-chart-builder__wrapper">
    <b>{{ props.label }}</b>
    <Grid
      class="kvass-chart-builder"
      columns="1fr min-content"
      areas="chart settings | table table"
      gap="1rem 2rem"
    >
      <Flex
        :direction="getLabelPosition"
        justify="center"
        align="center"
        nowrap
        class="kvass-chart-builder__chart-wrapper"
      >
        <div class="kvass-chart-builder__chart">
          <Doughnut
            class="kvass-chart-builder__chart-chart"
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
            class="kvass-chart-builder__chart-center"
          >
            <span class="kvass-chart-builder__chart-center-label">
              {{ formatInput(selected.value) }}
            </span>
            <span class="kvass-chart-builder__chart-center-sublabel">
              {{ selected.label }}
            </span>
          </Flex>
        </div>
        <Flex
          direction="column"
          v-if="showLabels"
          align="start"
          justify="center"
          class="kvass-chart-builder__labels"
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
              <Icon
                icon="icon-park-outline:dot"
                :style="{ color: item.color }"
              />
              {{ item.label }}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Grid
        :columns="1"
        areas="title | format | show-labels | show-data-labels"
        class="kvass-chart-builder__settings"
        gap="lg"
      >
        <FormControl
          label="Hovedtittel"
          class="kvass-chart-builder__chart-title"
        >
          <Input v-model="label" />
        </FormControl>

        <FormControl
          label="Formater verdier som"
          class="kvass-chart-builder__format"
        >
          <RadioGroup
            :items="formatTypes"
            v-model="format"
            direction="horizontal"
          />
        </FormControl>

        <FormControl
          label="Vis forklaring"
          class="kvass-chart-builder__show-labels"
        >
          <Switch v-model="showLabels" />
        </FormControl>
        <FormControl
          label="Vis etiketter"
          class="kvass-chart-builder__show-data-labels"
        >
          <Switch v-model="showDataLabels" />
        </FormControl>
      </Grid>

      <FormControl class="kvass-chart-builder__table">
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
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-chart-builder {
  // Default variables
  --__kvass-chart-builder-background-color: white;
  --__kvass-chart-builder-max-width: 100%;
  --__kvass-chart-builder-size: 350px;
  --__kvass-chart-builder-border: 1px solid #eaeaea;
  padding: 1rem;

  background-color: var(
    --kvass-chart-builder-background-color,
    var(--__kvass-chart-builder-background-color)
  );
  max-width: var(
    --kvass-chart-builder-max-width,
    var(--__kvass-chart-builder-max-width)
  );
  margin-top: 0.5rem;

  border: var(
    --kvass-chart-builder-border,
    var(--__kvass-chart-builder-border)
  );

  border-radius: var(--kvass-chart-builder-border-radius, 3px);

  &__chart {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    &-chart {
      width: var(
        --kvass-chart-builder-size,
        var(--__kvass-chart-builder-size)
      ) !important;
      height: var(
        --kvass-chart-builder-size,
        var(--__kvass-chart-builder-size)
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
    --k-datatable-odd-color: white;

    padding: 1rem;
    background-color: whitesmoke;
    border-radius: var(--k-ui-rounding);
  }

  .k-radiogroup--variant-radio.k-radiogroup--direction-horizontal {
    align-items: center;
  }

  .k-formcontrol {
    align-items: start;
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
