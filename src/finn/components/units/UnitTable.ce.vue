<script setup lang="ts">
import { ref, toRef, computed, inject } from 'vue'
import { DataTable, Icon, Button, Scroller } from '@kvass/ui'

import UnitSettings from './UnitSettings.ce.vue'

import { Diff, hasDiff } from '../../../utils/index.js'

import { type Fields } from '../../api'
import { type Ad, Facility } from '../../types/ad'

import { vTooltip } from 'floating-vue'

import vGodfather from '../../directives/godfather'

import Validator from '../../composeable/Validator'

import { type Webcomponent } from '../../types/webcomponent'
import { PropsInjectionKey } from '../../keys'

const webcomponentProps = inject<Webcomponent>(
  PropsInjectionKey,
) as Webcomponent

const props = defineProps<{
  units: Fields['units']
  initialUnitFields: Fields['fields'][]
  facilities: Facility[]
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

const getIsEditedBind = (isEdited: boolean) => {
  return isEdited
    ? {
        icon: 'fa-pro-regular:cloud-xmark',
        label: 'Ikke synkronisert',
      }
    : {
        icon: 'fa-pro-regular:cloud-check',
        label: 'Synkronisert',
      }
}

const setIsHighlighted = (item, index) => {
  item['IS_HIGHLIGHTED'] = item['IS_HIGHLIGHTED'] === 'true' ? 'false' : 'true'

  modelValue.value.units[index].fields['IS_HIGHLIGHTED'] =
    item['IS_HIGHLIGHTED']
}

const getProjectUnitStepUrl = (id: string, step: string = 'basis') => {
  const url = new URL(
    `${webcomponentProps.tenant}/residentials/${id}/edit/${step}`,
  )

  return url.toString()
}
</script>

<template>
  <Scroller
    is="div"
    appearance="indicator"
    :treshhold="500"
    class="unit-table-scroller"
  >
    <DataTable
      :sticky="true"
      class="unit-table"
      :columns="[
        { id: 'unit', label: 'Enhet', size: '1fr' },
        {
          id: 'highlight',
          label: 'Fremhev enhet',
          align: 'center',
          size: '150px',
        },
        {
          id: 'settings',
          label: 'Innstillinger',
          align: 'center',
          size: '150px',
        },
      ]"
      :items="items"
    >
      <template #highlight-label="{ item }">
        <span
          v-html="item.label"
          v-godfather="{
            id: 'unit-highlight',
            options: {
              content: `Finn gjør det mulig å fremheve enheter i en prosjektannonse. Det betyr at de enhetene som er fremhevet vil bli ekstra synlig med egne kort på Finn-annonsen. Dette kan være relevant om det er enkelte enheter du vil promotere mer enn andre.`,
              hint: true,
              attachTo: 'hint',
              scrollIntoView: false,
            },
          }"
        ></span>
      </template>

      <template #unit="{ item, rowIndex: index }">
        <span> {{ item.HOUSING_UNIT_REF }}</span>
        <template v-if="validatorComp[index].error">
          <Icon
            class="unit-table__error disable-focus-modal"
            icon="fa-pro-solid:exclamation-triangle"
            v-tooltip="{
              content: validatorComp[index].error,
              container: false,
            }"
          />
          <Button
            class="k-ml-lg disable-focus-modal"
            is="a"
            target="_blank"
            label="Gå til enhet"
            size="small"
            :href="getProjectUnitStepUrl(item.USER_REFERENCE)"
            iconRight="fa-pro-light:arrow-up-right-from-square"
          ></Button>
        </template>
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
          tabindex="0"
          @keydown.enter="
            () => {
              setIsHighlighted(item, index)
            }
          "
          @click="
            () => {
              setIsHighlighted(item, index)
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
          :getIsEditedBind="(...args: [any]) => getIsEditedBind(...args)"
          :isEdited="(...args: [any]) => isEdited(index, ...args)"
          :rules="units.map((v) => v.rules)[index]"
          :labels="units.map((v) => v.labels)[index]"
          :facilities="facilities"
        />
      </template>
      <!-- <template #footer>
      <Button label="Se flere enheter"></Button>
    </template> -->
    </DataTable>
  </Scroller>
</template>

<style lang="scss">
.unit-table {
  &-scroller {
    max-height: 1000px;
  }

  box-sizing: border-box;
  padding: var(--k-ui-spacing);
  border-radius: var(--k-ui-rounding);
  background-color: white;

  --k-dialog-max-width: 900px;
  --k-dialog-min-width: 900px;

  --k-datatable-cell-size: 1rem;
  --k-datatable-odd-color: white;
  --k-datatable-even-color: var(--k-ui-color-neutral-lightest);

  &__actions {
    --k-button-secondary-background: white;
  }

  &__error {
    margin-left: 0.5rem;
    color: var(--k-ui-color-danger-dark);
    // background: var(--k-ui-color-danger-lightest);

    &:focus {
      outline: var(--k-ui-outline-width) solid var(--k-ui-outline-color);
      outline-offset: var(--k-ui-outline-offset);
    }

    &[data-popper-shown] {
      /* element is hovered */
    }
  }

  [data-col-id='highlight'] {
    .godfather-hint {
      right: -25px;
    }
  }

  &__highlight {
    &:focus {
      outline: var(--k-ui-outline-width) solid var(--k-ui-outline-color);
      outline-offset: var(--k-ui-outline-offset);
    }

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
