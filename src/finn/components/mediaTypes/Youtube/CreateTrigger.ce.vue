<script setup lang="ts">
import { Button, Icon } from '@kvass/ui'

const props = defineProps<{
  label: string
}>()
</script>

<template>
  <Button type="button" :label="label" variant="tertiary" size="small" style="">
    <template #icon-right>
      <Icon icon="fa6-brands:youtube" style="color: #fe0002"></Icon>
    </template>
  </Button>
</template>

<style lang="scss"></style>
