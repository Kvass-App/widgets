<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { providers } from '../providers.js'
import WebFontLoader from 'webfontloader'

const props = defineProps({
  provider: {
    type: String,
    default: 'google',
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'heading'].includes(value),
  },
  defaultFont: String,
})

const selectedProvider = computed(() =>
  providers.find((p) => p.value === props.provider),
)

const selectedFont = ref(
  selectedProvider.value?.fonts.find((f) => f.value === props.defaultFont) ||
    selectedProvider.value?.fonts[0],
)

const element = useCurrentElement()

watch(selectedFont, (newFont) => {
  if (!newFont) return

  // emit custom event
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: newFont,
      bubbles: true,
      composed: true,
    }),
  )
})

const styles = computed(
  () =>
    selectedFont.value &&
    `--kvass-font-selector-font-family: '${selectedFont.value.value}'`,
)

onMounted(() => {
  if (!selectedProvider.value) throw new Error('Invalid provider')

  // Initialize WebFontLoader
  const config = Object.fromEntries(
    Object.entries(providers).map(([_, provider]) => [
      provider.value,
      { families: provider.fonts.map((font) => `${font.value}:400,700`) },
    ]),
  )

  WebFontLoader.load(config)
})
</script>

<template>
  <div class="kvass-font-selector" :style="styles">
    <select v-model="selectedFont" class="kvass-font-selector__input">
      <optgroup
        v-for="provider in providers"
        :key="provider.value"
        :label="provider.label"
      >
        <option v-for="font in provider.fonts" :key="font.value" :value="font">
          {{ font.label }}
        </option>
      </optgroup>
    </select>
    <div
      :class="[
        `kvass-font-selector__preview kvass-font-selector__preview--${props.type}`,
      ]"
    >
      <small class="kvass-font-selector__preview-label">Forhåndsvisning</small>
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
  --__kvass-font-selector-max-width: 500px;

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
}
</style>
