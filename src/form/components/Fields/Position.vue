<script setup>
import { computed } from 'vue'
import LocationSelector from '../../../location-selector/components/Selector.ce.vue'
import { Alert } from '@kvass/ui'

const props = defineProps({
  mapboxApiToken: {
    type: String,
    required: true,
  },
  mapboxTheme: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const hasPositionsErrors = computed(() => {
  if (!props.modelValue?.placement) return false
  if (!props.modelValue?.address) return true
  return false
})

function update(event) {
  if (!event.detail) return
  const value = JSON.parse(JSON.stringify(event.detail))

  const coordinates = value?.location?.coordinates || []

  emit('update:modelValue', {
    address: value.formatted,
    placement: coordinates[0]
      ? `https://maps.google.com/maps?q=${coordinates[1]},${coordinates[0]}`
      : '',
  })
}
</script>

<template>
  <LocationSelector
    :value="modelValue"
    @webcomponent:update="($ev) => update($ev)"
    :mapbox-api-token="mapboxApiToken"
    :theme="mapboxTheme"
    :show-warning="false"
    :show-selected="false"
    :reset="false"
    aspect-ratio="1.3"
  ></LocationSelector>
  <Alert
    v-if="hasPositionsErrors || modelValue?.address"
    :icon="`fa-pro-solid:${
      hasPositionsErrors ? 'triangle-exclamation' : 'circle-info'
    }`"
    :variant="hasPositionsErrors ? 'danger' : 'info'"
    class="integration-plot-tip-us__form-alert"
  >
    {{
      modelValue?.address
        ? `Valgt posisjon: ${modelValue?.address}`
        : `Posisjonen / adressen du har oppgitt er ikke gyldig. Prøv på nytt!`
    }}
  </Alert>
  <Alert
    v-if="!modelValue?.address && !hasPositionsErrors"
    icon="fa-pro-solid:circle-info"
  >
    Har du ingen adresse? Flytt markøren på kartet for å sette en ca. posisjon.
  </Alert>
</template>

<style lang="scss"></style>
