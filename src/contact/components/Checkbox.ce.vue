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

function onInput(ev) {
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
    class="kvass-lead-form-checkbox"
    :class="[
      { 'kvass-lead-form-checkbox--required': 'required' in $attrs },
      $attrs.class,
    ]"
  >
    <input
      class="kvass-lead-form-checkbox__element"
      type="checkbox"
      v-bind="$attrs"
      :value="modelValue"
      @input="onInput"
    />
    <span class="kvass-lead-form-checkbox__label" v-html="label"></span>
  </label>
</template>

<style lang="scss">
.kvass-lead-form-checkbox {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;

  &__element {
    margin: 0;
  }

  &--required {
    span:after {
      content: '*';
      color: var(--kvass-lead-form-error, var(--kvass-lead-form-default-error));
      margin-left: 0.3rem;
    }
  }
}
</style>
