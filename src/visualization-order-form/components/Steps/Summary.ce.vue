<script setup lang="ts">
import { inject } from 'vue'
import { Button, Card } from '@kvass/ui'

import Pricing from '../Pricing.ce.vue'

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
    is="form"
    :title="getLabel('summaryTitle')"
    :subtitle="getLabel('summarySubtitle')"
  >
    <template #default>
      <Pricing :order="modelValue"></Pricing>
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev" />
      <Button
        variant="primary"
        @click="onNext"
        :label="getLabel('sendOrder')"
      />
    </template>
  </Card>
</template>

<style lang="scss"></style>
