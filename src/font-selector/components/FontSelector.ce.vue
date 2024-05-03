<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { getProviders } from '../providers.js'
import WebFontLoader from 'webfontloader'
import { Alert } from '@kvass/ui'

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
  templateProvider: {
    type: String,
    default: 'google',
  },
  disablePreviewOn: {
    type: Array,
    default: () => [],
  },
})

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
          label: 'Font tilknyttet valgt tema mal',
        }
      : {},
  ]),
)

const selectedFont = ref(
  (props.value ? (JSON.parse(`${props.value}`) || {}).font : '') ||
    props.defaultFont,
)

const selectedProvider = computed(() => {
  // console.log(props.value ? (JSON.parse(`${props.value}`) || {}).provider : '')
  console.log(providers.value)
  const provider = providers.value.find((p) =>
    p.fonts?.includes(selectedFont.value),
  )?.value

  //find provider based on selected font

  if (!provider) return

  // If custom fonts are specified for the current provider,
  // replace the default fonts with the custom fonts.
  // if (props.fonts) {
  //   const fonts = props.fonts.split(',').map((f) => f.trim())
  //   provider.fonts = fonts
  // }

  console.log(provider)

  return provider
})

function update(font) {
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: {
        font,
        provider: selectedProvider.value.value,
      },
      bubbles: true,
      composed: true,
    }),
  )
}
const element = useCurrentElement()

watch(selectedFont, (newFont) => {
  if (!newFont) return

  // emit custom event
  update(newFont)
})

const styles = computed(
  () =>
    selectedFont.value &&
    `--kvass-font-selector-font-family: '${selectedFont.value}'`,
)

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
  update(selectedFont.value)
})
</script>

<template>
  <div class="kvass-font-selector" :style="styles">
    <label>
      <span v-if="label" class="kvass-font-selector__label">{{ label }}</span>
      <div class="kvass-font-selector__input-wrapper">
        <select v-model="selectedFont" class="kvass-font-selector__input">
          <optgroup
            v-for="provider in providers"
            :key="provider.value"
            :label="provider.label"
          >
            <option v-for="font in provider.fonts" :key="font" :value="font">
              {{ font }}
            </option>
          </optgroup>
        </select>
      </div>
    </label>
    <div
      :class="[
        `kvass-font-selector__preview kvass-font-selector__preview--${props.type}`,
      ]"
    >
      <Alert
        v-if="props.disablePreviewOn.includes(selectedFont)"
        variant="neutral"
      >
        Forhåndsvisning ikke tilgjengelig for valgt font
      </Alert>

      <template v-else>
        <small class="kvass-font-selector__preview-label"
          >Forhåndsvisning</small
        >
        <template v-if="props.type === 'heading'">
          <h1>Hovedtittel</h1>
          <h2>Sekundærtittel</h2>
          <h3>Tertiærtittel</h3>
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

  &__input {
    appearance: none;
    font: inherit;
    width: 100%;
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
    border-top-left-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    border-top-right-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    border-bottom: none;

    &-wrapper {
      position: relative;

      &::after {
        content: url('../selector.svg');
        position: absolute;
        right: var(
          --kvass-font-selector-padding-x,
          var(--__kvass-font-selector-padding-x)
        );
        top: var(
          --kvass-font-selector-padding-y,
          var(--__kvass-font-selector-padding-y)
        );
        pointer-events: none;
        opacity: 0.5;
      }
    }
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
