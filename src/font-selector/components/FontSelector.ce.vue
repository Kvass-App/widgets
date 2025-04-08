<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { getProviders } from '../providers.js'
import WebFontLoader from 'webfontloader'

import {
  Alert,
  Checkbox,
  Grid,
  Input,
  FormControl,
  Icon,
  Button,
} from '@kvass/ui'
import { Translate, Debounce } from '../../utils/index.js'

const props = defineProps({
  customPriovider: {
    type: String,
    default: 'google',
  },
  customLabel: {
    type: String,
    default: 'Skreddersydd font',
  },
  customFonts: String,
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'heading'].includes(value),
  },
  value: String,
  label: String,
  templateFont: {
    type: String,
  },

  showAllOption: {
    type: Boolean,
    default: false,
  },
  apiKey: String,
  templateProvider: {
    type: String,
    default: 'google',
  },

  disablePreviewOn: {
    type: Array,
    default: () => [],
  },
})

const items = ref([])
const allData = ref([])
const showAllFonts = ref(false)
const search = ref('')
const openList = ref(false)

const providers = ref(
  getProviders([
    props.customFonts
      ? {
          value: props.customPriovider,
          fonts: props.customFonts.split(',').map((f) => f.trim()),
          label: props.customLabel,
        }
      : {},
    props.templateFont
      ? {
          value: props.templateProvider,
          fonts: [props.templateFont],

          label: Translate('fontAssociatedWithSelectedThemeTemplate'),
        }
      : {},
  ]),
)

const selectedFont = ref(
  props.value ? (JSON.parse(`${props.value}`) || {}).font : '',
)

const hasInputErrors = computed(() => {
  return !allData.value.some((i) => i.label === search.value)
})

const selectedProvider = computed(() => {
  const provider = providers.value.find((p) =>
    p.fonts?.includes(selectedFont.value),
  )?.value

  if (!provider) return 'google'

  return provider
})

function update(font) {
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: {
        font,
        provider: selectedProvider.value,
      },
      bubbles: true,
      composed: true,
    }),
  )
}
const element = useCurrentElement()
function triggerSearch(newValue) {
  if (newValue !== selectedFont.value) {
    openList.value = true
  }

  if (!allData.value.length) {
    return getData()
  }

  items.value = allData.value.filter((i) => {
    return i.label.startsWith(newValue)
  })
}
watch(selectedFont, (newFont) => {
  if (!newFont) return

  // emit custom event
  update(newFont)
})

watch(search, (newValue, oldValue) => {
  triggerSearch(newValue)
})
watch(showAllFonts, (newValue, oldValue) => {
  getData()
})

const styles = computed(
  () =>
    selectedFont.value &&
    `--kvass-font-selector-font-family: '${selectedFont.value}'`,
)

function onFocus() {
  if (!allData.value.length) {
    return getData()
  }
  openList.value = true
}

const onBlur = Debounce(function () {
  if (hasInputErrors.value) search.value = selectedFont.value
  openList.value = false
}, 300)

