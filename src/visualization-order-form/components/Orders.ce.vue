<script setup lang="ts">
import { inject } from 'vue'
import { Flex, Button, Card, Icon } from '@kvass/ui'

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
  if (item.type === 'interior') return 'fa-pro-solid:couch'

  if (item.drone) return 'gis:drone'

  return 'fa-pro-solid:image-landscape'
}
</script>

<template>
  <Flex wrap direction="row" class="order" justify="space-evenly">
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
                {{ `${getLabel('3dImage')} - ${getLabel(item.type)}` }}
              </div>
            </template>
            <template #default>
              <Flex direction="column">
                <template v-if="item.type === 'interior'">
                  <div>
                    <div>{{ getLabel('interiorRoom') }}</div>
                    <div>{{ item.room }}</div>
                  </div>
                </template>

                <template v-if="item.type === 'exterior'">
                  <div>
                    <div>{{ getLabel('numberOfUnits') }}</div>
                    <div>{{ item.units }}</div>
                  </div>
                </template>
              </Flex>
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
  </Flex>
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
