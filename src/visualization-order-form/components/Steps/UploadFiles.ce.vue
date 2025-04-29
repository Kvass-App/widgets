<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { FormControl, Button, Card, File, Flex, Switch } from '@kvass/ui'
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

const has3dModel = ref(false)

/*
3d model ( arkitekt tegning )
relevante filer (insp, leveransebeskrivelse)
dronebilder

alt lagres i images, setter bare en tag på bildene.
*/

const showUploadDroneImage = computed(() => {
  return modelValue.value.images.some(
    (v) => v.type === 'exterior' && v.visualizationTechnique === 'photomontage',
  )
})

const rules = computed(() => {
  const base = {
    'files.shared': ['min:1', 'required'],

    'files.model': ['min:1', 'required'],
  }

  if (showUploadDroneImage.value && modelValue.value.files.hasDrone) {
    base['files.drone'] = ['min:1', 'required']
  }

  return base
})

const labels = computed(() => {
  return {
    'files.shared': getLabel('referenceImages'),

    'files.model': getLabel('3dModelArchitect'),
    'files.drone': getLabel('droneImageForVisualization'),
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
    class="upload-files"
    is="form"
    :title="getLabel('uploadFilesTitle')"
    :subtitle="getLabel('uploadFilesSubtitle')"
  >
    <template #default>
      <Flex direction="column" gap="4rem">
        <Flex direction="column">
          <h3 class="upload-files__subheading">
            {{ getLabel('referenceImages') }}
          </h3>
          <FormControl v-bind="validate('files.shared')">
            <template #label>
              <span>{{ getLabel('uploadFiles') }}</span>
              <Tooltip
                class="k-ml-xxs"
                :content="getLabel('uploadFilesTooltip')"
              />
            </template>
            <File
              v-model="modelValue.files.shared"
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
        </Flex>

        <Flex direction="column">
          <h3 class="upload-files__subheading">
            {{ getLabel('3dModelArchitect') }}
          </h3>
          <FormControl>
            <template #label>
              <span>{{ getLabel('has3DModel') }}</span>
              <Tooltip
                class="k-ml-xxs"
                :content="getLabel('uploadFilesTooltip')"
              />
            </template>
            <Switch
              v-model="modelValue.files.hasModel"
              :getRootNode="() => root.value?.getRootNode()"
              :labels="{
                on: getLabel('yes'),
                off: getLabel('no'),
              }"
            />
          </FormControl>
          <div v-if="!modelValue.files.hasModel">
            {{ getLabel('missing3DModel') }}
          </div>
          <FormControl v-bind="validate('files.model')">
            <template #label>
              <span>{{
                getLabel(
                  modelValue.files.hasModel
                    ? 'upload3dModel'
                    : 'uploadArchitectDrawing',
                )
              }}</span>
              <Tooltip
                class="k-ml-xxs"
                :content="getLabel('uploadFilesTooltip')"
              />
            </template>
            <File
              v-model="modelValue.files.model"
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
        </Flex>

        <template v-if="showUploadDroneImage">
          <Flex direction="column">
            <h3 class="upload-files__subheading">
              {{ getLabel('droneImageForVisualization') }}
            </h3>
            <FormControl>
              <template #label>
                <span>{{ getLabel('hasDroneImage') }}</span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="getLabel('uploadFilesTooltip')"
                />
              </template>
              <Switch
                v-model="modelValue.files.hasDrone"
                :getRootNode="() => root.value?.getRootNode()"
                :labels="{
                  on: getLabel('yes'),
                  off: getLabel('no'),
                }"
              />
            </FormControl>
            <div v-if="!modelValue.files.hasDrone">
              {{ getLabel('missingDromeImage') }}
            </div>
            <FormControl
              v-bind="validate('files.drone')"
              v-if="modelValue.files.hasDrone"
            >
              <template #label>
                <span>{{ getLabel('uploadDroneImages') }}</span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="getLabel('uploadFilesTooltip')"
                />
              </template>
              <File
                v-model="modelValue.files.drone"
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
          </Flex>
        </template>
      </Flex>
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

<style lang="scss">
.upload-files {
  &__subheading {
    margin: 0;
  }
}
</style>
