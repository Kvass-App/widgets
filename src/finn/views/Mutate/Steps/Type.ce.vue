<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue'
import {
  Input,
  FormControl,
  Grid,
  Card,
  Dropdown,
  DataTable,
  Button,
  Badge,
  Flex,
  Scroller,
} from '@kvass/ui'

import Tooltip from '../../../components/Tooltip.ce.vue'
import { vTooltip, createTooltip } from 'floating-vue'

import { toCurrency } from '../../../../utils'

import { type Webcomponent } from '../../../types/webcomponent'
import { type Ad, Unit } from '../../../types/ad'

import Categories from '../../../enums/categories'
import type { Category } from '../../../enums/categories'

import Validator from '../../../composeable/Validator'

import { PropsInjectionKey } from '../../../keys'
import { useAPI } from '../../../api'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const webcomponentProps = inject<Webcomponent>(
  PropsInjectionKey,
) as Webcomponent

const props = defineProps<{
  onNext: any
  onPrev: any
  units: Unit[]
}>()

const modelValue = defineModel<Ad>({ default: {} })

const getCategoriesByGroup = computed(() => {
  const groupedByCategory = Categories.reduce<Record<string, Category[]>>(
    (acc, estate) => {
      if (!acc[estate.group]) {
        acc[estate.group] = []
      }
      acc[estate.group].push(estate)
      return acc
    },
    {},
  )

  const groupedArray = Object.entries(groupedByCategory).map(
    ([group, items]) => ({
      group,
      items,
    }),
  )

  return groupedArray
})

const selectedCategory = computed(() =>
  Categories.find((v) => v.type === modelValue.value.type),
)

const columns = computed(() => {
  return [
    {
      id: 'name',
      label: 'Navn',
      sort: true,
    },
    {
      id: 'type',
      label: 'Enhetstype',
      sort: true,
    },
    {
      id: 'status',
      label: 'Status',
      sort: true,
    },
    {
      id: 'price',
      label: 'Pris',
      sort: true,
    },
  ]
})

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'info'
    case 'sale':
      return 'success'
    case 'reserved':
      return 'warning'
    case 'sold':
      return 'danger'
    default:
      return 'neutral'
  }
}

function unitDisabled(item) {
  return item.disabled
}

const submit = () => {
  props.onNext()
}
const sortBy = ref<Record<string, 1 | -1>>({ name: 1 })

const items = computed(() => {
  return props.units.sort((a, b) => {
    let [sortByKey] = Object.keys(sortBy.value)
    let [sortByValue] = Object.values(sortBy.value)

    const getValue = (v) => {
      if (sortByKey === 'status') return v[sortByKey]['label']
      if (sortByKey === 'type') return v['propertyType']['label']
      return v[sortByKey]
    }

    const valA = getValue(a)
    const valB = getValue(b)

    const sortDirection = sortByValue < 0

    const isNumA = !isNaN(valA)
    const isNumB = !isNaN(valB)

    if (isNumA && isNumB) {
      return sortDirection ? valB - valA : valA - valB
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection
        ? valB.localeCompare(valA, 'nb-NO', {
            numeric: true,
            sensitivity: 'base',
          })
        : valA.localeCompare(valB, 'nb-NO', {
            numeric: true,
            sensitivity: 'base',
          })
    }

    return 0
  })
})

const selected = computed({
  get() {
    return items.value.filter((v) =>
      modelValue.value.units.some((unit) => unit.id === v.id),
    )
  },
  set(newValue) {
    modelValue.value.units = newValue.map((v) => {
      const {
        price,
        propertyType,
        status,
        disabled,
        saleType,
        disabledReason,
        ...rest
      } = v

      return {
        fields: {},
        ...rest,
      }
    })
  },
})

const sortableBy = computed(() =>
  columns.value.filter((v) => v.sort).map((v) => v.id),
)

const rules = computed(() => {
  const base = {
    name: 'required',
    type: 'required',
  }

  if (
    selectedCategory.value?.type === 'ESTATE_PROJECT_SINGLE' &&
    modelValue.value.units.length
  )
    return {
      units: 'size:1',
      ...base,
    }

  if (
    ['ESTATE_PROJECT', 'ESTATE_PROJECT_LEISURE'].includes(
      selectedCategory.value?.type || '',
    )
  ) {
    return {
      units: 'min:1',
      ...base,
    }
  }

  return base
})

const labels = computed(() => {
  return {
    name: 'Internt navn',
    type: 'Annonse-kategori',
    units: 'enhet',
  }
})

