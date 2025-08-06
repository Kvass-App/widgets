<script setup>
import DataChart from './DataChart.ce.vue'
import QueryTable from './QueryTable.ce.vue'
import { Flex, Alert, Icon, Button } from '@kvass/ui'
import { getLabel as getLabelFactory } from '../../utils/index.js'
import { ref } from 'vue'

const props = defineProps({
  integration_id: {
    type: String,
    required: true,
  },
  app_url: {
    type: String,
    required: true,
  },
  page_url: {
    type: String,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const t = getLabelFactory(props.labels, {
  /* integrationGSCDashboardDescription:
    'Her får du en oversikt over status på ditt prosjekt',
  noData:
    'Kan ikke presentere tall. Det foreligger ingen eksisterende data å vise på nåværende tidspunkt',
  gotoItem: 'Gå til {0}', */
})

const noInteractionData = ref(false)
const noQueryData = ref(false)

function isInteractionData(e) {
  noInteractionData.value = e
}

function isQueryData(e) {
  noQueryData.value = e.length === 0
}
</script>

<template>
  <Alert v-if="noInteractionData && noQueryData" variant="warning">{{
    t('noData')
  }}</Alert>
  <div style="background-color: white; border-radius: 10px; max-width: 2000px">
    <div class="cont">
      <Flex direction="column">
        <h2>Google Search Console</h2>
        <p>{{ t('integrationGSCDashboardDescription') }}</p>
      </Flex>

      <Button
        is="a"
        variant="primary"
        target="_blank"
        :href="`https://search.google.com/search-console?resource_id=${encodeURIComponent(
          props.page_url,
        )}`"
        >{{ t('gotoItem') }}<Icon icon="fa-pro-light:external-link"
      /></Button>
    </div>

    <DataChart
      :app_url="props.app_url"
      :integration_id="props.integration_id"
      :labels="props.labels"
      @fetchInteractionData="isInteractionData"
    />
    <QueryTable
      :app_url="props.app_url"
      :integration_id="props.integration_id"
      :labels="props.labels"
      @fetchQueryData="isQueryData"
    />
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-alert {
  margin-bottom: 30px;
  font-size: 16px;
}

.cont {
  padding: 30px;
  margin: 0;
  gap: 14px;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  border-bottom: 2px solid #eaeaea;

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

  .k-button {
    display: flex;
    justify-content: center;
    margin-left: auto;
    background-color: var(--k-button-primary-background, #102b37);
  }
}
</style>
