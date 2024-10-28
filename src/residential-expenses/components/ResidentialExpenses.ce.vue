<script setup>
import { ref, computed, watch } from 'vue'
import { PropEnumValidator } from '../../utils/index.js'
import {
  Slider,
  FormControl,
  Input,
  Switch,
  Alert,
  Icon,
  Flex,
} from '@kvass/ui'

const defaultLabels = {
  price: 'Totalpris',
  partOwnership: 'Deleie',
  partOwnershipValueLabel: 'Pris Deleie',
  partOwnershipDescription: '',
  partOwnershipLinkLabel: 'Les mer',
  partOwnershipLink: '',
  partOwnershipAnswerNo: 'Ja, jeg ønsker deleie',
  partOwnershipAnswerYes: 'Nei, jeg ønsker ikke deleie',
  partOwnershipAnswerLabel: 'Ønsket eierskap',
  adjustDeposit: 'Tilpass innskudd',
  deposit: 'Innskudd',
  jointDept: 'Fellesgjeld',
  jointDeptInterest: 'Renter fellesgjeld',
  monthlyCosts: 'Månedlige utgifter',
  operatingCosts: 'Driftskostnader',
  total: 'Totalt',
}

const props = defineProps({
  title: String,
  price: Number,
  jointDeptType: {
    type: String,
    default: 'percent',
    ...PropEnumValidator(['fixed', 'percent']),
  },
  jointDept: Number,
  jointDeptInterestRate: Number,
  operatingCosts: Number,
  partOwnershipEnabled: Boolean,
  partOwnershipDiscount: Number,
  partOwnershipHiddenElements: String,
  labels: {
    type: Object,
    default: () => ({}),
  },
  locale: {
    type: String,
    default: 'nb-NO',
  },
  currency: {
    type: String,
    default: 'NOK',
  },
})

const root = ref(null)
const partOwnershipState = ref(false)

const convert = (value, type, base) => {
  switch (type) {
    case 'percent':
      return base * (value / 100)
    case 'fixed':
      return value
  }
}

const currency = (val) => {
  return new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency,
    maximumFractionDigits: 0,
  }).format(val)
}

const currencyShorter = (val) => {
  return Intl.NumberFormat(props.locale, { notation: 'compact' }).format(val)
}

const partOwnership = ref(50)
const defaultJointDept = convert(
  props.jointDept,
  props.jointDeptType,
  props.price,
)
const total = computed(() => props.price + defaultJointDept)
const defaultDeposit = total.value - defaultJointDept
const deposit = ref(defaultDeposit)
const depositInput = ref(defaultDeposit)

const depositMarkers = computed(() => {
  const step = 1000000
  const count = Math.floor(defaultJointDept / step)
  const stepStart = Math.floor(defaultDeposit / step) * step

  return [
    defaultDeposit,
    ...Array(count)
      .fill(undefined)
      .map((v, i) => stepStart + step * (i + 1)),
    total.value,
  ]
})

const partOwnershipDeposit = computed(() => {
  const discount = total * ((props.partOwnershipDiscount || 0) / 100)
  return (defaultDeposit - discount) * (partOwnership.value / 100)
})

const jointDept = computed(
  () => defaultJointDept - (deposit.value - defaultDeposit),
)
const jointDeptInterestCost = computed(
  () => (jointDept.value * (props.jointDeptInterestRate / 100)) / 12,
)
const monthlyCosts = computed(
  () => jointDeptInterestCost.value + props.operatingCosts,
)

const depositInputProps = computed(() => {
  const mapperRE = /(.{1})\d{3}(\D)\d$/
  const formattedValue = new Intl.NumberFormat(props.locale).format(1000.1)

  let [_, thousand, decimal] = mapperRE.exec(formattedValue)

  const data = currency(props.price)
  const symbol = data.replace(/[\d\s\,\.]/g, '')
  const mask = { mask: Number, thousandsSeparator: thousand }

  if (data.match(/^\d/)) return { suffix: symbol, mask }
  return { prefix: symbol, mask }
})

watch(deposit, (val) => (depositInput.value = val))

const onDepositInputBlur = () => {
  depositInput.value = Math.min(
    props.price,
    Math.max(defaultDeposit, depositInput.value),
  )
  deposit.value = depositInput.value
}

const isVisible = (key) => {
  const partOwnershipHiddenElements = (props.partOwnershipHiddenElements || '')
    .split(',')
    .map((e) => e.trim())
  const hiddenElements = []

  if (partOwnershipState.value)
    hiddenElements.push(...partOwnershipHiddenElements)

  return !hiddenElements.includes(key)
}

const getRootNode = () => {
  return root.value.getRootNode()
}

const parseLabels = () => {
  try {
    return JSON.parse(props.labels)
  } catch (err) {
    return {}
  }
}

const getLabel = (key) => {
  return parseLabels(props.labels)[key] || defaultLabels[key]
}
</script>

