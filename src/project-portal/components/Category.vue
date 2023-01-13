<template>
  <component
    class="category"
    :class="[`category--${status}`, { 'category--active': active }]"
    :is="component"
  >
    <span>{{ label }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const themeMap = {
  sale: 'sale',
  upcoming: 'upcoming',
  development: 'development',
  sold: 'sold',
}

const categoryMap = {
  sale: 'Til salgs',
  upcoming: 'Kommer for salg',
  development: 'Under utvikling',
  all: 'Alle',
  sold: 'Utsolgt',
}

const props = defineProps({
  value: {
    type: String,
    default: 'development',
  },
  component: {
    type: String,
    default: 'div',
  },
  active: {
    type: Boolean,
  },
})

const status = computed(() => {
  if (themeMap[props.value]) return themeMap[props.value]
  return 'default'
})

const label = computed(() => categoryMap[props.value])
</script>

<style lang="scss">
@import '../styles/_variables';

.category {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: GetVariable('border-radius');
  font-size: 0.9em;
  background-color: GetVariable('light-grey');

  &:focus-visible {
    outline: 2px solid GetVariable('primary');
    outline-offset: 2px;
  }

  &--primary.category--active {
    background-color: GetVariable('primary');
  }
  &--sale.category--active {
    background-color: GetVariable('sale');
  }
  &--sold.category--active {
    background-color: GetVariable('sold');
  }
  &--development.category--active {
    background-color: GetVariable('development');
  }
  &--upcoming.category--active {
    background-color: GetVariable('upcoming');
  }
  &--default.category--active {
    background-color: GetVariable('default');
    color: black;
  }

  &--active {
    color: white;
  }
}
</style>
