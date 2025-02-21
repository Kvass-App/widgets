<script setup lang="ts">
import { ref, toRef, computed } from 'vue'
import { DataTable, Icon } from '@kvass/ui'

import UnitSettings from './UnitSettings.ce.vue'

import { Diff, hasDiff } from '../../../utils/index.js'

import { type Fields } from '../../api'
import { type Ad } from '../../types/ad'

import 'floating-vue/dist/style.css'
import { vTooltip } from 'floating-vue'

import Validator from '../../composeable/Validator'

const props = defineProps<{
  units: Fields['units']
  initialUnitFields: Fields['fields'][]
}>()

const modelValue = defineModel<Ad>({ default: {} })

const items = ref(
  props.units.map((v, index) => {
    return v.fields
  }),
)

const validatorComp = computed(() => {
  return props.units.map((v, index) => {
    const validator = Validator({
      rules: toRef(v.rules),
      labels: toRef(v.labels),
      data: toRef(v.fields),
    })

    const passes = validator.passes.value
    const error = Object.entries(validator.errors.value.errors)
      .map(([key, value]) => value)
      .flat()
      .join('\n')

    return {
      errors: validator.errors.value,
      validate: validator.bind,
      passes: passes,
      error: error,
    }
  })
})

const hasField = (item, field) => Boolean(item.hasOwnProperty(field))

const hasFields = (item, ...args) =>
  Boolean(args.map((field) => hasField(item, field)).find(Boolean))

const isEdited = (index, field) => {
  if (!modelValue.value.units[index]) return false
  return modelValue.value.units[index].fields.hasOwnProperty(field)
}

const getIsEditedIcon = (isEdited: boolean) => {
  return isEdited ? 'fa-pro-regular:link-slash' : 'fa-pro-regular:link'
}
</script>

<template>
  <DataTable
    class="unit-table"
    :columns="[
      { id: 'unit', label: 'Enhet', size: '1fr' },
      {
        id: 'highlight',
        label: 'Fremhev enhet',
        align: 'center',
        size: '150px',
      },
      { id: 'settings', label: 'Instillinger', align: 'center', size: '150px' },
    ]"
    :items="items"
  >
    <template #unit="{ item, rowIndex: index }">
      <span> {{ item.HOUSING_UNIT_REF }}</span>
      <Icon
        class="unit-table__error"
        v-if="validatorComp[index].error"
        icon="fa-pro-light:exclamation-triangle"
        v-tooltip="{ content: validatorComp[index].error }"
      />
    </template>

    <template #highlight="{ item, rowIndex: index }">
      <Icon
        :class="[
          'unit-table__highlight',
          {
            'unit-table__highlight--selected': item.IS_HIGHLIGHTED === 'true',
          },
        ]"
        icon="fa-pro-solid:star"
        @click="
          () => {
            item['IS_HIGHLIGHTED'] =
              item['IS_HIGHLIGHTED'] === 'true' ? 'false' : 'true'

            modelValue.units[index].fields['IS_HIGHLIGHTED'] =
              item['IS_HIGHLIGHTED']
          }
        "
      ></Icon>
    </template>
    <template #settings="{ item, rowIndex: index }">
      <UnitSettings
        :units="units"
        :key="item.id"
        :modelValue="item"
        @update:modelValue="
          (value) => {
            Object.entries(Diff(item, value)).map(([k, v]) => {
              item[k] = v

              modelValue.units[index].fields[k] = v

              if (
                !hasDiff({ value: v }, { value: initialUnitFields[index][k] })
              ) {
                delete modelValue.units[index].fields[k]
              }
            })
          }
        "
        :hasFields="(...args: [any]) => hasFields(item, ...args)"
        :hasField="(...args: [any]) => hasField(item, ...args)"
        :getIsEditedIcon="(...args: [any]) => getIsEditedIcon(...args)"
        :isEdited="(...args: [any]) => isEdited(index, ...args)"
        :rules="units.map((v) => v.rules)[index]"
        :labels="units.map((v) => v.labels)[index]"
      />
    </template>
  </DataTable>
</template>

<style lang="scss">
.unit-table {
  box-sizing: border-box;
  padding: var(--k-ui-spacing);
  border-radius: var(--k-ui-rounding);
  background-color: white;

  --k-datatable-cell-size: 1rem;
  --k-datatable-odd-color: transparent;
  --k-datatable-even-color: var(--k-ui-color-neutral-lightest);

  &__actions {
    --k-button-secondary-background: white;
  }

  &__error {
    padding-left: 0.5rem;
    color: var(--k-ui-color-danger-dark);
    // background: var(--k-ui-color-danger-lightest);

    &[data-popper-shown] {
      /* element is hovered */
    }
  }

  &__highlight {
    &:hover {
      cursor: pointer;

      &:not(.unit-table__highlight--selected) {
        color: var(--k-ui-color-neutral-dark);
      }
    }

    font-size: 2rem;
    color: var(--k-ui-color-neutral);

    &--selected {
      color: var(--k-ui-color-primary);
    }
  }
}
</style>
