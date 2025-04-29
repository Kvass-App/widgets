<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { Button, Card, FormControl, Input, Flex } from '@kvass/ui'
import { vTooltip } from 'floating-vue'

import Pricing from '../Pricing.ce.vue'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../../keys'

import { type Order } from '../../types'

import Validator from '../../composeable/Validator'

import Lead from '../Lead.ce.vue'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const lead = ref()

const passes = computed(() => {
  if (!lead.value) return false
  return lead.value.validator.passes.value
})

const validatorErrors = computed(() => {
  if (!lead.value) return ''

  return Object.entries(lead.value.validator.errors.value.errors)
    .map(([key, value]) => value)
    .flat()
    .join('\n')
})

const modelValue = defineModel<Order>({ default: {} })
</script>

<template>
  <Card
    is="form"
    :title="getLabel('summaryTitle')"
    :subtitle="getLabel('summarySubtitle')"
  >
    <template #default>
      <Pricing :order="modelValue" />

      <Lead ref="lead" v-model="modelValue.lead" />
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev" />

      <Button
        variant="primary"
        v-tooltip="{
          content: validatorErrors,
          disabled: passes,
          container: false,
        }"
        @click="onNext"
        :disabled="!passes"
        :label="getLabel('sendOrder')"
      ></Button>
    </template>
  </Card>
</template>

<style lang="scss"></style>