<template>
  <div class="kvass-residential-expenses" ref="root">
    <h1 v-if="title">{{ title }}</h1>

    <table v-if="isVisible('price')" data-field="price">
      <tr>
        <td>{{ getLabel('price') }}</td>
        <td>
          {{ currency(total) }}
        </td>
      </tr>
    </table>

    <Alert v-if="partOwnershipEnabled">
      <Flex justify="space-between">
        <b>{{ getLabel('partOwnership') }}</b>
        <Switch
          v-model="partOwnershipState"
          :labels="{
            off: getLabel('partOwnershipAnswerNo'),
            on: getLabel('partOwnershipAnswerYes'),
          }"
        />
      </Flex>
      <p v-if="partOwnershipState && getLabel('partOwnershipDescription')">
        <span v-html="getLabel('partOwnershipDescription')"></span>
        <a
          v-if="getLabel('partOwnershipLink')"
          :href="getLabel('partOwnershipLink')"
          target="_blank"
          >{{ getLabel('partOwnershipLinkLabel') }}
          <Icon icon="fa-pro-light:arrow-up-right-from-square"
        /></a>
      </p>

      <FormControl
        v-if="partOwnershipState"
        :label="getLabel('partOwnershipLabel')"
        data-field="partOwnership"
      >
        <Slider
          v-model="partOwnership"
          :min="10"
          :max="90"
          :step="10"
          :marker="10"
          :marker-highlight="true"
          :format="(v) => `${v} %`"
          :getRootNode="getRootNode"
          class="k-mt-lg k-px"
        />
      </FormControl>
    </Alert>

    <Alert v-if="!partOwnershipState" data-field="deposit">
      <b>{{ getLabel('adjustDeposit') }}</b>
      <Slider
        v-model="deposit"
        :min="defaultDeposit"
        :max="total"
        :step="1000"
        :marker="depositMarkers"
        :marker-highlight="true"
        :format="currency"
        :marker-format="currencyShorter"
        :getRootNode="getRootNode"
        class="k-mt-lg k-px-lg"
      />
    </Alert>

    <table>
      <tr v-if="isVisible('deposit')">
        <td>{{ getLabel('deposit') }}</td>
        <td>
          <Input
            v-model="depositInput"
            align="right"
            v-bind="depositInputProps"
            data-field="deposit-input"
            @blur="onDepositInputBlur"
          />
        </td>
      </tr>
      <tr v-if="partOwnershipState">
        <td>{{ getLabel('partOwnershipValueLabel') }}</td>
        <td>
          <span data-field="value">{{ currency(partOwnershipDeposit) }}</span>
        </td>
      </tr>
      <tr v-if="isVisible('jointDept')">
        <td>{{ getLabel('jointDept') }}</td>
        <td>
          <span data-field="value">{{ currency(jointDept) }}</span>
        </td>
      </tr>
    </table>

    <table v-if="isVisible('monthlyCosts')">
      <thead>
        <tr>
          <th>{{ getLabel('monthlyCosts') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ getLabel('jointDeptInterest') }}</td>
          <td>
            <span data-field="value">{{
              currency(jointDeptInterestCost)
            }}</span>
          </td>
        </tr>
        <tr v-if="operatingCosts">
          <td>{{ getLabel('operatingCosts') }}</td>
          <td>
            <span data-field="value">{{ currency(operatingCosts) }}</span>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>{{ getLabel('total') }}</td>
          <td>
            <span data-field="value">{{ currency(monthlyCosts) }}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-residential-expenses {
  --white: rgba(255, 255, 255, 0.5);
  --k-alert-neutral-background: var(--white);

  --k-ui-color-primary: var(--secondary);

  display: flex;
  flex-direction: column;

  gap: var(--k-ui-spacing-lg);

  h1 {
    margin: 0;
    font-size: var(--kvass-residential-expenses-title-font-size, 2.7rem);
  }

  [data-field='price'] {
    font-size: 1.5em;
  }

  [data-field='deposit-input'] {
    display: flex;
    justify-content: flex-end;

    .k-input {
      width: 15ch;
    }
  }

  p span p {
    display: inline;
  }

  p a {
    margin-left: 0.25em;
  }

  table {
    border-collapse: collapse;

    --hf-spacing: var(--k-ui-spacing-xxs);

    th {
      border-bottom: 1px solid var(--k-ui-color-neutral);
      padding-bottom: var(--hf-spacing);

      &:first-child {
        text-align: left;
      }
    }

    tbody tr:first-child td {
      padding-top: var(--hf-spacing);
    }

    tbody tr:last-child td {
      padding-bottom: var(--hf-spacing);
    }

    td {
      padding-block: calc(var(--hf-spacing) / 4);

      &:last-child {
        text-align: right;
      }
    }

    tfoot td {
      padding-top: var(--hf-spacing);
      border-top: 1px solid var(--k-ui-color-neutral);

      font-weight: bold;
    }

    .k-input {
      --k-input-padding-y: 8px;
      font-size: 1em;
      background-color: var(--white);

      &__input {
        width: 0ch;
        padding-right: 0.25em;
        background-color: transparent;
      }

      &:has(.k-input__prefix) {
        padding-right: 0.5em;
      }

      &__suffix {
        background-color: transparent;
        color: inherit;
        padding-left: 0;
      }

      &__prefix {
        background-color: transparent;
        color: inherit;
        padding-right: 0;
      }
    }
  }

  [data-state='at-value'] {
    z-index: 1;
  }

  [data-field='value'] {
    padding-right: 13px;
  }

  [data-field='partOwnership'] {
    margin-top: var(--k-ui-spacing-xl);

    .k-formcontrol__label {
      font-weight: bold;
    }

    .k-slider {
      margin-top: 0.5rem;
    }

    [data-part='value-text'] {
      display: none;
    }
  }

  .k-alert {
    line-height: 1.42;

    &[data-field='deposit'] {
      background-color: transparent;
    }

    a {
      text-decoration: none;
    }

    p {
      margin-top: 0.5em;
    }
  }
}
</style>
