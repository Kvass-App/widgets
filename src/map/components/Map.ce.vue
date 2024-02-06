<script setup>
import { Map as MapComponent } from '@kvass/map'
import { LazyLoad } from '@kvass/ui'
import { computed, reactive } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    required: true,
  },
  mapboxApiToken: {
    type: String,
    required: true,
  },
  /**
   * The coordinates in the format of 'latitude,longitude'
   */
  coordinates: {
    type: String,
    required: true,
  },

  /**
   * Coordinates for additional map markers in the format of 'latitude,longitude;latitude,longitude'
   */
  markers: {
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
})

const coordinatesComp = computed(() => props.coordinates.split(','))
const markersComp = computed(() =>
  props.markers?.split(';').map((m) => m.split(',')),
)

const mapOptions = reactive({
  style: props.theme,
  accessToken: props.mapboxApiToken,
})
</script>

<template>
  <LazyLoad>
    <MapComponent
      :coordinates="coordinatesComp"
      :zoom="parseInt(props.zoom)"
      :markers="markersComp"
      :map-options="mapOptions"
    />
  </LazyLoad>
</template>

<style>
@import url('@kvass/map/style.css');
</style>
