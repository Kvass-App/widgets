<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex } from '@kvass/ui'
const integration = '6853cc47161936c4e6dc832a'
</script>

<template>
  <DataChart :integration="integration" />
  <QueryTable :integration="integration" />
</template>
