<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog, Flex, Icon, Dropdown } from '@kvass/ui'
import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()
import { useAPI } from '../api'

const API = useAPI(element)

const props = defineProps<{
  item: any
}>()

const emit = defineEmits<{
  (event: 'refetch', payload: void): void
}>()

const promise = ref<Promise<any>>()
const removedialog = ref()
</script>

<template>
  <Dialog
    :teleport="false"
    :closeOnOutsideClick="true"
    ref="removedialog"
    class="remove-dialog"
  >
    <template #trigger="{ triggerProps }">
      <Button style="display: none" v-bind="triggerProps"></Button>
    </template>
    <template #header="{ titleProps, descriptionProps, closeTriggerProps }">
      <Flex
        class="remove-dialog__header"
        justify="center"
        align="center"
        direction="column"
        gap="0.25rem"
      >
        <Icon
          icon="fa-pro-light:triangle-exclamation"
          class="remove-dialog__icon"
        ></Icon>

        <div v-bind="descriptionProps" class="remove-dialog__subtitle">
          Du holder på å slette Finn-annonsen:
        </div>

        <div v-bind="titleProps" class="remove-dialog__title">
          {{ item.name }}
        </div>

        <Button
          class="k-dialog__close-trigger"
          variant="tertiary"
          icon="fa-pro-light:times"
          size="small"
          v-bind="closeTriggerProps"
        />
      </Flex>
    </template>
    <template #actions="{ close }">
      <Button label="Avbryt" @click="close"></Button>
      <Button
        label="Bekreft"
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

  <Dropdown label="Endre" keepOpen :teleport="false" class="options">
    <template #default>
      <Button
        iconRight="fa-pro-light:pen"
        label="Rediger"
        @click="() => API.navigateView('mutate', item.id)"
        variant="tertiary"
      ></Button>
      <Button
        v-if="item.publishedAt"
        iconRight="fa-pro-light:play-pause"
        label="Avpubliser"
        :promise="promise"
        @success="
          () => {
            emit('refetch')
          }
        "
        @click="() => (promise = API.unpublish(item.id))"
        variant="tertiary"
      ></Button>

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

.remove-dialog {
  --k-dialog-min-width: 400px;

  &__title {
    font-weight: bold;
    font-size: 1.25rem;
  }
  &__icon {
    font-size: 2rem;
  }

  .k-dialog__card {
    .k-card__header {
      color: var(--k-ui-color-danger);
      background-color: var(--k-ui-color-danger-lightest);

      --k-button-tertiary-text: var(--k-ui-color-danger-darkest);
      --k-button-tertiary-background-hover: var(--k-ui-color-danger-lightest);
      --k-button-tertiary-background-active: var(--k-ui-color-danger-light);
    }
  }
}
</style>
