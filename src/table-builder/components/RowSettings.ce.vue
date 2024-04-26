<script setup lang="ts">
import { Button, Dropdown, Icon } from '@kvass/ui'

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
        variant="secondary"
        @click="() => emit('add-row-up')"
        :disabled="addDisabled"
      >
        <template #icon-right>
          <Icon icon="majesticons:add-column" class="table-builder__icon--up" />
        </template>
      </Button>
      <Button
        size="small"
        variant="secondary"
        @click="() => emit('add-row-down')"
        :disabled="addDisabled"
      >
        <template #icon-right>
          <Icon
            icon="majesticons:add-column"
            class="table-builder__icon--down"
          />
        </template>
      </Button>

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
