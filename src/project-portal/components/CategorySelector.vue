<template>
  <div class="project-portal-category">
    <CategoryTrigger
      v-for="(item, index) in items"
      :key="index"
      class="project-portal-category__selector"
      :value="item"
      :active="value == item"
      component="button"
      @click.native="$emit('input', item)"
    />
  </div>
</template>

<script setup>
import CategoryTrigger from './Category.vue'

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
.project-portal-category {
  @import '../styles/_variables';

  &__selector {
    @media (max-width: $kvass-project-portal-breakpoint) {
      width: 100%;
    }
    &:hover {
      box-shadow: inset 0 0 0 2em rgba(74, 74, 74, 0.2);
    }
    cursor: pointer;
  }
}
</style>
