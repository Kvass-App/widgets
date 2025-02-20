<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
  Input,
  FormControl,
  Grid,
  Card,
  Dropdown,
  DataTable,
  Button,
  Badge,
} from '@kvass/ui'

import { toCurrency } from '../../../../utils'

import { type Webcomponent } from '../../../types/webcomponent'
import { type Ad, Unit } from '../../../types/ad'

import Categories from '../../../enums/categories'

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

const selectedCategory = computed(() =>
  Categories.find((v) => v.type === modelValue.value.type),
)

const columns = computed(() => {
  return [
    {
      id: 'name',
      label: 'Navn',
    },
    {
      id: 'type',
      label: 'Enhetstype',
    },
    {
      id: 'status',
      label: 'Status',
    },
    {
      id: 'price',
      label: 'Pris',
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

const unitDisabled = (item) => {
  return item.disabled
}

const submit = () => {
  props.onNext()
}

const selected = computed({
  get() {
    return props.units.filter((v) =>
      modelValue.value.units.some((unit) => unit.id === v.id),
    )
  },
  set(newValue) {
    modelValue.value.units = newValue.map((v) => {
      const { price, propertyType, status, group, disabled, ...rest } = v

      return {
        fields: {},
        ...rest,
      }
    })
  },
})

const rules = computed(() => {
  return {
    name: 'required',
    type: 'required',
  }
})

const labels = computed(() => {
  return {
    name: 'Navn',
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
})

const { bind: validate } = validator
</script>

<template>
  <Card
    class="type"
    title="Grunnlag for Finn-annonsen"
    variant="prompt"
    appearance="shadow"
    subtitle="Definer annonsen sitt interne navn, boligtypen annonsen skal ligge under på Finn og hvilke enheter du skal ha på din annonse."
  >
    <template #default>
      <Grid columns="2" gap="4rem 2rem">
        <FormControl
          label="Internt navn på Finn annonse"
          v-bind="validate('name')"
        >
          <Input v-model="modelValue.name"></Input>
        </FormControl>

        <FormControl
          v-bind="validate('type')"
          label="Velg annonse-kategori"
          help="Dette legger annonsen på riktig boligtype på Finn"
        >
          <Dropdown
            :disabled="Boolean(webcomponentProps.id)"
            :items="
              Categories.map((v) => {
                return {
                  ...v,
                  action: () => (modelValue.type = v.type),
                }
              })
            "
            :label="selectedCategory?.label || 'Velg...'"
          />
        </FormControl>

        <FormControl
          label="Velg enheter som skal være på Finn-annonsen"
          class="k-grid-span-full"
        >
          <DataTable
            :columns="columns"
            :items="units"
            v-model:selected="selected"
            :isDisabled="unitDisabled"
          >
            <template #name="{ item }"> {{ item.name }}</template>
            <template #type="{ item }"> {{ item.propertyType.label }}</template>
            <template #status="{ item }">
              <Badge
                appearance="filled"
                :variant="getStatusVariant(item.status.value)"
                :rounded="true"
              >
                <template #default> {{ item.status.label }} </template>
              </Badge>
            </template>
            <template #price="{ item }"> {{ toCurrency(item.price) }}</template>
          </DataTable>
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
      />
    </template>
  </Card>
</template>

<style lang="scss">
.type {
}
</style>
