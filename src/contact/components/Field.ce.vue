<script>
export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup>
import { computed, ref } from 'vue'

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

function handleInput(event) {
  emit('update:modelValue', event.target.value)
  focused.value = true
}
</script>

<template>
  <label
    class="kvass-lead-form-field"
    :class="[
      {
        'kvass-lead-form-field--required': 'required' in $attrs,
        'kvass-lead-form-field--focused': focused,
      },
      $attrs.class,
    ]"
    :for="$attrs.id"
  >
    <span class="kvass-lead-form-field__label" v-if="label">{{ label }}</span>
    <component
      :is="component"
      class="kvass-lead-form-field__element"
      v-bind="$attrs"
      @input="handleInput"
    >
      <slot />
    </component>
  </label>
</template>

<style lang="scss">
.kvass-lead-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &__element {
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
    resize: vertical;
    font: inherit;

    &:focus-visible {
      outline: 2px solid
        var(--kvass-lead-form-color, var(--kvass-lead-form-default-color));
      outline-offset: 2px;
    }
  }

  &--required {
    .kvass-lead-form-field__label:after {
      content: '*';
      color: var(--kvass-lead-form-error, var(--kvass-lead-form-default-error));
      margin-left: 0.3rem;
    }

    &.kvass-lead-form-field--focused {
      .kvass-lead-form-field__element:invalid {
        border-color: var(
          --kvass-lead-form-error,
          var(--kvass-lead-form-default-error)
        );
      }
    }
  }

  &--full-width {
    grid-column-end: span
      var(
        --kvass-lead-form-grid-columns,
        var(--kvass-lead-form-default-grid-columns)
      );
  }
}
</style>
