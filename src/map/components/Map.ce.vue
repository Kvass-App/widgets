<script setup>
import { Map as MapComponent } from '@kvass/map'
import { LazyLoad } from '@kvass/ui'
import { computed, reactive } from 'vue'

const props = defineProps({
  theme: {
    type: String,
  },
  mapboxApiToken: {
    type: String,
  },
  mapOptions: {
    type: String,
    default: '{}',
  },
  /**
   * The coordinates in the format of 'latitude,longitude'
   */
  coordinates: {
    type: String,
  },

  /**
   * Coordinates for additional map markers in the format of 'latitude,longitude;latitude,longitude'
   */
  markers: {
    type: String,
  },

  center: {
    type: String,
  },

  /**
   * Pop up content for additional map markers in the format of 'thumbnail,description,action,actionLabel'
   */
  popUpContent: {
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

const coordinatesComp = computed(() =>
  props.coordinates ? props.coordinates.split(',') : null,
)

const centerComp = computed(() =>
  props.center ? props.center.split(',') : null,
)

const markersComp = computed(() => {
  const content = props.popUpContent?.split(';').map((m) => m.split(','))

  return props.markers
    ?.split(';')
    .map((m) => m.split(','))
    .map((i, index) => {
      return {
        coordinates: i.map((c) => parseFloat(c)),
        content: content?.length
          ? {
              thumbnail: content?.[index]?.[0],
              description: content?.[index]?.[1],
              action: content?.[index]?.[2],
              actionLabel: content?.[index]?.[3],
            }
          : null,
      }
    })
})

const mapOptions = reactive({
  style: props.theme,
  accessToken: props.mapboxApiToken,
  ...(JSON.parse(props.mapOptions) || {}),
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
      :center="centerComp"
    />
  </LazyLoad>
</template>

<style lang="scss">
@import url('@kvass/map/style.css');

.kvass-map {
  @media screen and (max-width: 680px) {
    aspect-ratio: 1/1.4;
  }
}
</style>
