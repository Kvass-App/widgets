<script setup>
defineProps({
  label: String,
})
</script>

<template>
  <fieldset class="kvass-lead-form-fieldset">
    <legend class="kvass-lead-form-fieldset__label" v-if="label">
      {{ label }}
    </legend>
    <slot />
  </fieldset>
</template>

<style lang="scss">
.kvass-lead-form-fieldset {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(
    var(--kvass-lead-form-spacing, var(--kvass-lead-form-default-spacing)) / 4
  );
  margin: calc(
      var(--kvass-lead-form-spacing, var(--kvass-lead-form-default-spacing)) /
        1.5
    )
    0 0 0;
  padding: calc(
    var(--kvass-lead-form-spacing, var(--kvass-lead-form-default-spacing)) / 2
  );
  border-radius: var(
    --kvass-lead-form-border-radius,
    var(--kvass-lead-form-default-border-radius)
  );
  border: 1px solid
    var(
      --kvass-lead-form-border-color,
      var(--kvass-lead-form-default-border-color)
    );
  font: inherit;

  &:focus-visible {
    outline: 2px solid
      var(--kvass-lead-form-color, var(--kvass-lead-form-default-color));
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
