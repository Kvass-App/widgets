<script setup lang="ts">
import { inject } from 'vue'
import { Button, Card } from '@kvass/ui'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../../keys'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!

const props = defineProps<{
  onNext: any
  onPrev: any
}>()
</script>

<template>
  <Card
    class="idle"
    is="form"
    :title="getLabel('idleTitle')"
    :subtitle="getLabel('idleSubtitle')"
    thumbnail="https://cms.kvass.no/media/Nyborgveien_Eksteri%C3%83%C2%B8r_final_small.png"
  >
    <template #default>
      <span class="idle__description">
        {{ getLabel('idleDescription') }}
      </span>
    </template>
    <template #actions>
      <Button @click="onNext" :label="getLabel('startOrder')" />
    </template>
  </Card>
</template>

<style lang="scss">
.idle {
  &__description {
    line-height: 160%;
  }

  .k-card__subtitle {
    font-weight: bold;
  }
}
</style>
