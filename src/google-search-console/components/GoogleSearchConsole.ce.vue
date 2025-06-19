<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex } from '@kvass/ui'

const props = defineProps({
  integration_id: String,
})
</script>

<template>
  <DataChart :integration_id="props.integration_id" />
  <QueryTable :integration_id="props.integration_id" />
</template>
