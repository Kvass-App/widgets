<script setup lang="ts">
import { ref, computed, watch, provide, inject, type ComputedRef } from 'vue'
import {
  FormControl,
  Input,
  Switch,
  Alert,
  Flex,
  Button,
  Card,
  File,
  RadioGroup,
} from '@kvass/ui'
import { vTooltip } from 'floating-vue'
import Tooltip from '../Tooltip.ce.vue'

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
</script>

<template>
  <Card
    is="form"
    :title="getLabel('idleTitle')"
    :subtitle="getLabel('idleSubtitle')"
    thumbnail="https://cms.kvass.no/media/Nyborgveien_Eksteri%C3%83%C2%B8r_final_small.png"
  >
    <template #actions>
      <Button @click="onNext" :label="getLabel('startOrder')" />
    </template>
  </Card>
</template>

<style lang="scss"></style>
