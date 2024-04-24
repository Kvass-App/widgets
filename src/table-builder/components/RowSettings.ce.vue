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
  <Dropdown label="" placement="bottom" size="small">
    <template #default="{ close }">
      <Button
        size="small"
        label="Legg til rad"
        iconRight="fa-pro-light:arrow-up-to-line"
        variant="tertiary"
        @click="() => emit('add-row-up')"
        :disabled="addDisabled"
      />
      <Button
        size="small"
        label="Legg til rad"
        variant="tertiary"
        iconRight="fa-pro-light:arrow-down-to-line"
        @click="() => emit('add-row-down')"
        :disabled="addDisabled"
      />

      <Button
        size="small"
        label="Slett rad"
        variant="danger"
        icon="fa-pro-solid:xmark"
        @click="() => emit('delete-row')"
        :disabled="deleteDisabled"
      />
    </template>
  </Dropdown>
</template>

<style lang="scss"></style>
