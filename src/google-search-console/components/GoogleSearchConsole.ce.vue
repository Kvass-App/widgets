<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex } from '@kvass/ui'

const props = defineProps({
  integration_id: String,
  app_url: String,
})
</script>

<template>
  <DataChart :app_url="props.app_url" :integration_id="props.integration_id" />
  <QueryTable :app_url="props.app_url" :integration_id="props.integration_id" />
</template>
