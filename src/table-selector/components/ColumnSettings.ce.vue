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
  <Dropdown label="" placement="bottom" size="small">
    <template #default="{ close }">
      <Button
        size="small"
        label="Slett kolonne"
        variant="tertiary"
        icon="fa-pro-solid:xmark"
        @click="() => emit('delete-column')"
        :disabled="deleteDisabled"
      />
      <Button
        size="small"
        label="Legg til kolonne"
        iconRight="fa-pro-light:arrow-right-to-line"
        variant="tertiary"
        @click="() => emit('add-column-right')"
        :disabled="addDisabled"
      />
      <Button
        size="small"
        label="Legg til kolonne"
        variant="tertiary"
        iconRight="fa-pro-light:arrow-left-to-line"
        @click="() => emit('add-column-left')"
        :disabled="addDisabled"
      />
    </template>
  </Dropdown>
</template>

<style lang="scss"></style>
