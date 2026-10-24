<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue'
import { Slider, Input, Grid, GridItem } from '@kvass/ui'
import { getCurrencyInputProps, format as formatFactory } from '../../utils'

const metadata = inject('metadata')

const props = defineProps({
  label: String,
  min: Number,
  max: Number,
  step: Number,
  format: String,
  disabled: Boolean,
})

const formatting = computed(() => {
  switch (props.format) {
    case 'currency':
      return getCurrencyInputProps({
        locale: metadata.value.locale,
        currency: metadata.value.currency,
      })
    case 'year':
      return {
        suffix: new Intl.NumberFormat(metadata.value.locale, {
          style: 'unit',
          unit: 'year',
          unitDisplay: 'long',
        })
          .formatToParts(model.value)
          .find((part) => part.type === 'unit').value,
      }
    case 'percent':
      return { suffix: '%' }
    default:
      return {}
  }
})

const formatValue = computed(() => {
  const { locale, currency } = metadata.value
  if (props.format === 'percent')
    return formatFactory('percent', { locale, maximumFractionDigits: 1 })
  return formatFactory(props.format, { locale, currency })
})

const model = defineModel()
const input = ref()

watch(model, (val) => (input.value = val), { immediate: true })

const onInputBlur = () => {
  input.value = Math.min(props.max, Math.max(props.min, input.value))
  model.value = input.value
}
</script>

<template>
  <Grid
    :class="[
      'kvass-loan-calculator-slider',
      { 'kvass-loan-calculator-slider--disabled': disabled },
    ]"
    :areas="!disabled ? 'label input | slider slider' : 'label input'"
  >
    <GridItem area="label">
      <label>{{ label }}</label>
    </GridItem>
    <GridItem area="input">
      <Input
        v-model="input"
        align="right"
        v-bind="formatting"
        :disabled="disabled"
        @blur="onInputBlur"
      />
    </GridItem>
    <GridItem v-if="!disabled" area="slider">
      <Slider
        v-model="model"
        :label="label"
        :format="formatValue"
        :min="min"
        :max="max"
        :step="step"
        :getRootNode="() => metadata.root.value.getRootNode()"
      />
    </GridItem>
  </Grid>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');
.kvass-loan-calculator-slider {
  label {
    font-weight: bold;
  }

  output {
    display: none !important;
  }

  .k-input {
    --k-input-border-color: transparent;
    gap: 0.5ch;
    align-items: baseline;

    input,
    &__suffix,
    &__prefix {
      color: inherit;
      background-color: transparent;
      padding: 0;
    }
  }
}
</style>
