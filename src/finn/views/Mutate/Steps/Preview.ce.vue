<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { Card } from '@kvass/ui'
import Error from './Publish/Steps/Error.ce.vue'

import { LottieAnimation } from 'lottie-web-vue'
import PageAnimation from '../../../animations/page.json'

import { type Ad } from '../../../types/ad'
import { type Webcomponent } from '../../../types/webcomponent'

import { PropsInjectionKey } from '../../../keys'
import { useAPI } from '../../../api'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const webcomponentProps = inject<Webcomponent>(
  PropsInjectionKey,
) as Webcomponent

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

// const emit = defineEmits<{
//   (event: 'update:modelValue', value: Ad): void
// }>()

const error = ref(false)
const message = ref('Vent litt...')

const publish = () => {
  API.publish(modelValue.value, { preview: true })
    .then((response) => {
      response.on('message', (data) => {
        if (data.message) message.value = data.message

        if (data.id) {
          modelValue.value.id = data.id
        }
      })

      response.on('error', (data) => {
        error.value = true
      })

      response.on('finished', async () => {
        response.cancel()

        if (!error.value) {
          modelValue.value = await API.getAds(modelValue.value.id)

          props.onNext()
        }
      })
    })
    .catch((err) => {})
}

onMounted(() => {
  if (webcomponentProps.id) return props.onNext()
  publish()
})
</script>

<template>
  <Card
    v-if="!error"
    class="preview"
    appearence="border"
    variant="default"
    title="Vi bygger et forslag på Finn-annonsen din!"
    :subtitle="message"
  >
    <template #thumbnail>
      <LottieAnimation :animation-data="PageAnimation" auto-play loop />
    </template>
  </Card>

  <Error v-else :modelValue="modelValue" />
</template>

<style lang="scss">
.preview {
  margin: 0 auto;
  min-width: 600px;

  --k-card-border-color: #c9c9c9;

  .k-card__thumbnail {
    background-color: var(--k-ui-color-neutral-light);
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;

    & > div {
      width: 400px;
    }
  }
}
</style>
