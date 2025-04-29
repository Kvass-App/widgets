<script setup lang="ts">
import { inject } from 'vue'
import { Grid, Button, Card, Icon } from '@kvass/ui'

import OrderImage from './OrderImage.ce.vue'

import type { Order, ImageOrder } from '../types'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../keys'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)

const modelValue = defineModel<Order['images']>({ required: true, default: [] })

const remove = (index: number) => {
  const newInternalValue = [...modelValue.value]
  newInternalValue.splice(index, 1)
  modelValue.value = newInternalValue
}

const getOrderIcon = (item: ImageOrder) => {
  if (item.type === 'interior') {
    if (item.room === 'livingRoom') return 'fa-pro-solid:couch'
    if (item.room === 'bathroom') return 'fa-pro-solid:bath'
    if (item.room === 'bedroom') return 'fa-pro-solid:bed'
    if (item.room === 'kitchen') return 'fa-pro-solid:refrigerator'
    if (item.room === 'other') return 'fa-pro-solid:image'
  }

  if (item.type === 'exterior') {
    if (item.visualizationTechnique === 'eyelevel')
      return 'fa-pro-solid:building'
    if (item.visualizationTechnique === 'photomontage') return 'gis:drone'
  }

  return 'fa-pro-solid:image-landscape'
}

const getOrderLabel = (item: ImageOrder) => {
  if (item.type === 'interior')
    return `${getLabel(item.type)} - ${getLabel(item.room)}`

  return `${getLabel(item.type)} - ${getLabel(item.visualizationTechnique)}`
}
</script>

<template>
  <Grid class="order" columns="1fr 1fr" gap="1rem 2rem">
    <template v-for="(item, index) in modelValue" :key="item.index">
      <OrderImage
        v-model="modelValue[index]"
        @remove="
          (v: ImageOrder) => {
            remove(index)
          }
        "
      >
        <template #trigger="{ triggerProps }">
          <Card variant="default" appearance="shadow" class="order__card">
            <template #header>
              <Icon class="order__card-icon" :icon="getOrderIcon(item)" />
              <div class="k-card__title">
                {{ getOrderLabel(item) }}
              </div>
            </template>

            <template #actions>
              <Button
                v-bind="triggerProps"
                :label="`Rediger`"
                iconRight="fa-pro-light:pen-to-square"
              ></Button>
            </template>
          </Card>
        </template>
      </OrderImage>
    </template>
  </Grid>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.order {
  &__card {
    & > .k-card__header {
      align-items: center;
      gap: 0.5rem;
    }
  }
  &__card-icon {
    font-size: 3rem;
    // color: var(--k-ui-color-primary);
  }
}
</style>
