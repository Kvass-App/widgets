<script setup lang="ts">
import { Button, Dropdown } from '@kvass/ui'

const props = defineProps<{
  addDisabled: boolean
  deleteDisabled: boolean
}>()

const emit = defineEmits<{
  (e: 'delete-column'): void
  (e: 'add-column-right'): void
  (e: 'add-column-left'): void
}>()
</script>

<template>
  <Dropdown
    class="table-builder__column-settings"
    label=""
    placement="top-center"
    size="small"
    iconRight="fa-pro-light:grip-dots"
    :offset="2"
  >
    <template #default="{ close }">
      <Button
        size="small"
        variant="secondary"
        iconRight="fa-pro-light:arrow-left-to-line"
        @click="() => emit('add-column-left')"
        :disabled="addDisabled"
      />
      <Button
        size="small"
        icon="fa-pro-light:arrow-right-to-line"
        variant="secondary"
        @click="() => emit('add-column-right')"
        :disabled="addDisabled"
      />

      <Button
        size="small"
        variant="secondary"
        icon="fa-pro-light:xmark"
        @click="() => emit('delete-column')"
        :disabled="deleteDisabled"
      />
    </template>
  </Dropdown>
</template>

<style lang="scss"></style>
