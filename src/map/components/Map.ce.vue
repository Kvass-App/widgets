<script setup>
import { Map as MapComponent } from '@kvass/map'
import { LocationSelector as Selector } from '@kvass/location-selector'
import { LazyLoad, Card, Button, Alert, Icon } from '@kvass/ui'
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

  cardTheme: {
    type: String,
    enums: ['arrow', 'default'],
    default: 'default',
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

// Markers within this many meters of the selected position count as a match.
const matchRangeMeters = 50000

// Haversine distance in meters between two [lng, lat] pairs.
const distance = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
function navigate(url) {
  window.location.href = url
}

watch(
  () => selected.value,
  (val) => {
    const origin = val?.location?.coordinates
    if (!origin) {
      match.value = []
      return
    }
    match.value = (markersComp.value ?? [])
      .map((i) => ({ ...i, distance: distance(origin, i.coordinates) }))
      .filter((i) => i.distance <= matchRangeMeters)
      .sort((a, b) => a.distance - b.distance)
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
        :card-theme="cardTheme"
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
            <div
              v-html="
                match?.length
                  ? resultMessageComp.success
                  : resultMessageComp.error
              "
            ></div>

            <div
              :class="[
                'widgets-kvass-map__search-result',
                `widgets-kvass-map__search-result-theme--${cardTheme}`,
              ]"
            >
              <Card
                v-for="item in match"
                :thumbnail="cardTheme !== 'arrow' ? item.content.thumbnail : ''"
                variant="default"
                @click="navigate(item.content?.action)"
              >
                <template #default>
                  <div
                    v-html="
                      cardTheme === 'arrow'
                        ? item.content?.actionLabel
                        : item.content?.description
                    "
                  ></div>
                  <Icon
                    v-if="cardTheme === 'arrow'"
                    icon="fa-pro-regular:arrow-right"
                  />
                </template>
                <template v-if="cardTheme !== 'arrow'" #actions>
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
  min-height: 60vh;
  $gap: 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $gap;

  --kvass-widgets-map-aspect-ratio: auto;
  --kvass-map-border-radius: 3px;

  @media screen and (max-width: 680px) {
    grid-template-columns: 1fr;
  }
  .k-card {
    cursor: pointer;
    background-color: inherit;

    --k-card-spacing: 1rem;
    padding: var(--k-card-spacing);
    --k-card-header-background: #fbfbfb;
    :hover {
      opacity: 0.8;
    }

    &__content {
      padding: 0.5rem;
      color: inherit;
      text-align: center;
      h2,
      h3 {
        margin: 0;
      }
    }

    &__thumbnail figure {
      height: 70px;
      --k-image-size: contain !important;
    }
  }

  &-content {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    background-color: var(--widgets-kvass-map-search-background-color, white);
    color: var(--widgets-kvass-map-search-color, black);
    padding: $gap;
    border-radius: var(--kvass-map-border-radius);
  }
  .k-alert--neutral {
    background-color: inherit;
    color: inherit;
    border: none;
    padding: 0;
  }
  &-result {
    margin-top: 1rem;

    &-theme {
      &--default {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        .k-card {
          border: 1px solid currentColor;
        }
      }
      &--arrow {
        display: flex;
        flex-direction: column;
        gap: 0rem;
        .k-card {
          padding: 1rem 0 0 0;
          border-radius: 0;
          border-bottom: 1px solid currentColor;

          &__content {
            display: flex;
            gap: 1rem;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }
  }
}

.kvass-map {
  aspect-ratio: var(
    --kvass-widgets-map-aspect-ratio,
    var(--kvass-map-aspect-ratio)
  );
  @media screen and (max-width: 680px) {
    aspect-ratio: var(--kvass-widgets-map-aspect-ratio-small-device, 1/1.4);
  }
  .mapboxgl-ctrl-top-right {
    right: var(--kvass-widgets-map-border-radius-top-right-gap, 0rem);
    top: var(--kvass-widgets-map-border-radius-top-right-gap, 0rem);
  }
}
</style>
