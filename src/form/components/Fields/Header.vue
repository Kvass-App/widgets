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
  center: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    :class="[
      'kvass-form-header',
      { 'kvass-form-header--center': Boolean(props.center) },
    ]"
  >
    <component
      v-if="props.title"
      class="kvass-form-header__title"
      :is="titleTag"
    >
      {{ props.title }}</component
    >
    <div
      v-if="props.description"
      class="kvass-form-header__description"
      v-html="props.description"
    ></div>
  </div>
</template>

<style lang="scss">
.kvass-form-header {
  &--center {
    text-align: center;
  }
  &__title {
    font-size: var(--kvass-form-title-font-size, revert);
    font-weight: var(--kvass-form-title-font-weight, revert);
    font-family: var(--kvass-form-title-font-family, var(--secondary-font));
    letter-spacing: var(--kvass-form-title-letter-spacing, inherit);
    margin: var(--kvass-form-title-margin, 0 0 0.75rem 0);
  }
  &__description {
    p:first-child {
      margin-top: 0.25em;
    }
  }
}
</style>
