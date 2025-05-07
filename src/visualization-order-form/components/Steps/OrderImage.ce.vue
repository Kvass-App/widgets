<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { Button, Card } from '@kvass/ui'
import { vTooltip } from 'floating-vue'

import OrderImage from '../OrderImage.ce.vue'
import Orders from '../Orders.ce.vue'

import Validator from '../../composeable/Validator'
import { GetLabelInjectionKey, RootNodeInjectionKey } from '../../keys'

import { type Order } from '../../types'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Order>({ default: {} })

const rules = computed(() => {
  return {
    images: 'min:1',
  }
})

const labels = computed(() => {
  return {
    images: getLabel('3dImages'),
  }
})

const customMessages = computed(() => {
  return {
    min: getLabel('selectImages'),
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
  customMessages: customMessages,
})

const { bind: validate } = validator

const orderImageKey = ref(0)
</script>

<template>
  <Card
    is="form"
    :title="getLabel('orderImageTitle')"
    :subtitle="getLabel('orderImageSubtitle')"
    class="order-image"
  >
    <template #default>
      <Orders v-model="modelValue.images"></Orders>

      <OrderImage
        class="k-mt-xxl order-image__new-order"
        :key="orderImageKey"
        @reset="orderImageKey++"
        @update:modelValue="(orderImage) => modelValue.images.push(orderImage)"
      >
        <template #trigger="{ triggerProps }">
          <Button
            variant="primary"
            v-bind="triggerProps"
            :label="getLabel('newOrder')"
            iconRight="fa-pro-light:plus"
          ></Button>
        </template>
      </OrderImage>
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev"></Button>
      <Button
        v-tooltip="{
          content: Object.entries(validator.errors.value.errors)
            .map(([key, value]) => value)
            .flat()
            .join('\n'),
          disabled: validator.passes.value,
          container: false,
        }"
        @click="onNext"
        :disabled="!validator.passes.value"
        :label="getLabel('next')"
      ></Button>
    </template>
  </Card>
</template>

<style lang="scss">
.order-image {
  &__new-order {
    text-align: center;
  }
}
</style>
