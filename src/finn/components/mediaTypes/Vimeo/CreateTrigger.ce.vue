<script setup lang="ts">
import { Button, Icon } from '@kvass/ui'

const props = defineProps<{
  label: string
}>()
</script>

<template>
  <Button type="button" :label="label" variant="tertiary" size="small">
    <template #icon-right>
      <Icon icon="fa6-brands:youtube" style="color: #00adef"></Icon>
    </template>
  </Button>
</template>

<style lang="scss"></style>
