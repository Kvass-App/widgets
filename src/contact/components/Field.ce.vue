<script lang="ts">
export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

// PROPS
const props = defineProps<{
  modelValue: string | string[] | null
  label: String
  type: String
}>()

// EMITS
const emit = defineEmits(['update:modelValue'])

// FOCUS
const focused = ref(false)

function onInput(event: InputEvent) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  focused.value = true
}

// BLUR
const blurred = ref(false)

function onBlur() {
  if (!focused.value) return
  blurred.value = true
}

// FIELD TYPE
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

  &__element {
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
      var(
        --kvass-contact-border-color,
        var(--kvass-contact-default-border-color)
      );
    resize: vertical;
    font: inherit;
    background-color: var(
      --kvass-contact-input-background,
      var(--kvass-contact-default-input-background)
    );

    &:focus-visible {
      outline: 2px solid
        var(--kvass-contact-color, var(--kvass-contact-default-color));
      outline-offset: 2px;
    }
  }

  &--required {
    .kvass-contact-field__label:after {
      content: '*';
      color: var(--kvass-contact-error, var(--kvass-contact-default-error));
      margin-left: 0.3rem;
    }

    &.kvass-contact-field--focused {
      .kvass-contact-field__element:invalid {
        border-color: var(
          --kvass-contact-error,
          var(--kvass-contact-default-error)
        );
      }
    }
  }

  &--full-width {
    grid-column-end: span
      var(
        --kvass-contact-grid-columns,
        var(--kvass-contact-default-grid-columns)
      );
  }
}
</style>
