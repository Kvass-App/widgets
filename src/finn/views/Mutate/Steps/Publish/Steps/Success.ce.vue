<script setup lang="ts">
import { Card, Button, Icon } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

const modelValue = defineModel<Ad>({ default: {} })

const emit = defineEmits<{
  (event: 'navigate', payload: string): void
}>()
</script>

<template>
  <Card
    class="publish-success"
    appearence="border"
    variant="default"
    title="Gratulerer!"
    subtitle="Annonsen er nå publisert på Finn!"
  >
    <template #thumbnail>
      <Icon icon="fa-pro-light:party-horn"></Icon>
    </template>
    <template #actions>
      <Button
        label="Gå til oversikt"
        @click="() => emit('navigate', 'dashboard')"
      ></Button>

      <Button
        :disabled="!modelValue.url"
        iconRight="fa-pro-light:arrow-up-right-from-square"
        label="Gå til annonsen på Finn.no"
        variant="primary"
        target="_blank"
        is="a"
        :href="modelValue.url"
      />
    </template>
  </Card>
</template>

<style lang="scss">
.publish-success {
  .k-card__thumbnail {
    display: flex;
    justify-content: center;

    background-color: rgba(10, 187, 89, 0.2);
    padding-block: 7rem;
    font-size: 7rem;

    svg {
      color: #0d521c;
    }
  }
}
</style>
