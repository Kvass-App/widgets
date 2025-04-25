<script setup lang="ts">
import { computed, inject } from 'vue'
import { FormControl, Button, Card, File } from '@kvass/ui'
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

const rules = computed(() => {
  return {
    files: ['min:1'],
  }
})

const labels = computed(() => {
  return {
    files: getLabel('files'),
  }
})

const customMessages = computed(() => {
  return {
    // min: getLabel('selectImages'),
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
  customMessages: customMessages,
})

const { bind: validate } = validator

const upload = (
  file: any,
  onProgress: (val: number) => void,
  options: unknown,
) => {
  return Promise.resolve(file)
}
</script>

<template>
  <Card
    is="form"
    :title="getLabel('uploadFilesTitle')"
    :subtitle="getLabel('uploadFilesSubtitle')"
  >
    <template #default>
      <FormControl v-bind="validate('files')">
        <template #label>
          <span>{{ getLabel('uploadFiles') }}</span>
          <Tooltip class="k-ml-xxs" :content="getLabel('uploadFilesTooltip')" />
        </template>
        <File
          v-model="modelValue.files"
          :multiple="true"
          :sortable="false"
          :upload="upload"
          :uploadOptions="{}"
          :dropMessage="getLabel('dropMessage')"
          :rename="false"
          :labels="{
            delete: getLabel('delete'),
            download: 'Download',
            copy: 'Copy link',
          }"
        ></File>
      </FormControl>
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev" />
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
      />
    </template>
  </Card>
</template>

<style lang="scss"></style>
