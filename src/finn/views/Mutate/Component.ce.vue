<script setup lang="ts">
import { computed, ref, onMounted, inject } from 'vue'
import { Stepper, type StepperStep } from '@kvass/ui'

import StepType from './Steps/Type.ce.vue'
import StepAd from './Steps/Ad.ce.vue'
import StepPreview from './Steps/Preview.ce.vue'
import StepPublish from './Steps/Publish/Component.ce.vue'

import { type Webcomponent } from '../../types/webcomponent'
import { type Ad, Unit } from '../../types/ad'

import { PropsInjectionKey } from '../../keys'
import { useAPI } from '../../api'

import { useCurrentElement, useStorage } from '@vueuse/core'
// const element = useCurrentElement()

const API = useAPI()

const props = inject<Webcomponent>(PropsInjectionKey) as Webcomponent

const template: Ad = {
  name: '', // internt navn
  type: undefined, // bolignavn
  // enhetene som lager grunnlag for annonsen.
  units: [],
  fields: {
    // MEDIA: [],
    // PROJECT_NAME: [],
  },
  // url: undefined,
  // statistics: undefined,
  // preview: undefined,
  // createdAt: undefined,
  // publishedAt: undefined,
  // id: undefined,
}

const modelValue = ref<Ad>(structuredClone(template))

const units = ref<Unit[]>([])
const fetching = ref(false)

// const modelValue = useStorage(
//   props.id ? `kvass-finn-ad-${props.id}` : 'kvass-finn-ad',
//   structuredClone(template),
//   localStorage,
// )

const steps = computed<StepperStep[]>(() => {
  return [
    {
      id: 'type',
      component: StepType,
      bind: {
        modelValue: modelValue.value,
        units: units.value,
      },
    },
    {
      id: 'ad',
      component: StepAd,
      bind: {
        modelValue: modelValue.value,
        units: units.value,
      },
    },
    {
      id: 'preview',
      component: StepPreview,
      bind: {
        modelValue: modelValue.value,
        'onUpdate:modelValue': (v: Ad) => {
          modelValue.value = v
        },
        units: units.value,
      },
    },
    {
      id: 'publish',
      component: StepPublish,
      bind: {
        modelValue: modelValue.value,
        units: units.value,
      },
    },
  ]
})

const getData = async () => {
  try {
    fetching.value = true

    const [unitsData, adsData] = await Promise.all([
      API.getUnits(),
      props.id ? API.getAds(props.id) : Promise.resolve(null),
    ])

    units.value = unitsData.map((v) => {
      if (!adsData) return v

      const prev = adsData.units.find((u) => u.id === v.id)

      return {
        ...prev,
        ...v,
      }
    })
    if (adsData) modelValue.value = adsData
  } finally {
    fetching.value = false
  }
}

onMounted(getData)
</script>

<template>
  <Stepper
    :steps="steps"
    state-handler="none"
    class="finn-mutate"
    ref="stepper"
    :hidebreadcrumbs="true"
  >
  </Stepper>
</template>

<style lang="scss">
.finn-mutate {
}
</style>
