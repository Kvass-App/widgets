<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex } from '@kvass/ui'
import { getLabel as getLabelFactory } from '../../utils/index.js'
import WebFont from 'webfontloader'

WebFont.load({
  google: {
    families: ['Lato'],
  },
})

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
  description: 'Her får du en oversikt over status på ditt prosjekt',
})
</script>

<template>
  <div style="background-color: white; border-radius: 10px; max-width: 2000px">
    <div class="cont">
      <h2>Google Search Console</h2>
      <p>{{ t('description') }}</p>
    </div>
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
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');
.cont {
  font-family: 'Lato';
  h2 {
    margin: 0;
    font-size: 24px;
    line-height: 120%;
  }

  p {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
    line-height: 160%;
  }

  padding: 30px;
  margin: 0;
  gap: 14px;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 2px solid #eaeaea;
}
</style>
