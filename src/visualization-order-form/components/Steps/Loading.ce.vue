<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { Card, Icon, Spinner } from '@kvass/ui'

import {
  GetLabelInjectionKey,
  RootNodeInjectionKey,
  PropsInjectionKey,
} from '../../keys'

import { type Order } from '../../types'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!
const rootProps = inject(PropsInjectionKey)!

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Order>({ default: {} })

const submit = () => {
  const { files, images, services, lead } = modelValue.value

  const formData = new FormData()

  files.shared.forEach((file) => {
    formData.append('files', file)
  })
  files.model.forEach((file) => {
    formData.append('files', file)
  })
  files.model.forEach((file) => {
    formData.append('files', file)
  })

  images.forEach((element) => {
    formData.append('images', JSON.stringify(element))
  })

  services.forEach((element) => {
    if (!element.selected) return
    formData.append('services', JSON.stringify(element))
  })

  formData.append('lead', JSON.stringify(lead))
  formData.append(
    'metadata',
    JSON.stringify({ hasModel: files.hasModel, hasDrone: files.hasDrone }),
  )

  fetch(rootProps.callbackUrl, {
    method: 'POST',
    body: formData,
  })
    .then((data) => {
      console.log('Data uploaded successfully:', data)
      props.onNext()
    })
    .catch((error) => {
      console.error('Error uploading data:', error)
    })
}

onMounted(submit)
</script>

<template>
  <Card class="loading" is="form">
    <template #header>
      <Spinner size="large" class="k-mb-lg loading__spinner"></Spinner>

      <div class="k-card__title">{{ getLabel('loadingTitle') }}</div>
      <div class="k-card__subtitle">{{ getLabel('loadingSubtitle') }}</div>
    </template>
  </Card>
</template>

<style lang="scss">
.loading {
  &__spinner {
    // color: var(--k-ui-color-primary);
  }

  .k-card__header {
    align-items: center;
  }
}
</style>
