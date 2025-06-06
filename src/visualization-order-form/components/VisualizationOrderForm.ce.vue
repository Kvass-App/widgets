<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { Stepper, type StepperStep } from '@kvass/ui'

import type { Order } from '../types'

import IdleStep from './Steps/Idle.ce.vue'
import OrderImageStep from './Steps/OrderImage.ce.vue'
import UploadFilesStep from './Steps/UploadFiles.ce.vue'
import ServicesStep from './Steps/Services.ce.vue'
import SummaryStep from './Steps/Summary.ce.vue'
import ConfirmationStep from './Steps/Confirmation.ce.vue'
import LoadingStep from './Steps/Loading.ce.vue'

import { Services as servicesItems, DefaultLabels } from '../enums'

import { setValidatorLangauge } from '../composeable/Validator'

import {
  GetLabelInjectionKey,
  RootNodeInjectionKey,
  PropsInjectionKey,
} from '../keys'

import type { Props } from '../types'

const props = withDefaults(defineProps<Props>(), {
  labels: '{}',
  locale: 'nb-NO',
  currency: 'NOK',
  validatorLanguage: 'nb',
  callbackUrl: 'http://localhost:3001/api/visualization/form',
  lead: '{}',
})

setValidatorLangauge(props.validatorLanguage)

const order = ref<Order>({
  images: [],
  files: {
    hasModel: false,
    model: [],
    shared: [],
    drone: [],
  },
  lead: {
    name: '',
    phone: '',
    email: '',
    company: {
      name: '',
      organizationNumber: '',
    },
  },
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
provide(PropsInjectionKey, props)

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
      },
    },
    {
      id: 'loading',
      component: LoadingStep,
      bind: {
        modelValue: order.value,
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
      state-handler="none"
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
    60ch,
    calc(100% - var(--k-dialog-card-margin-mobile, var(--k-ui-spacing-sm)))
  );

  --k-ui-color-primary: var(--primary, blue);
  --k-ui-color-primary-dark: var(--primary-dark, darkBlue);
  --k-ui-color-primary-darkest: var(--primary-darkest, darkBlue);
  --k-ui-color-primary-light: var(--primary-light, lightBlue);
  --k-ui-color-primary-lightest: var(--primary-lightest, lightBlue);

  --k-card-background: #fafafa;

  --k-ui-color-neutral: #c9c9c9;
  --k-ui-color-neutral-dark: #939393;
  --k-ui-color-neutral-darkest: #272727;
  --k-ui-color-neutral-light: #eaeaea;
  --k-ui-color-neutral-lightest: #f8f8f8;

  .k-card__subtitle {
    white-space: break-spaces;
  }

  .k-file-droparea {
    padding: 3rem 1rem;
  }

  .k-dialog__backdrop,
  .k-dialog__container {
    z-index: 1010;
    text-align: left;
  }

  --k-dropdown-z-index: 1009;

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
