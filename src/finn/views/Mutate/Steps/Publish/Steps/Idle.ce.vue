<script setup lang="ts">
import { Card, Alert, Button, Icon } from '@kvass/ui'

import { type Ad } from '../../../../../types/ad'

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

const emit = defineEmits<{
  (event: 'publish', payload: void): void
}>()
</script>

<template>
  <Card
    class="publish"
    appearence="border"
    variant="default"
    title="Forhåndsvis annonsen og publiser!"
    subtitle="Her kan du se annonsen din, om du er fornøyd med resultatet kan du aktivere annonsen på Finn!"
    thumbnail="https://assets.kvass.no/67aa2b433aee3cb55c8e7408"
  >
    <template #default>
      <Alert
        icon="fa-pro-regular:exclamation-triangle"
        variant="info"
        title="Ved publisering aktiveres en betalt tjeneste fra Finn."
        content="Når du aktiverer annonsen vil du nå motta faktura og kostnader fra Finn. Bindingstiden varierer i henhold til din avtale med Finn"
      >
      </Alert>
    </template>
    <template #actions>
      <Button
        :disabled="!Boolean(modelValue.url)"
        label="Forhåndsvis annonse"
        iconRight="fa-pro-light:arrow-up-right-from-square"
        target="_blank"
        is="a"
        :href="modelValue.url"
      />

      <Button
        label="Publiser annonse"
        variant="primary"
        iconRight="fa-pro-light:arrow-right-long"
        @click="() => $emit('publish')"
      />
    </template>
  </Card>
</template>

<style lang="scss">
.publish {
  margin: 0 auto;
  min-width: 600px;
}
</style>
