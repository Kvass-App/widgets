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
    {{ $attrs.checked }}
  </label>
</template>

<style lang="scss">
.kvass-contact-checkbox {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;

  &__element {
    margin: 0;
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
