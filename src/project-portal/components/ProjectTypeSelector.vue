<template>
  <select class="project-type-selector__trigger">
    <option
      v-for="(item, index) in items"
      :key="index"
      :value="item"
      @change="$emit('input', item)"
      class="project-type-selector__dropdown-item"
    >
      {{ Capitalize(item === 'none' ? 'Velg type' : item) }}
    </option>
  </select>
</template>

<script setup>
function Capitalize(value) {
  return value.charAt(0).toUpperCase() + value.substring(1)
}

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  value: {
    type: String,
  },
})
</script>

<style lang="scss">
@import '../styles/_variables';
.project-type-selector {
  .elder-dropdown__content {
    z-index: 11;
  }
  &__trigger {
    // remove select arrow
    appearance: none;

    /* for IE 10 */
    &:-ms-expand {
      display: none;
    }

    padding: 1rem 2rem;
    border: none;
    border-radius: GetVariable('border-radius');
    font-size: 0.9em;
    background-color: GetVariable('primary');
    color: white;

    @media (max-width: $kvass-project-portal-breakpoint) {
      width: 100%;
    }
  }
  &__dropdown-item {
    &--selected {
      background-color: rgba(143, 143, 143, 0.4);
    }
    text-align: center !important;
    padding: 0.5rem 1.5rem;
    font-size: 0.9em;

    &:hover {
      background-color: rgba(36, 36, 36, 0.4);
    }
  }
}
</style>
