<script setup lang="ts">
import { Button, Dropdown } from '@kvass/ui'

const props = defineProps<{
  addDisabled: boolean
  deleteDisabled: boolean
}>()

const emit = defineEmits<{
  (e: 'delete-row'): void
  (e: 'add-row-up'): void
  (e: 'add-row-down'): void
}>()
</script>

<template>
  <Dropdown
    label=""
    iconRight="fa-pro-light:grip-dots"
    placement="top-end"
    size="small"
    :offset="2"
  >
    <template #default="{ close }">
      <Button
        size="small"
        iconRight="fa-pro-light:arrow-up-to-line"
        variant="secondary"
        @click="() => emit('add-row-up')"
        :disabled="addDisabled"
      />
      <Button
        size="small"
        variant="secondary"
        iconRight="fa-pro-light:arrow-down-to-line"
        @click="() => emit('add-row-down')"
        :disabled="addDisabled"
      />

      <Button
        variant="secondary"
        size="small"
        icon="fa-pro-light:xmark"
        @click="() => emit('delete-row')"
        :disabled="deleteDisabled"
      />
    </template>
  </Dropdown>
</template>

<style lang="scss"></style>
