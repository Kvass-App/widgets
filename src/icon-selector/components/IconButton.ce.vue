<script setup>
import { Icon } from '@kvass/ui'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  selected: Boolean,
})
</script>

<template>
  <button
    class="kvass-icon-selector-icon-button"
    :data-selected="selected ? '' : null"
  >
    <Icon :icon="icon" />
  </button>
</template>

<style lang="scss">
.kvass-icon-selector-icon-button {
  appearance: none;
  font: inherit;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  background: none;
  display: grid;
  place-items: center;
  aspect-ratio: 1;

  &[data-selected] {
    background: black;
    color: white;
  }

  &:is(:hover, :focus-visible):not([data-selected]) {
    background: #eaeaea;
  }
}
</style>
