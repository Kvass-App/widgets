<script>
export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: [Boolean, Array],
  state: String,
  label: String,
})

function onChange(ev) {
  if (typeof props.modelValue === 'boolean')
    return emit('update:modelValue', ev.target.checked)
  return emit(
    'update:modelValue',
    ev.target.checked
      ? [...props.modelValue, props.state]
      : props.modelValue.filter((v) => v !== props.state),
  )
}
</script>

<template>
  <label
    class="kvass-contact-checkbox"
    :class="[
      { 'kvass-contact-checkbox--required': 'required' in $attrs },
      $attrs.class,
    ]"
  >
    <input
      class="kvass-contact-checkbox__element"
      type="checkbox"
      v-bind="$attrs"
      :value="modelValue"
      :checked="$attrs.checked"
      @change="onChange"
    />
    <span class="kvass-contact-checkbox__label" v-html="label"></span>
  </label>
</template>

<style lang="scss">
.kvass-contact-checkbox {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  cursor: pointer;

  &__element {
    cursor: inherit;

    margin: 0;
    appearance: none;
    background-color: none;
    flex-shrink: 0;

    font: inherit;
    color: currentColor;
    width: var(
      --kvass-contact-checkbox-size,
      var(--kvass-contact-default-checkbox-size)
    );
    aspect-ratio: 1;
    border: var(
        --kvass-contact-border-width,
        var(--kvass-contact-default-border-width)
      )
      solid currentColor;
    border-radius: var(
      --kvass-contact-border-radius,
      var(--kvass-contact-default-border-radius)
    );

    &:focus-visible {
      outline: var(
          --kvass-contact-outline-width,
          var(--kvass-contact-default-outline-width)
        )
        solid var(--kvass-contact-color, var(--kvass-contact-default-color));
      outline-offset: var(
        --kvass-contact-outline-offset,
        var(--kvass-contact-default-outline-offset)
      );
    }

    &:checked {
      position: relative;
      background-color: var(
        --kvass-contact-primary,
        var(--kvass-contact-default-primary)
      );
      border-color: var(
        --kvass-contact-primary,
        var(--kvass-contact-default-primary)
      );

      &::before {
        content: '✓';
        font-size: 0.75em;
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;

        color: var(
          --kvass-contact-color-inverted,
          var(--kvass-contact-default-color-inverted)
        );
      }
    }
  }

  &--required {
    span:after {
      content: '*';
      color: var(--kvass-contact-error, var(--kvass-contact-default-error));
      margin-left: 0.3rem;
    }
  }
}
</style>