const customMessages = computed(() => {
  return {
    min: `Du må minimum velge :min :attribute når "${Categories.find((v) => v.type === 'ESTATE_PROJECT')?.label}" eller "${Categories.find((v) => v.type === 'ESTATE_PROJECT_LEISURE')?.label}" er valgt som annonse-kategori`,
    size: `Du kan kun velge :size :attribute når "${Categories.find((v) => v.type === 'ESTATE_PROJECT_SINGLE')?.label}" er valgt som annonse-kategori`,
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
  customMessages: customMessages,
})

const { bind: validate } = validator

const unitTable = ref()

onMounted(() => {
  const parent = unitTable.value?.$el
  if (!parent) return

  let elements = parent.querySelectorAll(
    '[data-scope="checkbox"][data-part="root"][data-disabled]',
  )

  const disabledItems = items.value.filter((v) => v.disabled)

  elements.forEach((el, index) => {
    const content = disabledItems[index].disabledReason

    const tooltip = createTooltip(
      el,
      {
        container: false,
        triggers: ['hover', 'focus'],
        content: content,
        placements: 'auto',
        preventOverflow: true,
      },
      null,
    )
  })
})
</script>

<template>
  <Card
    class="type"
    title="Grunnlag for Finn-annonsen"
    variant="prompt"
    appearance="shadow"
    subtitle="Definer annonsen sitt interne navn, annonse-kategorien definerer hvor den plasseres på Finn."
  >
    <template #default>
      <Grid columns="2" gap="4rem 2rem">
        <FormControl v-bind="validate('name')">
          <template #label>
            <span>Internt navn på Finn-annonse </span>

            <Tooltip
              content="Det interne navnet gjør det lettere å finne annonsen i oversikten over Finn-annonsene på prosjektet, spesielt hvis du planlegger å ha flere annonser på samme prosjekt!"
            />
          </template>
          <Input v-model="modelValue.name"></Input>
        </FormControl>

        <FormControl
          v-bind="validate('type')"
          help="Dette legger annonsen på riktig boligtype på Finn"
        >
          <template #label>
            <span> Velg annonse-kategori </span>
            <Tooltip
              content="En annonse-kategori gjør det mulig å bestemme ønsket plass i Finn for din type annonse. Dersom du for eksempel skal leie ut en bolig kan du benytte bolig til leie. Annonsen vil deretter plasseres på bolig til leie på Finn."
            />
          </template>
          <Dropdown
            :teleport="false"
            :disabled="Boolean(webcomponentProps.id)"
            label="Velg..."
            class="category"
          >
            <template #trigger v-if="selectedCategory">
              <Flex class="category__label-wrapper">
                <div class="category__label">
                  {{ selectedCategory.label }}
                </div>
                <div class="category__sublabel">
                  {{ selectedCategory.sublabel }}
                </div>
              </Flex>
            </template>
            <template #default="{ close }">
              <template v-for="category in getCategoriesByGroup">
                <div class="category__group">{{ category.group }}</div>

                <Button
                  v-for="item in category.items"
                  variant="tertiary"
                  @click="
                    () => {
                      modelValue.type = item.type
                      close()
                    }
                  "
                  :disabled="item.disabled(units)"
                  v-tooltip="{
                    content: item.disabledReason,
                    disabled: !item.disabled(units),
                    container: false,
                  }"
                >
                  <Flex class="category__label-wrapper">
                    <div class="category__label">{{ item.label }}</div>
                    <div class="category__sublabel">
                      {{ item.sublabel }}
                    </div>
                  </Flex>
                </Button>
              </template>
            </template>
          </Dropdown>
        </FormControl>

        <FormControl
          v-if="items.length"
          label="Velg hvilke enheter du vil publisere i Finn-annonse"
          class="k-grid-span-full"
        >
          <Scroller
            is="div"
            appearance="indicator"
            :treshhold="200"
            class="table-scroller"
          >
            <DataTable
              ref="unitTable"
              :sticky="true"
              :sortableBy="sortableBy"
              v-model:sortBy="sortBy"
              :columns="columns"
              :items="items"
              v-model:selected="selected"
              :isDisabled="unitDisabled"
            >
              <template #name="{ item }"> {{ item.name }}</template>
              <template #type="{ item }">
                {{ item.propertyType.label }}</template
              >
              <template #status="{ item }">
                <Badge
                  appearance="filled"
                  :variant="getStatusVariant(item.status.value)"
                  :rounded="true"
                >
                  <template #default> {{ item.status.label }} </template>
                </Badge>
              </template>
              <template #price="{ item }">
                {{ toCurrency(item.price) }}
              </template>
            </DataTable>
          </Scroller>
        </FormControl>
      </Grid>
    </template>
    <template #actions>
      <Button
        label="Avbryt"
        variant="secondary"
        @click="() => API.navigateView('dashboard')"
      />
      <Button
        label="Neste"
        variant="primary"
        icon-right="fa-pro-solid:arrow-right"
        :disabled="!validator.passes.value"
        @click="() => submit()"
        v-tooltip="{
          content: Object.entries(validator.errors.value.errors)
            .map(([key, value]) => value)
            .flat()
            .join('\n'),
          disabled: validator.passes.value,
          container: false,
        }"
      />
    </template>
  </Card>
</template>

<style lang="scss">
.type {
  .table-scroller {
    max-height: 650px;
    position: relative;
  }

  .category {
    &__group {
      font-weight: bold;
      padding-inline: var(--k-ui-spacing-sm);
      padding-top: var(--k-ui-spacing-xs);
    }

    &__label-wrapper {
      flex-direction: column;
      gap: var(--k-ui-spacing-xxs);
      align-items: start;
    }

    &__label {
    }
    &__sublabel {
      font-size: var(--k-ui-font-size-sm);
      opacity: var(--k-ui-opacity-faded);
    }
  }
}
</style>
