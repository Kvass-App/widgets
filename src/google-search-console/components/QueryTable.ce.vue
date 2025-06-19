<script setup>
import { ref, onMounted, watch } from 'vue'
import { DataTable, Input, Flex, FormControl, Alert } from '@kvass/ui'
const query = ref('')
const columns = ref([
  {
    id: 'clicks',
    label: 'Klikk',
  },
  {
    id: 'impressions',
    label: 'Visninger',
  },
  {
    id: 'ctr',
    label: 'Klikkfrekvens',
  },
  {
    id: 'position',
    label: 'Posisjon',
  },
])
const queryData = ref([])
const startDate = ref()
const endDate = ref()

async function fetchQueryData() {
  const url = new URL(
    `https://local.kvass.test/api/integration/685258896549edb201d797b5/callbacks/gscData`,
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

  const res = await fetch(url.toString())
  if (res.status === 404) return
  const data = await res.json()
  if (data === undefined) return
  queryData.value = data
}

onMounted(async () => await fetchQueryData())

watch(query, async () => await fetchQueryData())
</script>

<template>
  <div class="kvass-google-search-console-querytable__wrapper">
    <div class="kvass-google-search-console-querytable">
      <h2>Populære søk</h2>
      <Flex>
        <FormControl label="Query"
          ><Input type="text" v-model="query" />
        </FormControl>
        <FormControl label="Startdato"
          ><Input type="date" v-model="startDate" />
        </FormControl>
        <FormControl label="Sluttdato"
          ><Input type="date" v-model="endDate" />
        </FormControl>
      </Flex>
      <FormControl
        v-if="queryData.length > 0"
        class="kvass-google-search-console-querytable__table"
      >
        <DataTable :columns="columns" :items="queryData">
          <template #clicks="{ item }">{{ item.clicks }}</template>
          <template #impressions="{ item }">{{ item.impressions }}</template>
          <template #ctr="{ item }">{{ item.ctr }}</template>
          <template #position="{ item }">{{ item.position }}</template>
        </DataTable>
      </FormControl>
      <Alert v-else variant="warning">Ingen data tilgjengelig</Alert>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');
.kvass-google-search-console-querytable {
  &__wrapper {
    color: var(--kvass-google-search-console-querytable-color, inherit);
    font-size: var(--kvass-google-search-console-querytable-font-size, inherit);
    font-family: var(
      --kvass-google-search-console-querytable-font-family,
      inherit
    );
  }

  // Default variables
  --__kvass-google-search-console-querytable-background-color: whitesmoke;
  --__kvass-google-search-console-querytable-max-width: 100%;
  --__kvass-google-search-console-querytable-size: 25vw;
  --__kvass-google-search-console-querytable-size-min: 400px;
  --__kvass-google-search-console-querytable-size-max: 800px;
  --__kvass-google-search-console-querytable-border: 1px solid #eaeaea;
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
    3px
  );
  padding: 2rem;

  h2 {
    margin-bottom: 1rem;
  }
  &__table {
    --k-grid-item-area: table;
    --k-datatable-odd-color: white;

    padding: 1rem;
    background-color: whitesmoke;
    border-radius: var(--k-ui-rounding);
  }
  .k-formcontrol {
    align-items: start;
  }
  .k-flex {
    margin-bottom: 1rem;
  }
  .k-flex > * {
    flex-grow: 1;
  }
}
</style>
