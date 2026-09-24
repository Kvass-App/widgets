<script setup>
import { ref, watch } from 'vue'
import postcodes from '../../../../data/postcodes.json'

import { Input } from '@kvass/ui'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  fieldKey: {
    type: String,
    default: 'position',
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  parentKey: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const postplace = ref(null)
const emit = defineEmits(['update:modelValue'])
watch(
  () => props.data,
  (newVal) => {
    postplace.value =
      postcodes[String(newVal?.[props.parentKey])]?.poststed ?? ''

    if (postplace.value) {
      emit('update:modelValue', postplace.value)
    }
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <Input
    :placeholder="placeholder"
    :disabled="true"
    :model-value="postplace ?? ''"
  />
</template>

<style lang="scss"></style>
