<script setup>
import { Map as MapComponent } from '@kvass/map'
import { computed } from 'vue'

const props = defineProps({
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
</script>

<template>
  <MapComponent
    :coordinates="coordinatesComp"
    :zoom="parseInt(props.zoom)"
    :markers="markersComp"
  />
</template>

<style>
@import url('@kvass/map/style.css');
</style>
