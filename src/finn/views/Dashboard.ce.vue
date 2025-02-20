<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  Button,
  DataTable,
  Flex,
  Icon,
  Card,
  Spinner,
  Dropdown,
  Dialog,
} from '@kvass/ui'

import { useAPI } from '../api'
import { type Ad } from '../types/ad'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const ads = ref<Ad[]>([])
const fetching = ref(false)

const removeDialog = ref()

const columns = computed(() => {
  return [
    {
      id: 'name',
      label: 'Kampanjenavn',
    },
    {
      id: 'status',
      label: 'Status',
    },
    {
      id: 'published',
      label: 'Publisert',
    },
    {
      id: 'url',
      label: '',
    },
    {
      id: 'insight',
      label: '',
    },
    {
      id: 'edit',
      label: '',
    },
  ]
})

const removePromise = ref<Promise<any>>()

const getData = () => {
  fetching.value = true

  API.getAds()
    .then((data) => {
      ads.value = data
    })
    .finally(() => {
      fetching.value = false
    })
}

onMounted(getData)
</script>

<template>
  <Card
    class="ads"
    title="Dine Finn-annonser"
    subtitle="Her får du en oversikt over dine Finn-annonser."
    variant="prompt"
    appearance="shadow"
  >
    <template #default>
      <template v-if="ads.length && !fetching">
        <DataTable :items="ads" :columns="columns">
          <template #name="{ item }">{{ item.name }}</template>
          <template #status="{ item }">{{
            item.preview ? 'Forhåndsvisning' : 'Publisert'
          }}</template>
          <template #published="{ item }">{{ '-' }}</template>
          <template #url="{ item }">
            <Dropdown label="Se annonser" v-if="item.units.some((v) => v.url)">
              <template #default>
                <Button
                  variant="tertiary"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                  label="Prosjektannonse"
                  target="_blank"
                  is="a"
                  :href="item.url"
                />
                <Button
                  variant="tertiary"
                  v-for="unit in item.units"
                  :label="`${unit.name}`"
                  target="_blank"
                  is="a"
                  :href="unit.url"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                />
              </template>
            </Dropdown>

            <Button
              v-else
              iconRight="fa-pro-light:arrow-up-right-from-square"
              label="Se annonse"
              target="_blank"
              is="a"
              :href="item.url"
            >
            </Button
          ></template>
          <template #insight="{ item }">
            <Button
              iconRight="fa-pro-light:arrow-up-right-from-square"
              label="Se innsikt"
              target="_blank"
              is="a"
              :href="item.statistics"
            >
            </Button>
          </template>
          <template #edit="{ item }">
            <Dialog
              :teleport="false"
              :closeOnOutsideClick="true"
              ref="removeDialog"
              class="remove-dialog"
            >
              <template #trigger="{ triggerProps }">
                <Button style="display: none" v-bind="triggerProps"></Button>
              </template>
              <template
                #header="{ titleProps, descriptionProps, closeTriggerProps }"
              >
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

                  <div
                    v-bind="descriptionProps"
                    class="remove-dialog__subtitle"
                  >
                    Du holder på å slette:
                  </div>

                  <div v-bind="titleProps" class="remove-dialog__title">
                    Finn-annonsen {{ item.name }}
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
                  :promise="removePromise"
                  @success="
                    () => {
                      close()
                      getData()
                    }
                  "
                  @click="() => (removePromise = API.remove(item.id))"
                ></Button>
              </template>
            </Dialog>
            <Dropdown label="Endre" keepOpen :teleport="false">
              <template #default>
                <Button
                  iconRight="fa-pro-light:pen"
                  label="Rediger"
                  @click="() => API.navigateView('mutate', item.id)"
                  variant="tertiary"
                ></Button>
                <Button
                  iconRight="fa-pro-light:pen"
                  label="Avpubliser"
                  @click="() => API.unpublish(item.id)"
                  variant="tertiary"
                ></Button>
                <Button
                  variant="tertiary"
                  label="Slett"
                  iconRight="fa-pro-light:trash-xmark"
                  @click="() => removeDialog.open()"
                ></Button>
              </template>
            </Dropdown>
          </template>
        </DataTable>
      </template>

      <Flex direction="column" align="center" v-if="fetching">
        <Spinner size="large" />
      </Flex>

      <Flex
        v-if="!fetching && !ads.length"
        direction="column"
        align="center"
        class="ads__empty"
      >
        <Icon icon="fa-pro-thin:face-sleeping" />
        <div>Fant ingen annonser</div>
      </Flex>
    </template>
  </Card>
</template>

<style lang="scss">
.ads {
  &__empty {
    font-size: 1rem;
    svg {
      padding-block: var(--k-ui-spacing);
      opacity: var(--k-ui-opacity-faded);

      font-size: 5rem;
    }
  }

  .remove-dialog {
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
}
</style>
