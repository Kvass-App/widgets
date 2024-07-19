<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { getProviders } from '../providers.js'
import WebFontLoader from 'webfontloader'
import { Alert, Dropdown } from '@kvass/ui'

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
  props.value ? (JSON.parse(`${props.value}`) || {}).font : '',
)

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

const items = computed(() => {
  return providers.value
    .map((provider) =>
      provider.fonts.map((font) => {
        return {
          icon: props.disablePreviewOn.includes(font)
            ? 'gridicons:customize'
            : `simple-icons:${provider.value}fonts`,
          label: font,
          provider: provider.value,
          action: () => (selectedFont.value = font),
        }
      }),
    )
    .flat()
})
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

      <Dropdown
        class="kvass-font-selector__dropdown"
        :label="selectedFont"
        :items="items"
      >
      </Dropdown>
    </label>
    <div
      :class="[
        `kvass-font-selector__preview kvass-font-selector__preview--${props.type}`,
      ]"
    >
      <small class="kvass-font-selector__preview-label">Forhåndsvisning</small>
      <Alert
        v-if="
          props.disablePreviewOn.includes(selectedFont) || selectedFont === ''
        "
        variant="neutral"
      >
        <span> Forhåndsvisning ikke tilgjengelig </span>
      </Alert>
      <template v-else>
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
  &__dropdown {
    width: 100%;

    border-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    border-end-end-radius: 0;
    border-end-start-radius: 0;

    font-size: 1em;
    padding: 1rem;
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
    border-bottom: 0;
  }
  .k-dropdown {
    border-radius: 0;
    padding: 0;
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
