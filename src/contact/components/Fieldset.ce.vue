<script setup>
defineProps({
  label: String,
})
</script>

<template>
  <fieldset class="kvass-contact-fieldset">
    <legend class="kvass-contact-fieldset__label" v-if="label">
      {{ label }}
    </legend>
    <slot />
  </fieldset>
</template>

<style lang="scss">
.kvass-contact-fieldset {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(
    var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 4
  );
  margin: calc(
      var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 1.5
    )
    0 0 0;
  padding: calc(
    var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 2
  );
  border-radius: var(
    --kvass-contact-border-radius,
    var(--kvass-contact-default-border-radius)
  );
  border: var(
      --kvass-contact-border-width,
      var(--kvass-contact-default-border-width)
    )
    solid
    var(--kvass-contact-border-color, var(--kvass-contact-default-border-color));
  font: inherit;

  &:focus-visible {
    outline: 2px solid
      var(--kvass-contact-color, var(--kvass-contact-default-color));
    outline-offset: 2px;
  }

  &__label {
    margin: 0;
    padding: 0;
    position: absolute;
    top: -1.4rem;
    left: 0;
  }
}
</style>
