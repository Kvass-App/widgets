<script setup lang="ts">
import { ref, watch } from 'vue'
import { FormControl, Button, Icon, Input, Grid, Dialog } from '@kvass/ui'

import ExpandableList from '../ExpandableList.ce.vue'

import { Clone, hasDiff } from '../../../utils/index.js'
import Tooltip from '../Tooltip.ce.vue'

import { type Ad } from '../../types/ad'

const props = defineProps<{
  modelValue: Ad['fields']
  hasFields: (...args) => boolean
  hasField: (...args) => boolean
  getIsEditedBind: (...args) => { label: string; icon: string }
  isEdited: (...args) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ad['fields']): void
}>()

const item = ref(Clone(props.modelValue))

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (hasDiff({ value: newValue }, { value: item.value })) {
      item.value = Clone(newValue)
    }
  },
  { deep: true },
)

const linkDialog = ref()

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
    linkDialog.value.open()
  },
  close: () => {
    linkDialog.value.close()
  },
})
</script>

<template>
  <Dialog
    ref="linkDialog"
    variant="prompt"
    title="Tilpass enhetens nyttige lenker i Finn-annonsen"
    subtitle="Lenker vil være synlig under kontakt informasjon på enhetsannonsen"
    :teleport="false"
    :closeOnOutsideClick="false"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none"></Button>
    </template>
    <template #default>
      <ExpandableList
        v-if="hasFields('MOREINFO')"
        :limit="4"
        :template="{ URL: '', URLTEXT: '' }"
        :expanded="true"
        v-model="item.MOREINFO"
      >
        <template #title>
          <span>Nyttige lenker i Finn-annonsen</span>
          <Tooltip
            class="k-ml-xxs"
            content="Nyttige lenker vises her i enhetsannonsen. Noen felt er standard og låst av Finn, derfor vises lenken til prosjektsiden alltid automatisk. Du kan fritt legge til egne lenker og lenker til andre nettsteder."
            src="https://assets.kvass.no/67c80a5e92504cdf70aba756"
          />
        </template>
        <template #actions>
          <Icon
            :class="[
              'ad__expandable-list-field-icon',
              {
                'ad__expandable-list-field-icon--edited':
                  isInternalEdited('MOREINFO'),
              },
            ]"
            :icon="getIsInternalEditedBind('MOREINFO').icon"
            v-tooltip="{
              content: getIsInternalEditedBind('MOREINFO').label,
              container: false,
            }"
          ></Icon>
        </template>

        <template
          #before-content
          v-if="hasFields('ESTATE_EXTERNAL_URL', 'ESTATE_EXTERNAL_ORDER_URL')"
        >
          <Grid columns="2">
            <template v-if="hasField('ESTATE_EXTERNAL_URL')">
              <FormControl label="URL til nyttig lenke">
                <Input
                  v-model="data.ESTATE_EXTERNAL_URL"
                  suffix="URL"
                  disabled
                ></Input>
              </FormControl>
              <FormControl label="Visningsnavn på lenken på Finn-annonsen">
                <Input modelValue="Se prosjektets hjemmeside" disabled></Input>
              </FormControl>
            </template>
            <template v-if="hasField('ESTATE_EXTERNAL_ORDER_URL')">
              <FormControl label="URL til nyttig lenke">
                <Input
                  v-model="data.ESTATE_EXTERNAL_ORDER_URL"
                  suffix="URL"
                  disabled
                ></Input>
              </FormControl>
              <FormControl label="Visningsnavn på lenken på Finn-annonsen">
                <Input modelValue="Bestill salgsoppgave" disabled></Input>
              </FormControl>
            </template>
          </Grid>

          <div class="ad__expandable-list-divider"></div>
        </template>

        <template #default="{ item: data }">
          <Grid columns="2">
            <FormControl label="URL til nyttig lenke">
              <Input v-model="data.URL" suffix="URL"> </Input>
            </FormControl>
            <FormControl label="Visningsnavn på lenken på Finn-annonsen">
              <Input v-model="data.URLTEXT"> </Input>
            </FormControl>
          </Grid>
        </template>
      </ExpandableList>
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
