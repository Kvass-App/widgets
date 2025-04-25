<script setup lang="ts">
import { inject } from 'vue'
import { Card, Icon } from '@kvass/ui'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../../keys'

import { type Order } from '../../types'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Order>({ default: {} })
</script>

<template>
  <Card
    class="confirmation"
    is="form"
    :title="getLabel('orderSendt')"
    :subtitle="getLabel('thankYouForYourOrder')"
  >
    <template #header>
      <Icon icon="fa-pro-solid:circle-check" class="confirmation__icon" />
      <div class="k-card__title">{{ getLabel('orderSendt') }}</div>
      <div class="k-card__subtitle">{{ getLabel('thankYouForYourOrder') }}</div>
    </template>
  </Card>
</template>

<style lang="scss">
.confirmation {
  &__icon {
    font-size: 3rem;
    color: var(--k-ui-color-success);
    margin-bottom: 1rem;
  }

  .k-card__header {
    align-items: center;
  }
}
</style>
