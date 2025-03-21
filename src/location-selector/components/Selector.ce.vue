<script setup>
import { LocationSelector as Selector } from '@kvass/location-selector'
import { reactive, watch, ref, onMounted } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { transformBoolean } from '../../utils'

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
  value: {
    type: String,
  },
  language: {
    type: String,
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

const item = ref({
  location: {},
  postcode: 0,
  county: '',
  city: '',
  street: '',
  formatted: '',
})

if (props.value) {
  const content = JSON.parse(`${props.value}`)
  if (content?.location) item.value = content
}

const element = useCurrentElement()

watch(
  () => item.value,
  (val) => {
    if (!val || !element.value) return

    element.value.dispatchEvent(
      new CustomEvent('webcomponent:update', {
        detail: val,
        bubbles: true,
        composed: true,
      }),
    )
  },
  { deep: true },
)
</script>

<template>
  <Selector
    v-model="item"
    :zoom="parseInt(props.zoom)"
    :map-options="mapOptions"
    :aspect-ratio="aspectRatio"
    :autocomplete="transformBoolean(props.autocomplete)"
    :label="props.label"
    :show-selected="transformBoolean(props.showSelected)"
    :show-warning="transformBoolean(props.showWarning)"
    :language="language"
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
