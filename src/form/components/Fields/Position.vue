<script setup>
import { computed } from 'vue'
import { Translate } from '../../../utils'
import LocationSelector from '../../../location-selector/components/Selector.ce.vue'
import { Alert } from '@kvass/ui'
const t = (i, options) => Translate(i, 1, options)

const props = defineProps({
  mapboxApiToken: {
    type: String,
    required: true,
  },
  mapboxThemePrefix: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    required: true,
  },

  modelValue: {
    type: String,
    default: '',
  },
  fieldKey: {
    type: String,
    default: 'position',
  },
})

const emit = defineEmits(['update:modelValue'])

const themeMap = {
  dark: 'cmkcjdwf000uk01r3fz9oa78y',
  standard: 'cmkcjf2b300si01s97o78gwpi',
  light: 'cmkcj9k1a000q01r2d9ffb4el',
}

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
    [props.fieldKey]: coordinates[0]
      ? `https://maps.google.com/maps?q=${coordinates[1]},${coordinates[0]}`
      : '',
  })
}

const mapboxTheme = computed(() => {
  const prefix = props.mapboxThemePrefix?.split('/').slice(0, -1).join('/')
  const theme = themeMap?.[props.theme]
  return prefix && theme ? `${prefix}/${theme}` : props.mapboxThemePrefix
})
</script>

<template>
  <div class="kvass-form-position">
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
          ? `${t('selectedPosition')}: ${modelValue?.address}`
          : `${t('positionError')}`
      }}
    </Alert>
    <Alert
      v-if="!modelValue?.address && !hasPositionsErrors"
      icon="fa-pro-solid:circle-info"
    >
      {{ t('autocompleteAddressAlert') }}
    </Alert>
  </div>
</template>

<style lang="scss">
.kvass-form-position {
  --kvass-location-selector-primary-color: var(
    --kvass-form-pin-color,
    var(--kvass-map-primary-color, inherit)
  );
  circle {
    fill: var(
      --kvass-form-pin-contrast-color,
      var(--kvass-map-primary-contrast-color, white)
    );
  }
}
</style>
