<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import {
  FormControl,
  Input,
  Switch,
  Alert,
  Flex,
  Button,
  Card,
  File,
  RadioGroup,
  Stepper,
  type StepperStep,
} from '@kvass/ui'

import type { Order } from '../types'
import OrderImage from './OrderImage.ce.vue'

import Service from './Service.ce.vue'

import Orders from './Orders.ce.vue'

import Pricing from './Pricing.ce.vue'

import IdleStep from './Steps/Idle.ce.vue'
import OrderImageStep from './Steps/OrderImage.ce.vue'
import UploadFilesStep from './Steps/UploadFiles.ce.vue'
import ServicesStep from './Steps/Services.ce.vue'
import SummaryStep from './Steps/Summary.ce.vue'
import ConfirmationStep from './Steps/Confirmation.ce.vue'

import { Services as servicesItems, DefaultLabels } from '../enums'

import { setValidatorLangauge } from '../composeable/Validator'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../keys'

import type { Props } from '../types'

import Validator from '../composeable/Validator'
import { vTooltip } from 'floating-vue'
import Tooltip from './Tooltip.ce.vue'

const props = withDefaults(defineProps<Props>(), {
  labels: '{}',
  locale: 'nb-NO',
  currency: 'NOK',
  validatorLanguage: 'nb',
  callbackUrl: 'https://local.kvass.test/api/file/test',
})

setValidatorLangauge(props.validatorLanguage)

const order = ref<Order>({
  images: [],
  files: [],
  // modeling: false,
  services: servicesItems.map((v) => {
    return {
      id: v.id,
      selected: false,
      comment: '',
    }
  }),
})

const parsedLabels = computed(() => {
  try {
    return JSON.parse(props.labels)
  } catch (err) {
    return {}
  }
})

const getLabel = (key: string): string => {
  return parsedLabels.value[key] || DefaultLabels[key]
}

const root = ref<ShadowRoot | null>(null)

provide(GetLabelInjectionKey, getLabel)
provide(
  RootNodeInjectionKey,
  computed(() => root),
)

const promise = ref()

const orderImageKey = ref(0)

const submit = () => {
  console.log('subit called')
  return
  const { files, images, services } = order.value

  const formData = new FormData()

  files.forEach((element) => {
    formData.append('files', element)
  })

  images.forEach((element) => {
    formData.append('images', JSON.stringify(element))
  })

  services.forEach((element) => {
    if (!element.selected) return
    formData.append('services', JSON.stringify(element))
  })

  promise.value = fetch(props.callbackUrl, {
    method: 'POST',
    body: formData,
  })
    .then((data) => {
      console.log('Data uploaded successfully:', data)
    })
    .catch((error) => {
      console.error('Error uploading data:', error)
    })
}

const upload = (
  file: any,
  onProgress: (val: number) => void,
  options: unknown,
) => {
  return Promise.resolve(file)
}

const rules = computed(() => {
  const base = {
    images: 'min:1',
    files: ['required', 'min:1'],
  }

  return base
})

const labels = computed(() => {
  return {
    files: getLabel('files'),
    images: getLabel('3dImages'),
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: order,
})

const { bind: validate } = validator

const steps = computed((): StepperStep[] => {
  return [
    {
      id: 'idle',
      component: IdleStep,
      bind: {
        modelValue: order.value,
      },
    },
    {
      id: 'order',
      component: OrderImageStep,
      bind: {
        modelValue: order.value,
      },
    },
    {
      id: 'upload',
      component: UploadFilesStep,
      bind: {
        modelValue: order.value,
      },
    },
    {
      id: 'services',
      component: ServicesStep,
      bind: {
        modelValue: order.value,
      },
    },
    {
      id: 'summary',
      component: SummaryStep,
      bind: {
        modelValue: order.value,
        onSubmit: () => {
          submit()
        },
      },
    },
    {
      id: 'confirmation',
      component: ConfirmationStep,
      bind: {
        modelValue: order.value,
      },
    },
  ]
})
</script>

<template>
  <div ref="root" class="kvass-visualization-order-form">
    <Stepper
      :steps="steps"
      state-handler="sessionStorage"
      stateKey="k-visualization-order-form-step"
      ref="stepper"
      :hidebreadcrumbs="true"
    >
    </Stepper>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-visualization-order-form {
  max-width: 650px;
  margin: 0 auto;

  --k-dialog-max-width: 80ch;
  --k-dialog-min-width: min(
    80ch,
    calc(100% - var(--k-dialog-card-margin-mobile, var(--k-ui-spacing-sm)))
  );

  .k-card__subtitle {
    white-space: break-spaces;
  }

  // --k-card-spacing: 1.75rem;

  .k-file-droparea {
    padding: 3rem 1rem;
  }

  .k-dialog__backdrop,
  .k-dialog__container {
    z-index: 1;
    text-align: left;
  }

  .v-popper {
    cursor: help;
    display: inline;
    vertical-align: middle;

    &__inner {
      padding: var(--k-ui-spacing-sm);
    }

    &__popper {
      font-size: 1rem;
      font-weight: normal;
      word-break: break-word;
      white-space: pre-wrap;
      max-width: 300px;
      line-height: 1.4;
    }

    &__icon {
      width: 1em;
      height: 1em;
      padding: 0.2rem;
      border-radius: var(--k-ui-rounding-full);
      font-size: var(--k-ui-font-size-sm);
      color: white;
      background: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>
