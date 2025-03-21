<script setup lang="ts">
import { Card, Alert, Button, Icon } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

import { LottieAnimation } from 'lottie-web-vue'
import WebsiteAnimation from '../../../../../animations/website.json'

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
      <LottieAnimation :animation-data="WebsiteAnimation" auto-play loop />
    </template>
  </Card>
</template>

<style lang="scss">
.publish-loading {
  margin: 0 auto;
  min-width: 600px;

  --k-card-border-color: #c9c9c9;

  .k-card__thumbnail {
    background-color: var(--k-ui-color-neutral-light);
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;

    & > div {
      width: 350px;
    }
  }
}
</style>
