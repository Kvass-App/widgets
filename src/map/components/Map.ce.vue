<script setup>
import { Map as MapComponent } from '@kvass/map'
import { LocationSelector as Selector } from '@kvass/location-selector'
import { LazyLoad, Card, Button } from '@kvass/ui'
import { computed, reactive, ref, watch } from 'vue'

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
  markerIcon: {
    type: String,
    default: '{}',
  },
  search: {
    type: Boolean,
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
  description: {
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

  /**
   * The formatted address. Will be visible in the bottom of the map
   */
  address: String,

  aspectRatio: String,
})

const selected = ref('')
const match = ref([])

watch(
  () => selected.value,
  (val) => {
    const coordinates = (val?.location?.coordinates || []).map((c) =>
      Math.round(c),
    )
    match.value = markersComp.value?.filter((i) => {
      const current = i.coordinates
      return current.every((c) => coordinates.includes(Math.round(c)))
    })
  },
  { deep: true },
)

const coordinatesComp = computed(() =>
  props.coordinates ? props.coordinates.split(',') : null,
)

const centerComp = computed(() =>
  props.center ? props.center.split(',') : null,
)

const markersComp = computed(() => {
  return JSON.parse(props.markers || {})
})

const mapOptions = reactive({
  style: props.theme,
  accessToken: props.mapboxApiToken,
  ...(JSON.parse(props.mapOptions) || {}),
})

const markerIcon = reactive({
  ...(JSON.parse(props.markerIcon) || {}),
})
</script>

<template>
  <LazyLoad>
    <div class="widgets-kvass-map--search" v-if="search">
      <MapComponent
        :coordinates="coordinatesComp"
        :zoom="parseInt(props.zoom)"
        :markers="markersComp"
        :map-options="mapOptions"
        :address="address"
        :show-address="Boolean(address)"
        :aspect-ratio="aspectRatio"
        :center="centerComp"
        :marker-icon="markerIcon"
      />
      <div>
        <div v-if="description" v-html="description"></div>
        <Selector
          v-model="selected"
          :zoom="parseInt(props.zoom)"
          :map-options="mapOptions"
          :aspect-ratio="aspectRatio"
          :autocomplete="true"
          :show-selected="true"
          :show-warning="true"
          :language="language"
        />
        <Card
          v-for="item in match"
          :thumbnail="item.content.thumbnail"
          header-min-height="200px"
          thumbnail-size="cover"
        >
          <div v-html="item.content?.description"></div>
          <template #footer>
            <Button
              :label="item.content?.actionLabel"
              icon-right="fa-pro-light:angle-right"
              is="a"
              :href="item.content?.action"
            />
          </template>
        </Card>
      </div>
    </div>
    <MapComponent
      v-else
      :coordinates="coordinatesComp"
      :zoom="parseInt(props.zoom)"
      :markers="markersComp"
      :map-options="mapOptions"
      :address="address"
      :show-address="Boolean(address)"
      :aspect-ratio="aspectRatio"
      :center="centerComp"
      :marker-icon="markerIcon"
    />
  </LazyLoad>
</template>

<style lang="scss">
@import url('@kvass/map/style.css');
@import url('@kvass/location-selector/style.css');

.widgets-kvass-map--search {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  --kvass-location-selector-background: transparent;
  .k-card__thumbnail {
    --k-image-aspectratio: 3 / 1 !important;
  }
  .kvass-location-selector__map {
    display: none;
  }
}

.kvass-map {
  @media screen and (max-width: 680px) {
    aspect-ratio: 1/1.4;
  }
}
</style>