async function getData() {
  if (!showAllFonts.value) {
    items.value = providers.value
      .map((provider) =>
        provider.fonts.map((font) => {
          return {
            icon: props.disablePreviewOn.includes(font)
              ? 'gridicons:customize'
              : `simple-icons:${provider.value}fonts`,
            label: font,
            provider: provider.value,
            action: () => {
              selectedFont.value = font
              search.value = font
              openList.value = false
            },
          }
        }),
      )
      .flat()
  } else {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${props.apiKey}`
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const res = await response.json()
      items.value = res?.items.map((font) => {
        return {
          icon: props.disablePreviewOn.includes(font.family)
            ? 'gridicons:customize'
            : `simple-icons:googlefonts`,
          label: font.family,
          provider: 'google',
          action: () => {
            selectedFont.value = font.family
            search.value = font.family
            openList.value = false
          },
        }
      })
    } catch (error) {
      console.error(error.message)
    }
  }

  allData.value = items.value
}

onMounted(() => {
  if (!selectedProvider.value) throw new Error('Invalid font provider')

  // Initialize WebFontLoader
  const config = Object.fromEntries(
    Object.entries(providers.value).map(([_, provider]) => [
      provider.value,
      { families: provider.fonts.map((font) => `${font}:400,700`) },
    ]),
  )

  WebFontLoader.load(config)
  search.value = selectedFont.value || ''
  update(selectedFont.value)
})
</script>

<template>
  <div class="kvass-font-selector" :style="styles">
    <label>
      <span v-if="label" class="kvass-font-selector__label">{{
        Translate(label)
      }}</span>
    </label>
    <Grid :style="'padding:1rem 0'" columns="1">
      <FormControl label="Velg / søk etter font">
        <Input v-model="search" @focus="onFocus" @blur="onBlur">
          <template #suffix>
            <Icon @click="triggerSearch" icon="fa-pro-solid:angle-down"></Icon>
          </template>
        </Input>
        <div v-if="openList" class="kvass-font-selector__select-list">
          <Button
            v-for="item in items"
            :label="item.label"
            :icon-right="item.icon"
            @click="item.action"
          ></Button>
        </div>
      </FormControl>
      <Checkbox
        v-if="props.showAllOption"
        v-model="showAllFonts"
        label="Vis alle google fonts"
      />
    </Grid>
    <div
      :class="[
        `kvass-font-selector__preview kvass-font-selector__preview--${props.type}`,
      ]"
    >
      <small class="kvass-font-selector__preview-label">{{
        Translate('fontPreview')
      }}</small>
      <Alert
        v-if="
          showAllFonts ||
          props.disablePreviewOn.includes(selectedFont) ||
          selectedFont === ''
        "
        variant="neutral"
      >
        <span>{{ Translate('fontPreviewDisabled') }}</span>
      </Alert>
      <template v-else>
        <template v-if="props.type === 'heading'">
          <h1>{{ Translate('primaryTitle') }}</h1>
          <h2>{{ Translate('secondaryTitle') }}</h2>
        </template>
        <template v-if="props.type === 'text'">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            imperdiet, nulla et dictum interdum.
          </p>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-font-selector {
  --k-button-medium-font-size: 0.8rem;
  --k-button-medium-padding-inline: 0.5rem;
  --k-button-medium-padding-block: 0.5rem;
  --k-ui-rounding: 0;
  // Default variables
  --__kvass-font-selector-background-color: white;
  --__kvass-font-selector-padding-y: 1rem;
  --__kvass-font-selector-padding-x: 1rem;
  --__kvass-font-selector-border-width: 1px;
  --__kvass-font-selector-border-style: solid;
  --__kvass-font-selector-border-color: #eaeaea;
  --__kvass-font-selector-border-radius: 6px;
  --__kvass-font-selector-max-width: 100%;
  --__kvass-font-selector-label-color: currentColor;
  --__kvass-font-selector-label-weight: 400;

  border-radius: var(
    --kvass-font-selector-border-radius,
    var(--__kvass-font-selector-border-radius)
  );
  background-color: var(
    --kvass-font-selector-background-color,
    var(--__kvass-font-selector-background-color)
  );
  max-width: var(
    --kvass-font-selector-max-width,
    var(--__kvass-font-selector-max-width)
  );

  &__preview-label,
  .k-alert {
    font-weight: 400 !important;
  }

  .k-formcontrol {
    position: relative;
  }
  &__select-list {
    display: flex;
    flex-direction: column;
    background-color: white;
    position: absolute;
    min-width: 50%;
    top: 100%;
    z-index: 1;
    max-height: 400px;
    overflow: auto;
  }
  .k-input {
    border-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    &__suffix {
      background: transparent;
    }
  }

  .k-checkbox {
    font-size: 0.75em;
    --k-checkbox-size: 0.8em;
    margin-left: auto;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: var(
        --kvass-font-selector-padding-y,
        var(--__kvass-font-selector-padding-y)
      )
      var(
        --kvass-font-selector-padding-x,
        var(--__kvass-font-selector-padding-x)
      );
    border: var(
        --kvass-font-selector-border-width,
        var(--__kvass-font-selector-border-width)
      )
      var(
        --kvass-font-selector-border-style,
        var(--__kvass-font-selector-border-style)
      )
      var(
        --kvass-font-selector-border-color,
        var(--__kvass-font-selector-border-color)
      );
    border-bottom-right-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    border-bottom-left-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );

    p,
    h1,
    h2,
    h3 {
      margin: 0;
      font-family: var(--kvass-font-selector-font-family);
      text-wrap: balance;
    }

    p {
      line-height: 1.5;
    }

    h1,
    h2,
    h3 {
      line-height: 1;
    }

    &--heading {
      font-weight: 700;
    }

    &--text {
      font-weight: 400;
    }

    &-label {
      opacity: 0.5;
      letter-spacing: 0.25px;
    }
  }

  &__label {
    color: var(
      --kvass-font-selector-label-color,
      var(--__kvass-font-selector-label-color)
    );
    font-weight: var(
      --kvass-font-selector-label-weight,
      var(--__kvass-font-selector-label-weight)
    );
    display: block;
    margin-bottom: 0.5rem;
  }
}
</style>
