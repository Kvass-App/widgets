<script setup lang="ts">
import { inject } from 'vue'
import { Flex, Button, Card } from '@kvass/ui'

import { Services as servicesItems } from '../../enums'
import Service from '../Service.ce.vue'

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
    class="kvass-visualization-order-form"
    :title="getLabel('servicesTitle')"
    :subtitle="getLabel('servicesSubTitile')"
  >
    <template #default>
      <Flex direction="column" gap="4rem">
        <template v-for="(item, index) in modelValue.services" :key="item.id">
          <Service
            v-model="modelValue.services[index]"
            :item="servicesItems.find((v) => v.id === item.id)"
          ></Service>
        </template>
      </Flex>
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev" />
      <Button @click="onNext" :label="getLabel('next')" />
    </template>
  </Card>
</template>

<style lang="scss"></style>
