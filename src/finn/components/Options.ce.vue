<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog, Flex, Icon, Dropdown } from '@kvass/ui'
import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()
import { useAPI } from '../api'

import { type Ad } from '../types/ad'

const API = useAPI(element)

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

const props = defineProps<{
  item: WithRequired<Ad, 'id'>
}>()

const emit = defineEmits<{
  (event: 'refetch', payload: void): void
}>()

const promise = ref<Promise<any>>()
const removedialog = ref()
const unpublishdialog = ref()

const navigatePublish = (id: string, preview: boolean) => {
  sessionStorage.setItem('k-finn-step', preview ? 'preview' : 'publish')
  API.navigateView('mutate', id)
}

const navigateEdit = (id: string) => {
  sessionStorage.setItem('k-finn-step', 'ad')
  API.navigateView('mutate', id)
}
</script>

<template>
  <Dialog
    :teleport="false"
    :closeOnOutsideClick="true"
    variant="prompt"
    ref="removedialog"
    class="remove-dialog"
    title="Du er i ferd med å slette annonsen"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none" v-bind="triggerProps"></Button>
    </template>

    <template #default="{ descriptionProps }">
      <div v-bind="descriptionProps">
        Du er i ferd med å slette din Finn-annonse. Vi gjør oppmerksom på at
        annonsen avsluttes i sin helhet, du vil eventuelt miste resterende
        betalt periode hos Finn. Er du sikker?
      </div>
    </template>

    <template #actions="{ close }">
      <Button label="Nei, ta meg tilbake" @click="close"></Button>
      <Button
        label="Ja, jeg ønsker å slette"
        variant="primary"
        :promise="promise"
        @success="
          () => {
            close()
            emit('refetch')
          }
        "
        @click="() => (promise = API.remove(item.id))"
      ></Button>
    </template>
  </Dialog>

  <Dialog
    :teleport="false"
    :closeOnOutsideClick="true"
    variant="prompt"
    ref="unpublishdialog"
    class="unpublish-dialog"
    title="Du er i ferd med å avpublisere annonsen"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none" v-bind="triggerProps"></Button>
    </template>

    <template #default="{ descriptionProps }">
      <div v-bind="descriptionProps">
        Du er i ferd med å avpublisere din Finn-annonse. Vi gjør oppmerksom på
        at perioden for annonsen vil fortsette å løpe til utløpsdato.
      </div>
    </template>

    <template #actions="{ close }">
      <Button label="Nei, ta meg tilbake" @click="close"></Button>
      <Button
        label="Ja, jeg ønsker å avpublisere"
        variant="primary"
        :promise="promise"
        @success="
          () => {
            close()
            emit('refetch')
          }
        "
        @click="() => (promise = API.unpublish(item.id))"
      ></Button>
    </template>
  </Dialog>

  <Dropdown label="Endre" keepOpen :teleport="false" class="options">
    <template #default>
      <Button
        iconRight="fa-pro-light:pen"
        label="Rediger"
        @click="() => navigateEdit(item.id)"
        variant="tertiary"
      ></Button>

      <template v-if="item.code">
        <Button
          v-if="!item.publishedAt || item.preview"
          iconRight="fa-pro-light:arrow-right"
          label="Publiser"
          @click="() => navigatePublish(item.id, item.preview)"
          variant="tertiary"
        ></Button>
        <Button
          v-if="item.publishedAt"
          iconRight="fa-pro-light:play-pause"
          label="Avpubliser"
          @click="
            () => {
              unpublishdialog.open()
            }
          "
          variant="tertiary"
        ></Button>
      </template>

      <Button
        data-type="delete"
        class="options__delete"
        variant="danger"
        label="Slett"
        iconRight="fa-pro-light:trash-xmark"
        @click="
          () => {
            removedialog.open()
          }
        "
      ></Button>
    </template>
  </Dropdown>
</template>

<style lang="scss">
.k-button.options__delete {
  color: var(--k-button-danger-background, var(--k-ui-color-danger));
  background-color: var(--k-button-danger-text, white);

  &:focus,
  &:active,
  &:hover {
    color: var(--k-button-danger-text, white);
  }
}

.unpublish-dialog,
.remove-dialog {
  --k-dialog-min-width: 400px;
  --k-dialog-max-width: 600px;
}
</style>
