<script>
export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup>
import { computed, ref } from 'vue';

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: [String, Array],
  label: String,
  type: String,
})

const component = computed(() => {
  switch (props.type) {
    case 'textarea':
      return 'textarea'
    case 'select':
      return 'select'
    default:
      return 'input'
  }
})

const focused = ref(false)
const blurred = ref(false)

function onInput(event) {
  emit('update:modelValue', event.target.value)
  focused.value = true
}

function onBlur() {
  if (!focused.value) return
  blurred.value = true
}
</script>

<template>
  <label
    class="kvass-contact-field"
    :class="[
      {
        'kvass-contact-field--required': 'required' in $attrs,
        'kvass-contact-field--focused': blurred,
      },
      $attrs.class,
    ]"
    :for="$attrs.id"
  >
    <span class="kvass-contact-field__label" v-if="label">{{ label }}</span>
    <component
      :is="component"
      class="kvass-contact-field__element"
      v-bind="$attrs"
      :value="modelValue"
      @input="onInput"
      @blur="onBlur"
    >
      <slot />
    </component>
  </label>
</template>

<style lang="scss">
.kvass-contact-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &__label {
    margin-left: var(--kvass-contact-label-transform, 0);
    font-weight: var(--kvass-contact-label-weight, initial);
  }

  input {
    -webkit-appearance: none;
  }
  
  &__element {
    padding: calc(
      var(--kvass-contact-spacing, var(--__kvass-contact-spacing)) / 2
    );

    padding-left: var(
      --kvass-contact-field-input-tranform,
      calc(
        var(--kvass-contact-spacing, var(--__kvass-contact-spacing)) / 2
      )
    );

    border-radius: var(
      --kvass-contact-border-radius,
      var(--__kvass-contact-border-radius)
    );
    border: var(
        --kvass-contact-border-width,
        var(--__kvass-contact-border-width)
      )
      solid
      var(
        --kvass-contact-border-color,
        var(--__kvass-contact-border-color)
      );
    resize: vertical;
    font: inherit;
    color: inherit;
    background-color: var(
      --kvass-contact-input-background,
      var(--__kvass-contact-input-background)
    );

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
  }

  &--required {
    .kvass-contact-field__label::after {
      content: '*';
      color: var(--kvass-contact-error, var(--__kvass-contact-error));
      margin-left: 0.3rem;
    }

    &.kvass-contact-field--focused {
      .kvass-contact-field__element:invalid {
        border-color: var(
          --kvass-contact-error,
          var(--__kvass-contact-error)
        );
      }
    }
  }

  &--full-width {
    grid-column-end: span
      var(
        --kvass-contact-grid-columns,
        var(--__kvass-contact-grid-columns)
      );
  }
}
</style>
