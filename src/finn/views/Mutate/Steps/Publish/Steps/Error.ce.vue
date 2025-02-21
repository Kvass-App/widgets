<script setup lang="ts">
import { Card, Button, Icon } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

const modelValue = defineModel<Ad>({ default: {} })
</script>

<template>
  <Card
    class="publish-error"
    appearence="border"
    variant="default"
    title="Obs! Noe gikk galt"
    subtitle="Det oppsto et problem."
  >
    <template #thumbnail>
      <Icon icon="fa-pro-light:circle-exclamation"></Icon>
    </template>
    <!-- <template #actions>
      <Button label="Send feilmelding til support" variant="primary"></Button>
    </template> -->
  </Card>
</template>

<style lang="scss">
.publish-error {
  .k-card__thumbnail {
    display: flex;
    justify-content: center;

    background-color: rgba(231, 32, 27, 0.2);
    padding-block: 7rem;
    font-size: 7rem;

    svg {
      color: #e7201b;
    }
  }
}
</style>
