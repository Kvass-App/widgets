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
  gap: calc(var(--kvass-contact-spacing, var(--__kvass-contact-spacing)) / 4);
  margin: calc(
      var(--kvass-contact-spacing, var(--__kvass-contact-spacing)) / 1.5
    )
    0 0 0;
  padding: calc(
    var(--kvass-contact-spacing, var(--__kvass-contact-spacing)) / 2
  );
  border-radius: var(
    --kvass-contact-border-radius,
    var(--__kvass-contact-border-radius)
  );
  border: var(--kvass-contact-border-width, var(--__kvass-contact-border-width))
    solid var(--kvass-contact-border-color, var(--__kvass-contact-border-color));
  font: inherit;

  &:focus-visible {
    outline: var(
        --kvass-contact-outline-width,
        var(--__kvass-contact-outline-width)
      )
      solid var(--kvass-contact-color, var(--__kvass-contact-color));
    outline-offset: var(
      --kvass-contact-outline-offset,
      var(--__kvass-contact-outline-offset)
    );
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
