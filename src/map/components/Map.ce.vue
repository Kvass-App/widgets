<script setup>
import { Map as MapComponent } from '@kvass/map'
import { LocationSelector as Selector } from '@kvass/location-selector'
import { LazyLoad, Card, Button, Alert } from '@kvass/ui'
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
  resultMessage: {
    type: String,
    default: '{"error":"Ingen resultater, prøv igjen","success":"Resultater:"}',
  },

  language: {
    type: String,
  },

  placeholder: {
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

const resultMessageComp = computed(() => {
  if (!props.resultMessage) return
  return JSON.parse(props.resultMessage)
})
const markersComp = computed(() => {
  if (!props.markers) return
  return JSON.parse(props.markers)
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
    <div class="widgets-kvass-map__search" v-if="search">
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
      <div class="widgets-kvass-map__search-content">
        <div v-if="description" v-html="description"></div>
        <Selector
          v-model="selected"
          :zoom="parseInt(props.zoom)"
          :map-options="mapOptions"
          :autocomplete="true"
          :show-selected="false"
          :show-warning="false"
          :language="language"
          :map-selector="false"
          :placeholder="placeholder"
        />

        <template v-if="selected">
          <Alert :variant="match?.length ? 'neutral' : 'danger'">
            {{
              match?.length
                ? resultMessageComp.success
                : resultMessageComp.error
            }}

            <div class="widgets-kvass-map__search-result">
              <Card
                v-for="item in match"
                :thumbnail="item.content.thumbnail"
                variant="default"
              >
                <template #default>
                  <div v-html="item.content?.description"></div>
                </template>
                <template #actions>
                  <Button
                    :label="item.content?.actionLabel"
                    icon-right="fa-pro-light:angle-right"
                    is="a"
                    :href="item.content?.action"
                  />
                </template>
              </Card>
            </div>
          </Alert>
        </template>
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

.widgets-kvass-map__search {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  --kvass-location-selector-background: transparent;
  --kvass-map-popup-gap: 0;
  --kvass-map-popup-image-width: 50px;
  --kvass-map-popup-image-aspect-ratio: 16/7;
  --kvass-map-popup-padding: 10px 10px 15px;
  --kvass-map-popup-width: 150px;
  --kvass-map-popup-image-size: contain;

  @media screen and (max-width: 680px) {
    grid-template-columns: 1fr;
  }
  .k-card {
    --k-card-spacing: 1rem;
    padding: var(--k-card-spacing);

    --k-card-header-background: #fbfbfb;

    &__content {
      padding: 0.5rem;
      color: var(--widgets-kvass-map-search-card-color, black);
      text-align: center;
    }

    &__thumbnail figure {
      height: 70px;

      --k-image-size: contain !important;
    }
    &__actions {
    }
  }

  &-content {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }
  &-result {
    margin-top: 1rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.kvass-map {
  @media screen and (max-width: 680px) {
    aspect-ratio: 1/1.4;
  }
}
</style>
