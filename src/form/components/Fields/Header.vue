<script setup>
const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  titleTag: {
    type: String,
    enums: ['h2', 'h3', 'h4', 'h5'],
    default: 'h4',
  },
})
</script>

<template>
  <component v-if="props.title" class="kvass-form-header__title" :is="titleTag">
    {{ props.title }}</component
  >
  <div
    v-if="props.description"
    class="kvass-form-header__description"
    v-html="props.description"
  ></div>
</template>

<style lang="scss">
.kvass-form-header {
  &__title {
    margin: 0;
  }
  &__description {
    p:first-child {
      margin-top: 0.25em;
    }
  }
}
</style>
