<script setup lang="ts">
import { ref, computed, watch, inject, nextTick } from 'vue'
import {
  FormControl,
  Input,
  Switch,
  Flex,
  Button,
  Dialog,
  RadioGroup,
  TextArea,
  Dropdown,
  File,
} from '@kvass/ui'
import Tooltip from './Tooltip.ce.vue'
import Validator from '../composeable/Validator'
import { vTooltip } from 'floating-vue'

import { Rooms } from '../enums'

import { Clone } from '../../utils'

import type { ImageOrder } from '../types'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../keys'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!

const props = defineProps<{
  modelValue?: ImageOrder
}>()

const emit = defineEmits<{
  (e: 'submit', order: ImageOrder): void
  (e: 'reset'): void
  (e: 'update:modelValue', value: ImageOrder): void
  (e: 'remove', value: ImageOrder): void
}>()

const template = {
  type: 'interior',
  units: null,
  description: '',
  attachments: [],
  visualizationTechnique: 'eyelevel',
  room: null,
}

const order = ref<ImageOrder>(Clone(props.modelValue || template))

const rules = computed(() => {
  const base = {
    type: 'required',
  }

  if (order.value.type === 'interior') {
    base['room'] = 'required'

    if (order.value.room === 'other') {
      base['description'] = 'required'
    }
  }

  if (order.value.type === 'exterior') {
    base['units'] = 'required'
  }

  return base
})

const labels = computed(() => {
  return {
    room: getLabel('interiorRoom'),
    type: getLabel('type'),
    description: getLabel('deliveryDescription'),
    units: getLabel('numberOfUnits'),
    visualizationTechnique: getLabel('visualizationTechnique'),
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: order,
})

const { bind: validate } = validator

const reset = () => {
  order.value = Clone(props.modelValue || template)
  emit('reset')
}

const remove = () => {
  emit('remove', order.value)
}

const submit = () => {
  emit('update:modelValue', Clone(order.value))
}

const dialog = ref()

const isDialogOpen = ref(false)
const dialogMounted = ref(false)

watch(isDialogOpen, async (val) => {
  if (val) {
    await nextTick()
    dialogMounted.value = true
  } else {
    dialogMounted.value = false
  }
})
</script>

<template>
  <Dialog
    @open="isDialogOpen = true"
    @close="
      () => {
        isDialogOpen = false
        reset()
      }
    "
    ref="dialog"
    alignment="center"
    :teleport="false"
    :title="getLabel('3dImage')"
    :subtitle="getLabel('specifyVisualizationDetails')"
  >
    <template #trigger="{ triggerProps }">
      <slot name="trigger" :trigger-props="triggerProps"> </slot>
    </template>
    <template #default>
      <Flex direction="column" gap="2rem">
        <FormControl
          v-bind="validate('type')"
          v-if="isDialogOpen && dialogMounted"
        >
          <template #label>
            <span>{{ getLabel('imageType') }}</span>
            <Tooltip class="k-ml-xxs" :content="getLabel('imageTypeTooltip')" />
          </template>
          <template #default>
            <RadioGroup
              variant="segment"
              direction="vertical"
              v-model="order.type"
              :items="[
                { id: 'interior', label: getLabel('interior') },
                { id: 'exterior', label: getLabel('exterior') },
              ]"
              :getRootNode="
                () => {
                  //@ts-ignore
                  return root.value.getRootNode()
                }
              "
            ></RadioGroup>
          </template>
        </FormControl>

        <TransitionGroup name="list">
          <template v-if="order.type === 'exterior'">
            <FormControl v-bind="validate('units')">
              <template #label>
                <span>{{ getLabel('numberOfUnits') }}</span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="getLabel('numberOfUnitsTooltip')"
                />
              </template>
              <Input
                :placeholder="getLabel('numberOfUnitsPlaceholder')"
                :modelValue="order.units"
                @update:modelValue="
                  (v) =>
                    (order.units = Number.isNaN(v) ? undefined : (v as number))
                "
                :mask="{
                  mask: Number,
                  min: 0,
                  scale: 0,
                }"
              ></Input>
            </FormControl>

            <FormControl v-bind="validate('visualizationTechnique')">
              <template #label>
                <span>{{ getLabel('visualizationTechnique') }}</span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="getLabel('visualizationTechniqueTooltip')"
                />
              </template>
              <RadioGroup
                variant="segment"
                direction="vertical"
                v-model="order.visualizationTechnique"
                :items="[
                  { id: 'eyelevel', label: getLabel('eyelevel') },
                  { id: 'photomontage', label: getLabel('photomontage') },
                ]"
                :getRootNode="() => root.value.getRootNode()"
              ></RadioGroup>
            </FormControl>
          </template>

          <template v-if="order.type === 'interior'">
            <FormControl v-bind="validate('room')">
              <template #label>
                <span>{{ getLabel('interiorRoom') }}</span>
                <Tooltip
                  class="k-ml-xxs"
                  :content="getLabel('interiorRoomTooltip')"
                />
              </template>
              <Dropdown
                :teleport="false"
                :label="
                  getLabel(
                    Rooms.find((v) => v.id === order.room)?.label || 'select',
                  )
                "
                :items="
                  Rooms.map((v) => {
                    return {
                      ...v,
                      label: getLabel(v.label),
                      action: () => (order.room = v.id),
                    }
                  })
                "
              >
              </Dropdown>
            </FormControl>
          </template>
        </TransitionGroup>

        <FormControl v-bind="validate('description')">
          <template #label>
            <span>{{ getLabel('deliveryDescription') }}</span>
            <Tooltip
              class="k-ml-xxs"
              :content="getLabel('deliveryDescriptionTooltip')"
            />
          </template>
          <TextArea
            v-model="order.description"
            :rows="6"
            :placeholder="getLabel('deliveryDescriptionPlaceholder')"
          ></TextArea>
        </FormControl>
      </Flex>
    </template>
    <template #actions="{ close }">
      <Button
        v-if="modelValue"
        :label="getLabel('remove')"
        @click="
          () => {
            remove()
            close()
          }
        "
      ></Button>
      <Button :label="getLabel('cancel')" @click="close"></Button>
      <Button
        v-tooltip="{
          content: Object.entries(validator.errors.value.errors)
            .map(([key, value]) => value)
            .flat()
            .join('\n'),
          disabled: validator.passes.value,
          container: false,
        }"
        :disabled="!validator.passes.value"
        variant="primary"
        :label="getLabel('confirm')"
        @click="
          () => {
            if (!validator.passes) return

            submit()
            close()
          }
        "
      ></Button>
    </template>
  </Dialog>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.list-enter-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  opacity: 0;
  position: absolute;
}
</style>
