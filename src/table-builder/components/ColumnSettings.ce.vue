<script setup lang="ts">
import { Button, Dropdown, Icon } from '@kvass/ui'

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
        @click="() => emit('add-column-left')"
        :disabled="addDisabled"
      >
        <template #icon-left>
          <Icon
            icon="majesticons:add-column"
            class="table-builder__icon--left"
          />
        </template>
      </Button>
      <Button
        size="small"
        variant="secondary"
        @click="() => emit('add-column-right')"
        :disabled="addDisabled"
      >
        <template #icon-right>
          <Icon
            icon="majesticons:add-column"
            class="table-builder__icon--right"
          />
        </template>
      </Button>

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
