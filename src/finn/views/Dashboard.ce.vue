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
  Badge,
} from '@kvass/ui'

import Options from '../components/Options.ce.vue'

import { useAPI } from '../api'
import { type Ad } from '../types/ad'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const ads = ref<Ad[]>([])
const fetching = ref(false)

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
      id: 'insight',
      label: '',
    },
    {
      id: 'url',
      label: '',
    },

    {
      id: 'edit',
      label: '',
    },
  ]
})

const getStatus = (item: Ad) => {
  if (!item.code) {
    return {
      label: 'Utkast',
      variant: 'neutral' as const,
    }
  }

  if (!item.publishedAt) {
    return {
      label: 'Avpublisert',
      variant: 'danger' as const,
    }
  }

  if (item.preview) {
    return {
      label: 'Utkast - Forhåndsvisning',
      variant: 'info' as const,
    }
  }

  const isOlderThanXDays = (date, days = 180) => {
    if (!date) return
    return (
      new Date(date) < new Date(new Date().setDate(new Date().getDate() - days))
    )
  }

  //@ts-ignore
  // if (
  //   isOlderThanXDays(item.createdAt, 180) &&
  //   ['ESTATE_BUSINESS_RENT', 'ESTATE_BUSINESS_SALE'].includes(item.type || '')
  // )
  //   return {
  //     label: 'Utløpt',
  //     variant: 'neutral' as const,
  //   }

  return {
    label: 'Aktiv',
    variant: 'success' as const,
  }
}
const getPublishedAt = (item: Ad) => {
  if (!item.code) return '-'
  if (!item.publishedAt) return '-'
  if (item.preview) return '-'

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }

  //@ts-ignore
  return new Date(item.publishedAt).toLocaleString('nb-NO', options)
}

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

onMounted(() => {
  getData()
})
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
          <template #status="{ item }">
            <Badge v-bind="getStatus(item)" appearance="filled" />
          </template>
          <template #published="{ item }">{{ getPublishedAt(item) }}</template>
          <template #url="{ item }">
            <template v-if="item.url">
              <Dropdown
                label="Se annonser"
                v-if="item.units.some((v) => v.url)"
              >
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
              </Button>
            </template>
          </template>
          <template #insight="{ item }">
            <Button
              v-if="!item.preview && item.statistics"
              iconRight="fa-pro-light:arrow-up-right-from-square"
              label="Se innsikt"
              target="_blank"
              is="a"
              :href="item.statistics"
            >
            </Button>
          </template>
          <template #edit="{ item }">
            <Options :item="item" @refetch="() => getData()" :key="item.id" />
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
  .k-datatable {
    position: initial;
  }

  &__empty {
    font-size: 1rem;
    svg {
      padding-block: var(--k-ui-spacing);
      opacity: var(--k-ui-opacity-faded);

      font-size: 5rem;
    }
  }
}
</style>
