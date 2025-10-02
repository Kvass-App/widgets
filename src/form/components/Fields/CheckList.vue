<script setup>
import { ref, computed, watch } from 'vue'
import { Checkbox } from '@kvass/ui'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])

const multipleState = ref([])

watch(
  multipleState,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { immediate: true },
)

const itemsComp = computed(() => {
  return props.items.map((i) => {
    return {
      [i.id]: true,
      label: i.label,
    }
  })
})
</script>

<template>
  <Checkbox
    v-for="item in itemsComp"
    v-model="multipleState"
    :value="item"
    :label="item.label"
  />
</template>

<style lang="scss"></style>
