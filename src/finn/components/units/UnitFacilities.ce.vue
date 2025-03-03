<script setup lang="ts">
import { ref } from 'vue'
import {
  FormControl,
  Button,
  Icon,
  Dialog,
  Checkbox,
  Expandable,
} from '@kvass/ui'

import ProjectUnitFacilities from '../../enums/ProjectUnitFacilities.js'

import { Clone, hasDiff } from '../../../utils/index.js'

import { type Ad } from '../../types/ad'

const props = defineProps<{
  modelValue: Ad['fields']
  hasFields: (...args) => boolean
  hasField: (...args) => boolean
  getIsEditedIcon: (...args) => string
  isEdited: (...args) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ad['fields']): void
}>()

const item = ref(Clone(props.modelValue))
const facilitesDialog = ref()

const isInternalEdited = (field) => {
  return (
    hasDiff({ value: item.value[field] }, { value: props.modelValue[field] }) ||
    props.isEdited(field)
  )
}

const getIsInternalEditedIcon = (...args: [any]) => {
  return props.getIsEditedIcon(isInternalEdited(...args))
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
      <Expandable
        :expanded="true"
        title="Fasiliteter for enhetsannonsen"
        subtitle="Velg fasiliteter for enhetsannonsen"
        v-if="hasFields('ESTATE_PREFERENCE')"
      >
        <template #actions>
          <Icon
            :icon="getIsInternalEditedIcon('ESTATE_PREFERENCE')"
            :class="[
              'ad__expandable-list-field-icon',
              {
                'ad__expandable-list-field-icon--edited':
                  isInternalEdited('ESTATE_PREFERENCE'),
              },
            ]"
          ></Icon>
        </template>
        <template #default>
          <FormControl
            class="facilities"
            label="Tilgjengelige fasiliteter"
            v-if="hasField('ESTATE_PREFERENCE')"
          >
            <Checkbox
              v-for="facility in ProjectUnitFacilities"
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
