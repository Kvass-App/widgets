<script setup lang="ts">
import { ref, computed } from 'vue'
import { Stepper, type StepperStep } from '@kvass/ui'

import { type Ad } from '../../../../types/ad'

import { useAPI } from '../../../../api'

import StepIdle from './Steps/Idle.ce.vue'
import StepLoading from './Steps/Loading.ce.vue'
import StepError from './Steps/Error.ce.vue'
import StepSuccess from './Steps/Success.ce.vue'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const modelValue = defineModel<Ad>({ default: {} })

const message = ref('')

const stepper = ref()

const steps = computed<StepperStep[]>(() => {
  return [
    {
      id: 'idle',
      component: StepIdle,
      bind: {
        onPublish: () => publish(),
        modelValue: modelValue.value,
      },
    },
    {
      id: 'loading',
      component: StepLoading,
      bind: {
        modelValue: modelValue.value,
      },
    },
    {
      id: 'error',
      component: StepError,
      bind: {
        modelValue: modelValue.value,
      },
    },
    {
      id: 'success',
      component: StepSuccess,
      bind: {
        onNavigate: (step) => API.navigateView(step),
        modelValue: modelValue.value,
      },
    },
  ]
})

const publish = () => {
  stepper.value.goto('loading')

  API.publish(modelValue.value, { preview: false })
    .then((response) => {
      response.on('message', (data) => {
        message.value = data.message
      })

      response.on('error', (data) => {
        stepper.value.goto('error')
      })

      response.on('finished', () => {
        response.cancel()

        if (stepper.value.meta.current === 'error') return

        stepper.value.goto('success')
      })
    })
    .catch((err) => {})
}
</script>

<template>
  <Stepper
    ref="stepper"
    :steps="steps"
    state-handler="none"
    class="publish"
    :hidebreadcrumbs="true"
  >
  </Stepper>
</template>

<style lang="scss">
.publish {
}
</style>
