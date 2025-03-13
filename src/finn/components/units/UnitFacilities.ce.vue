<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  FormControl,
  Button,
  Icon,
  Dialog,
  Checkbox,
  Expandable,
} from '@kvass/ui'

import { Clone, hasDiff } from '../../../utils/index.js'
import Tooltip from '../Tooltip.ce.vue'

import { type Ad, Facility } from '../../types/ad'

const props = defineProps<{
  modelValue: Ad['fields']
  hasFields: (...args) => boolean
  hasField: (...args) => boolean
  getIsEditedBind: (...args) => { label: string; icon: string }
  isEdited: (...args) => boolean
  facilities: Facility[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ad['fields']): void
}>()

const item = ref(Clone(props.modelValue))
const facilitesDialog = ref()

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (hasDiff({ value: newValue }, { value: item.value })) {
      item.value = Clone(newValue)
    }
  },
  { deep: true },
)

const isInternalEdited = (field) => {
  return (
    hasDiff({ value: item.value[field] }, { value: props.modelValue[field] }) ||
    props.isEdited(field)
  )
}

const getIsInternalEditedBind = (...args: [any]) => {
  return props.getIsEditedBind(isInternalEdited(...args))
}

const reset = () => {
  item.value = Clone(props.modelValue)
}

const submit = () => {
  emit('update:modelValue', Clone(item.value))
}

defineExpose({
  open: () => {
    facilitesDialog.value.open()
  },
  close: () => {
    facilitesDialog.value.close()
  },
})
</script>

<template>
  <Dialog
    ref="facilitesDialog"
    variant="prompt"
    title="Tilpass enhetens fasiliteter i Finn-annonsen"
    subtitle="Fasiliteter vil vises i en egen seksjon på enhetsannonsen og benyttes til filtrering av annonser på Finn."
    :teleport="false"
    :closeOnOutsideClick="false"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none"></Button>
    </template>
    <template #default>
      <Expandable :expanded="true" v-if="hasFields('ESTATE_PREFERENCE')">
        <template #title>
          <span> Fasiliteter i enhetsannonsen" </span>
          <Tooltip
            class="k-ml-xxs"
            content="Fasilitenene som velges her vil bli synlig under fasiliteter på enhetsannonsen. De vil også være tilgjengelige som filtre i søkelisten."
            src="https://assets.kvass.no/67c80a4c92504cdf70aba70e"
          />
        </template>
        <template #actions>
          <Icon
            :class="[
              'ad__expandable-list-field-icon',
              {
                'ad__expandable-list-field-icon--edited':
                  isInternalEdited('ESTATE_PREFERENCE'),
              },
            ]"
            :icon="getIsInternalEditedBind('ESTATE_PREFERENCE').icon"
            v-tooltip="{
              content: getIsInternalEditedBind('ESTATE_PREFERENCE').label,
              container: false,
            }"
          ></Icon>
        </template>
        <template #default>
          <FormControl
            class="facilities"
            label="Tilgjengelige fasiliteter"
            v-if="hasField('ESTATE_PREFERENCE')"
          >
            <Checkbox
              v-for="facility in facilities"
              v-model="item.ESTATE_PREFERENCE"
              :value="facility.value"
              :label="facility.label"
            ></Checkbox>
          </FormControl>
        </template>
      </Expandable>
    </template>
    <template #actions="{ close }">
      <Button
        label="Avbryt"
        @click="
          () => {
            reset()
            close()
          }
        "
        variant="secondary"
      ></Button>

      <Button
        label="Bekreft"
        @click="
          () => {
            submit()
            close()
          }
        "
        variant="primary"
      ></Button>
    </template>
  </Dialog>
</template>

<style lang="scss"></style>
