<script>
export default {
  // disable attrs on root element
  inheritAttrs: false,
}
</script>

<script setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Boolean,
  label: String,
})
</script>

<template>
  <label
    :for="$attrs.id"
    v-if="label"
    class="kvass-lead-form-checkbox"
    :class="{ 'kvass-lead-form-checkbox--required': 'required' in $attrs }"
  >
    <input
      class="kvass-lead-form-checkbox__element"
      type="checkbox"
      v-bind="$attrs"
      :value="!modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <span class="kvass-lead-form-checkbox__label" v-html="label"></span>
  </label>
</template>
