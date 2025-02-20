<script setup lang="ts">
import { Input, FormControl, type MediaLabels as Labels } from '@kvass/ui'

import Preview from './Preview.ce.vue'
import HelpTrigger from '../HelpTrigger.ce.vue'

import { ref, computed, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  upload: string
  labels: Labels
  isValid: boolean
  name: string
}>()

const value = ref<string>('')

const emit = defineEmits<{
  (event: 'update:isValid', payload: boolean): void
}>()

const previewData = computed(() => {
  return {
    name: value.value,
    size: 0,
    url: value.value,
    type: 'youtube',
    description: '',
  }
})

const error = computed(() => {
  if (!value.value || props.isValid) return

  return getLabel(props.name.toLowerCase(), 'error')
})

function prepareData() {
  return Promise.resolve({
    name: value.value,
    size: 0,
    url: value.value,
    type: 'youtube',
  })
}

watch(
  value,
  (newVal, oldVal) => {
    const valid = new RegExp(
      /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed|)(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
    ).test(newVal)

    emit('update:isValid', valid)
  },
  {
    immediate: true,
  },
)

function getLabel(
  name: string,
  type: 'preview' | 'inputLabel' | 'createLabel' | 'error',
) {
  const x = props.labels[name as keyof Labels]
  if (!x) return ''
  if (typeof x === 'string') return ''
  return x[type] || ''
}

defineExpose({
  prepareData,
})
</script>

<template>
  <Preview
    :value="previewData"
    :label="getLabel(name.toLowerCase(), 'preview')"
    :invalid="!isValid"
  />
  <HelpTrigger label="Hvordan legge til video?" />

  <FormControl :error="error">
    <template #label>
      <span style="font-weight: bold">
        {{ getLabel(name.toLowerCase(), 'inputLabel') }}
      </span>
    </template>
    <Input required v-model="value" :invalid="!isValid" />
  </FormControl>
</template>

<style lang="scss"></style>
