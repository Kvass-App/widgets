<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex } from '@kvass/ui'

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
</script>

<template>
  <DataChart
    :app_url="props.app_url"
    :integration_id="props.integration_id"
    :labels="props.labels"
  />
  <QueryTable
    :app_url="props.app_url"
    :integration_id="props.integration_id"
    :labels="props.labels"
  />
</template>
