<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import { FormControl, Button, Card, File, Flex, Alert } from '@kvass/ui'
import { vTooltip } from 'floating-vue'
import Tooltip from '../Tooltip.ce.vue'

import { FileExtentions } from '../../enums'
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

const showUploadDroneImage = computed(() => {
  return modelValue.value.images.some(
    (v) => v.type === 'exterior' && v.photomontage,
  )
})

const rules = computed(() => {
  const base = {
    'files.shared': ['min:1', 'required'],
    'files.model': ['min:1', 'required'],
  }

  if (showUploadDroneImage.value) {
    base['files.drone'] = ['min:1', 'required']
  }

  return base
})

const labels = computed(() => {
  return {
    'files.shared': getLabel('referenceImages'),
    'files.model': getLabel('architectDrawingOrModel'),
    'files.drone': getLabel('droneImageForPhotomontage'),
  }
})

const customMessages = computed(() => {
  return {
    min: '',
    required: ':attribute',
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
  customMessages: customMessages,
})

const { bind: validate } = validator

watch(
  () => modelValue.value.files.model,
  (newVal) => {
    modelValue.value.files.hasModel =
      !newVal.some((v) => ['application/pdf'].includes(v.type)) &&
      Boolean(newVal.length)
  },
  {
    immediate: true,
  },
)

const preTransform = (e: DragEvent) => {
  const items = e.dataTransfer?.items || []
  const result: any[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const entry = item.webkitGetAsEntry?.()

    if (entry && entry.isFile) {
      const file = item.getAsFile()
      if (file) result.push(file)
    }
  }

  return result
}

const upload = (
  file: any,
  onProgress: (val: number) => void,
  options: unknown,
) => {
  return Promise.resolve(file)
}
</script>

<template>
  <Card class="upload-files" is="form">
    <template #header>
      <div class="k-card__title">{{ getLabel('uploadFilesTitle') }}</div>
      <div class="k-card__subtitle bold">
        {{ getLabel('uploadFilesSubtitle') }}
      </div>
      <div class="k-card__subtitle">
        {{ getLabel('uploadFilesDescription') }}
      </div>
    </template>
    <template #default>
      <Flex direction="column" gap="4rem">
        <Flex direction="column">
          <h3 class="upload-files__subheading">
            {{ getLabel('referenceImages') }}
            <Tooltip
              class="k-ml-xxs"
              :content="getLabel('uploadFilesTooltip')"
            />
          </h3>
          <FormControl v-bind="validate('files.shared')">
            <template #label>
              <span>{{ getLabel('uploadFiles') }}</span>
            </template>
            <File
              :uploadOptions="{
                preTransform: preTransform,
              }"
              :accept="'*'"
              v-model="modelValue.files.shared"
              :multiple="true"
              :sortable="false"
              :upload="upload"
              :dropMessage="getLabel('dropMessage')"
              :rename="false"
              :labels="{
                delete: getLabel('delete'),
                download: 'Download',
                copy: 'Copy link',
              }"
            ></File>
          </FormControl>
        </Flex>

        <Flex direction="column">
          <h3 class="upload-files__subheading">
            {{ getLabel('architectDrawingOrModel') }}
            <Tooltip
              class="k-ml-xxs"
              :content="getLabel('architectDrawingOrModelTooltip')"
            />
          </h3>
          <div>
            {{ getLabel('architectDrawingOrModelDevelopment') }}
          </div>

          <FormControl v-bind="validate('files.model')">
            <template #label>
              <span>{{ getLabel('uploadarchitectDrawingOrModel') }}</span>
            </template>
            <File
              :accept="FileExtentions"
              v-model="modelValue.files.model"
              :multiple="true"
              :sortable="false"
              :upload="upload"
              :uploadOptions="{
                preTransform: preTransform,
              }"
              :dropMessage="getLabel('dropMessage')"
              :rename="false"
              :labels="{
                delete: getLabel('delete'),
                download: 'Download',
                copy: 'Copy link',
              }"
            ></File>
          </FormControl>
          <Alert
            variant="info"
            :content="getLabel('architectDrawingOrModelAlert')"
          >
          </Alert>
        </Flex>

        <template v-if="showUploadDroneImage">
          <Flex direction="column">
            <h3 class="upload-files__subheading">
              {{ getLabel('droneImageForPhotomontage') }}
            </h3>

            <FormControl v-bind="validate('files.drone')">
              <template #label>
                <span>{{ getLabel('uploadDroneImages') }}</span>
              </template>
              <File
                :accept="'*'"
                v-model="modelValue.files.drone"
                :multiple="true"
                :sortable="false"
                :upload="upload"
                :uploadOptions="{
                  preTransform: preTransform,
                }"
                :dropMessage="getLabel('dropMessage')"
                :rename="false"
                :labels="{
                  delete: getLabel('delete'),
                  download: 'Download',
                  copy: 'Copy link',
                }"
              ></File>
            </FormControl>
          </Flex>
        </template>
      </Flex>
    </template>
    <template #actions>
      <Button :label="getLabel('prev')" @click="onPrev" />
      <Button
        v-tooltip="{
          content: `${getLabel('requiredFields')}
• ${Object.entries(validator.errors.value.errors)
            .map(([key, value]) => value)
            .flat()
            .filter(Boolean)
            .join('\n• ')}
`,
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

<style lang="scss">
.upload-files {
  .bold {
    font-weight: bold;
  }
  &__subheading {
    margin: 0;
  }
}
</style>
