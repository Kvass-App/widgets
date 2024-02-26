<script setup>
import { LocationSelector as Selector } from '@kvass/location-selector'
import { reactive, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
const value = defineModel('value')

const props = defineProps({
  theme: {
    type: String,
    required: true,
  },
  mapboxApiToken: {
    type: String,
    required: true,
  },
  label: {
    type: String,
  },
  autocomplete: {
    type: String,
  },

  showWarning: {
    type: Boolean,
    default: true,
  },
  showSelected: {
    type: Boolean,
    default: true,
  },
  /**
   * The map zoom level. Lower is more zoomed out
   */
  zoom: {
    type: String,
    default: '8',
    validator(value) {
      return typeof parseInt(value) === 'number'
    },
  },

  aspectRatio: String,
})

const mapOptions = reactive({
  style: props.theme,
  accessToken: props.mapboxApiToken,
})

const element = useCurrentElement()

watch(
  () => value.value,
  (val) => {
    if (!val) return
    // emit custom event
    element.value.dispatchEvent(
      new CustomEvent('webcomponent:update', {
        detail: val,
        bubbles: true,
        composed: true,
      }),
    )
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <Selector
    v-model.lazy="value"
    :zoom="parseInt(props.zoom)"
    :map-options="mapOptions"
    :aspect-ratio="aspectRatio"
    :autocomplete="props.autocomplete"
    :label="props.label"
    :show-selected="props.showSelected"
    :show-warning="props.showWarning"
  />
</template>

<style lang="scss">
@import url('@kvass/location-selector/style.css');

.kvass-map {
  @media screen and (max-width: 680px) {
    aspect-ratio: 1/1.4;
  }
}
</style>
