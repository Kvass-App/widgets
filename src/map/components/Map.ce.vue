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

  /**
   * The formatted address. Will be visible in the bottom of the map
   */
  address: String,

  aspectRatio: String,
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
      :address="address"
      :show-address="Boolean(address)"
      :aspect-ratio="aspectRatio"
    />
  </LazyLoad>
</template>

<style lang="scss">
@import url('@kvass/map/style.css');

.kvass-map {
  @media screen and (max-width: 680px) {
    aspect-ratio: 1/1.4;
  }

  &__address {
    right: 0;
    left: 0;
    text-align: center;
    padding-inline: var(--kvass-map-address-padding-x, 0.5rem);
  }
}
</style>
