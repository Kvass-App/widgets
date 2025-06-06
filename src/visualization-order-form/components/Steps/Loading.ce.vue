<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
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

const isError = ref(false)

const modelValue = defineModel<Order>({ default: {} })

const submit = () => {
  const { files, images, services, lead } = modelValue.value

  const formData = new FormData()

  const mergedFiles = [...files.shared, ...files.model, ...files.drone]

  mergedFiles.forEach((file) => {
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
  formData.append('metadata', JSON.stringify({ hasModel: files.hasModel }))

  fetch(rootProps.callbackUrl, {
    method: 'POST',
    body: formData,
  })
    .then((res) => {
      if (!res.ok) throw res
      console.log('Data uploaded successfully:', res)
      props.onNext()
    })
    .catch((error) => {
      isError.value = true
      console.error('Error uploading data:', error)
    })
}

onMounted(submit)
</script>

<template>
  <Card class="loading" is="form">
    <template #header v-if="isError">
      <Icon icon="fa-pro-solid:circle-exclamation" class="loading__icon" />

      <div class="k-card__title">{{ getLabel('somethingWentWrong') }}</div>
      <div class="k-card__subtitle">{{ getLabel('contactSupport') }}</div>
    </template>
    <template #header v-else>
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

  &__icon {
    font-size: 3rem;
    color: var(--k-ui-color-danger);
    margin-bottom: 1rem;
  }

  .k-card__header {
    align-items: center;
  }
}
</style>
