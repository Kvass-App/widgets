<script setup lang="ts">
import { Card, Alert, Button, Icon } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

const emit = defineEmits<{
  (event: 'publish', payload: void): void
}>()
</script>

<template>
  <Card
    class="publish-loading"
    appearence="border"
    variant="default"
    title="Annonsen publiseres..."
    subtitle="Vi sender annonsen din til Finn, dette kan ta litt tid.."
  >
    <template #thumbnail>
      <Icon icon="fa-pro-light:list-check"></Icon>
    </template>
  </Card>
</template>

<style lang="scss">
.publish-loading {
  .k-card__thumbnail {
    display: flex;
    justify-content: center;

    background-color: #d3e6f7;
    padding-block: 7rem;
    font-size: 7rem;

    svg {
      color: #6ba3d6;
    }
  }
}
</style>
