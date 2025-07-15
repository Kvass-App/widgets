<script setup>
import { ref, watch } from 'vue'
import {
  DataTable,
  Input,
  Flex,
  FormControl,
  Alert,
  Spinner,
  Icon,
} from '@kvass/ui'
import { getLabel as getLabelFactory } from '../../utils/index.js'

const props = defineProps({
  integration_id: {
    type: String,
    required: true,
  },
  app_url: {
    type: String,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const t = getLabelFactory(props.labels, {
  clicks: 'Klikk',
  impressions: 'Visninger',
  ctr: 'Klikkfrekvens',
  position: 'Rangering i søk',
  queryInfo: 'Søk på en frase',
  query: 'Søkefrase',
  startDateQuery: 'Startdato for søkefraser',
  endDateQuery: 'Sluttdato for søkefraser',
  queryPlaceholder: 'Søk på en frase, for eksempel Rambergveien',
  adjustSearch: 'Tilpass søk',
})
const query = ref('')
const columns = ref([
  {
    id: 'query',
    label: t('query'),
  },
  {
    id: 'clicks',
    label: t('clicks'),
  },
  {
    id: 'impressions',
    label: t('impressions'),
  },
  {
    id: 'ctr',
    label: t('ctr'),
  },
  {
    id: 'position',
    label: t('position'),
  },
])

const queryData = ref([
  {
    query: 'Søkefrase 1',
    clicks: 100,
    impressions: 300,
    ctr: 0.3,
    position: 1.4,
  },
  {
    query: 'Søkefrase 2',
    clicks: 100,
    impressions: 300,
    ctr: 0.3,
    position: 1.4,
  },
  {
    query: 'Søkefrase 3',
    clicks: 100,
    impressions: 300,
    ctr: 0.3,
    position: 1.4,
  },
])
const startDate = ref()
const endDate = ref()
const isLoading = ref(false)

async function fetchQueryData() {
  const url = new URL(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/gscData`,
  )

  if (query.value !== '') {
    url.searchParams.append('query', query.value)
    url.searchParams.append('type', 'query')
  } else {
    url.searchParams.append('type', 'queries')
  }

  if (startDate.value !== undefined)
    url.searchParams.append('startDate', startDate.value)
  if (endDate.value !== undefined)
    url.searchParams.append('endDate', endDate.value)

  isLoading.value = true
  const res = await fetch(url.toString())
  isLoading.value = false
  if (res.status === 400) return
  const data = await res.json()
  if (data === undefined) return
  queryData.value = data
}

watch(query, async () => await fetchQueryData(), { immediate: true })
</script>

<template>
  <div class="kvass-google-search-console-querytable__container">
    <h3>{{ t('adjustSearch') }}</h3>
    <div class="kvass-google-search-console-querytable__wrapper">
      <div class="kvass-google-search-console-querytable">
        <Flex>
          <FormControl
            class="kvass-google-search-console-querytable__query"
            :label="t('queryInfo')"
            ><Input
              type="text"
              v-model="query"
              :placeholder="t('queryPlaceholder')"
              ><template #prefix>
                <Icon icon="fa-pro-light:magnifying-glass"></Icon>
              </template>
            </Input>
          </FormControl>
          <Flex>
            <FormControl :label="t('startDateQuery')"
              ><Input type="date" v-model="startDate" placeholder="Velg" />
            </FormControl>
            <FormControl :label="t('endDateQuery')"
              ><Input type="date" v-model="endDate" />
            </FormControl>
          </Flex>
          <Spinner v-if="isLoading" size="small" />
        </Flex>
        <FormControl
          v-if="queryData.length > 0"
          class="kvass-google-search-console-querytable__table"
        >
          <DataTable :columns="columns" :items="queryData">
            <template #query="{ item }">{{ item.query }}</template>
            <template #clicks="{ item }">{{ item.clicks }}</template>
            <template #impressions="{ item }">{{ item.impressions }}</template>
            <template #ctr="{ item }">{{ item.ctr }}</template>
            <template #position="{ item }">{{ item.position }}</template>
          </DataTable>
        </FormControl>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');
.kvass-google-search-console-querytable {
  &__container {
    font-family: 'Lato';
    padding: 10px 30px 30px;
  }

  &__wrapper {
    color: var(--kvass-google-search-console-querytable-color, inherit);
    font-size: var(--kvass-google-search-console-querytable-font-size, inherit);
    font-family: var(
      --kvass-google-search-console-querytable-font-family,
      'Lato'
    );
  }

  // Default variables
  --__kvass-google-search-console-querytable-background-color: #f8f8f8;
  --__kvass-google-search-console-querytable-max-width: 100%;
  --__kvass-google-search-console-querytable-size: 25vw;
  --__kvass-google-search-console-querytable-size-min: 400px;
  --__kvass-google-search-console-querytable-size-max: 800px;
  --__kvass-google-search-console-querytable-border: 1px solid #c9c9c9;
  --__kvass-google-search-console-querytable-height: 100%;

  background-color: var(
    --kvass-google-search-console-querytable-background-color,
    var(--__kvass-google-search-console-querytable-background-color)
  );
  max-width: var(
    --kvass-google-search-console-querytable-max-width,
    var(--__kvass-google-search-console-querytable-max-width)
  );
  margin-top: 0.5rem;

  height: var(
    --kvass-google-search-console-querytable-height,
    var(--__kvass-google-search-console-querytable-height)
  );

  border: var(
    --kvass-google-search-console-querytable-border,
    var(--__kvass-google-search-console-querytable-border)
  );

  border-radius: var(
    --kvass-google-search-console-querytable-border-radius,
    10px
  );
  padding: 2rem;

  h2 {
    margin-bottom: 1rem;
  }

  &__query {
    margin-right: auto;
    flex-grow: 1;
    .k-input {
      width: clamp(250px, 100%, 500px);
      line-height: 2;
      &__prefix {
        background-color: white;
        color: #272727;
      }
    }
  }

  &__table {
    --k-grid-item-area: table;
    --k-datatable-odd-color: white;

    background-color: #f8f8f8;
    border-radius: var(--k-ui-rounding);
  }
  .k-formcontrol {
    align-items: start;
  }
  .k-flex {
    margin-bottom: 1rem;
    align-items: center;
  }
}
</style>
