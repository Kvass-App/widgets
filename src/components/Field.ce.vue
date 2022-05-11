<script>
import { computed } from '@vue/reactivity'

export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: String,
  label: String,
  type: String,
})

const component = computed(() =>
  props.type == 'textarea' ? 'textarea' : 'input',
)
</script>

<template>
  <label
    class="kvass-lead-form-field"
    :class="{ 'kvass-lead-form-field--required': 'required' in $attrs }"
    :for="$attrs.id"
  >
    <span class="kvass-lead-form-field__label" v-if="label">{{ label }}</span>
    <component
      :is="component"
      class="kvass-lead-form-field__element"
      v-bind="$attrs"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>
