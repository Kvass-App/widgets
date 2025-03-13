<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  FormControl,
  Button,
  Flex,
  Icon,
  Input,
  Expandable,
  Dialog,
  Media,
  File,
} from '@kvass/ui'

import Tooltip from '../Tooltip.ce.vue'

import { vTooltip } from 'floating-vue'
import Validator from '../../composeable/Validator'

import RichTextMultiple from '../RichTextMultiple.ce.vue'

import { uploadFunction, Clone, hasDiff } from '../../../utils/index.js'

import { type Ad } from '../../types/ad'

const props = defineProps<{
  modelValue: Ad['fields']
  hasFields: (...args) => boolean
  hasField: (...args) => boolean
  getIsEditedBind: (...args) => { label: string; icon: string }
  isEdited: (...args) => boolean
  rules: Record<string, string>
  labels: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ad['fields']): void
}>()

const item = ref(Clone(props.modelValue))
const descriptionDialog = ref()

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (hasDiff({ value: newValue }, { value: item.value })) {
      item.value = Clone(newValue)
    }
  },
  { deep: true },
)

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
          title="Hovedtittel og undertittel"
          v-if="hasFields('HEADING', 'HOUSING_UNIT_REF')"
        >
          <template #title>
            <span>Hovedtittel og undertittel</span>
            <Tooltip
              class="k-ml-xxs"
              content="Teksten du skriver her vises som hovedtittelen og undertittel i annonsen."
              src="https://assets.kvass.no/67c7181792504cdf70aba68d"
            />
          </template>
          <template #default>
            <FormControl
              v-if="hasField('HOUSING_UNIT_REF')"
              v-bind="validate('HOUSING_UNIT_REF')"
              label="Hovedtittel for enhetsannonsen"
              :class="[
                'ad__field',
                { 'ad__field--edited': isInternalEdited('HOUSING_UNIT_REF') },
              ]"
            >
              <Input v-model="item.HOUSING_UNIT_REF">
                <template #suffix>
                  <Icon
                    :icon="getIsInternalEditedBind('HOUSING_UNIT_REF').icon"
                    v-tooltip="{
                      content:
                        getIsInternalEditedBind('HOUSING_UNIT_REF').label,
                      container: false,
                    }"
                  ></Icon>
                </template>
              </Input>
            </FormControl>
            <FormControl
              v-if="hasField('HEADING')"
              v-bind="validate('HEADING')"
              label="Undertittel for enhetsannonsen"
              :class="[
                'ad__field',
                { 'ad__field--edited': isInternalEdited('HEADING') },
              ]"
            >
              <Input v-model="item.HEADING">
                <template #suffix>
                  <Icon
                    :icon="getIsInternalEditedBind('HEADING').icon"
                    v-tooltip="{
                      content: getIsInternalEditedBind('HEADING').label,
                      container: false,
                    }"
                  ></Icon>
                </template>
              </Input>
            </FormControl>
          </template>
        </Expandable>
        <Expandable :expanded="true" v-if="hasFields('MEDIA')">
          <template #title>
            <span>Bilder</span>
            <Tooltip
              class="k-ml-xxs"
              content="Bildene hentes fra enhetssiden. Det første bildet blir forsidebildet i enhetsannonsen."
              src="https://assets.kvass.no/67c8088692504cdf70aba702"
            />
          </template>
          <template #actions>
            <Icon
              :class="[
                'ad__expandable-list-field-icon',
                {
                  'ad__expandable-list-field-icon--edited':
                    isInternalEdited('MEDIA'),
                },
              ]"
              :icon="getIsInternalEditedBind('MEDIA').icon"
              v-tooltip="{
                content: getIsInternalEditedBind('MEDIA').label,
                container: false,
              }"
            ></Icon>
          </template>
          <template #default>
            <Media
              v-if="hasField('MEDIA')"
              v-model="item.MEDIA"
              label="Bilder i enhetsannonsen"
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

        <Expandable :expanded="true" v-if="hasFields('FLOORPLAN_MEDIA')">
          <template #title>
            <span>Plantegninger</span>
            <Tooltip
              class="k-ml-xxs"
              content="Plantegninger vises sist i bildegalleriet eller som en egen knapp i galleriet med navnet «Plantegninger». Dette avhenger av hva annonsetypen støtter."
              src="https://assets.kvass.no/67d1501f9b29de28ddec33d9"
            />
          </template>
          <template #actions>
            <Icon
              :class="[
                'ad__expandable-list-field-icon',
                {
                  'ad__expandable-list-field-icon--edited':
                    isInternalEdited('FLOORPLAN_MEDIA'),
                },
              ]"
              :icon="getIsInternalEditedBind('FLOORPLAN_MEDIA').icon"
              v-tooltip="{
                content: getIsInternalEditedBind('FLOORPLAN_MEDIA').label,
                container: false,
              }"
            ></Icon>
          </template>
          <template #default>
            <File
              :rename="false"
              v-if="hasField('FLOORPLAN_MEDIA')"
              v-model="item.FLOORPLAN_MEDIA"
              label="Plantegninger i enhetsannonsen"
              dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
              :accept="['image/jpeg', 'image/png', 'image/jpg']"
              :upload="uploadFunction"
              :uploadOptions="{}"
              :types="['Image']"
              :multiple="true"
              :sortable="true"
              :labels="{
                delete: 'Slett',
                download: 'Last ned',
                copy: 'Kopier lenke',
              }"
            >
            </File>
          </template>
        </Expandable>

        <RichTextMultiple
          :expanded="true"
          v-if="hasFields('GENERAL_DESCRIPTION')"
          v-model="item.GENERAL_DESCRIPTION"
        >
          <template #title>
            <span>Beskrivelse</span>
            <Tooltip
              class="k-ml-xxs"
              content="Teksten du skriver her vises under beskrivelsen i enhetsannonsen."
              src="https://assets.kvass.no/67c80a5792504cdf70aba732"
            />
          </template>
          <template #actions>
            <Icon
              :class="[
                'ad__expandable-list-field-icon',
                {
                  'ad__expandable-list-field-icon--edited': isInternalEdited(
                    'GENERAL_DESCRIPTION',
                  ),
                },
              ]"
              :icon="getIsInternalEditedBind('GENERAL_DESCRIPTION').icon"
              v-tooltip="{
                content: getIsInternalEditedBind('GENERAL_DESCRIPTION').label,
                container: false,
              }"
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
          container: false,
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
