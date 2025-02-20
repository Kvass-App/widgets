<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import {
  FormControl,
  Button,
  Flex,
  Icon,
  Input,
  Expandable,
  Dialog,
  Media,
} from '@kvass/ui'

import { type Fields } from '../../api'
import { vTooltip } from 'floating-vue'
import Validator from '../../composeable/Validator'

import RichTextMultiple from '../RichTextMultiple.ce.vue'

import { uploadFunction, Clone, hasDiff } from '../../../utils/index.js'

import { type Ad } from '../../types/ad'

const props = defineProps<{
  modelValue: Ad['fields']
  hasFields: (...args) => boolean
  hasField: (...args) => boolean
  getIsEditedIcon: (...args) => string
  isEdited: (...args) => boolean
  rules: Record<string, string>
  labels: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ad['fields']): void
}>()

const item = ref(Clone(props.modelValue))
const descriptionDialog = ref()

const validatorFilter = (obj: Record<string, string>) => {
  const fields = ['HEADING']

  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => {
      return fields.includes(k)
    }),
  )
}

const rules = computed(() => {
  return validatorFilter(props.rules)
})

const labels = computed(() => {
  return validatorFilter(props.labels)
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: item,
})

const { bind: validate } = validator

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
    descriptionDialog.value.open()
  },
  close: () => descriptionDialog.value.close(),
})
</script>

<template>
  <Dialog
    variant="prompt"
    title="Rediger enhet"
    subtitle="Rediger beskrivelser og bilder"
    :teleport="false"
    :closeOnOutsideClick="false"
    ref="descriptionDialog"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none" v-bind="triggerProps"></Button>
    </template>
    <template #default>
      <Flex direction="column" gap="2rem">
        <Expandable
          :expanded="true"
          title="Hovedtittel"
          subtitle="Teksten som formuleres her vil bli synlig som hovedtittel på enhetsannonsen"
          v-if="hasFields('HEADING')"
        >
          <template #default>
            <FormControl
              v-bind="validate('HEADING')"
              label="Hovedtittel for enhetsannonsen"
              :class="[
                'ad__field',
                { 'ad__field--edited': isInternalEdited('HEADING') },
              ]"
            >
              <Input v-model="item.HEADING">
                <template #suffix>
                  <Icon :icon="getIsInternalEditedIcon('HEADING')"></Icon>
                </template>
              </Input>
            </FormControl>
          </template>
        </Expandable>
        <Expandable
          :expanded="true"
          title="Media"
          subtitle="Disse hentes fra enhetssiden. Det første bilde vil være forsidebildet på enhetsannonsen."
          v-if="hasFields('MEDIA')"
        >
          <template #actions>
            <Icon
              :icon="getIsInternalEditedIcon('MEDIA')"
              :class="[
                'ad__expandable-list-field',
                {
                  'ad__expandable-list-field--edited':
                    isInternalEdited('MEDIA'),
                },
              ]"
            ></Icon>
          </template>
          <template #default>
            <Media
              v-if="hasField('MEDIA')"
              v-model="item.MEDIA"
              label="Bilder i Finn-annonsen"
              dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
              :accept="['image/jpeg', 'image/png', 'image/jpg']"
              :upload="uploadFunction"
              :types="['Image']"
              :multiple="true"
              :sortable="true"
              :description="true"
              placement="outside"
              size="contain"
              :labels="{
                selectMessage:
                  'Trykk på knappen nedenfor for å laste opp andre filtyper',
                select: 'Velg',
                cancel: 'Avbryt',
                save: 'Bekreft',
                descriptionPlaceholder: '',
                image: {
                  createLabel: 'Bilde',
                  preview: '',
                  inputLabel: '',
                  error: '',
                },
              }"
            >
            </Media>
          </template>
        </Expandable>

        <RichTextMultiple
          :expanded="true"
          title="Beskrivelse"
          subtitle="Teksten som formuleres her vil bli synlig under beskrivelse på enhetsannonsen."
          v-if="hasFields('GENERAL_DESCRIPTION')"
          v-model="item.GENERAL_DESCRIPTION"
        >
          <template #actions>
            <Icon
              :icon="getIsInternalEditedIcon('GENERAL_DESCRIPTION')"
              :class="[
                'ad__expandable-list-field',
                {
                  'ad__expandable-list-field--edited': isInternalEdited(
                    'GENERAL_DESCRIPTION',
                  ),
                },
              ]"
            ></Icon>
          </template>
        </RichTextMultiple>
      </Flex>
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
        v-tooltip="{
          content: Object.entries(validator.errors.value.errors)
            .map(([key, value]) => value)
            .flat()
            .join('\n'),
          disabled: validator.passes.value,
        }"
        label="Bekreft"
        :disabled="!validator.passes.value"
        @click="
          () => {
            if (!validator.passes) return

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
