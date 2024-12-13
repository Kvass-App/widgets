<script setup>
import { ref, computed, provide } from 'vue'
import {
  getLabel as getLabelFactory,
  format as formatFactory,
} from '../../utils/index.js'
import { Button } from '@kvass/ui'
import Slider from './Slider.vue'

const props = defineProps({
  logo: { type: String },
  equityPercentDefault: { type: Number, default: 0.3 },
  equityPercentMin: { type: Number, default: 0.15 },
  equityPercentMax: { type: Number, default: 0.8 },
  nominelInterestRateDefault: { type: Number, default: 4.5 },
  nominelInterestRateMin: { type: Number, default: 0 },
  nominelInterestRateMax: { type: Number, default: 10 },
  feeEstablishing: { type: Number, default: 0 },
  feeMonthly: { type: Number, default: 0 },
  repaymentPeriodDefault: { type: Number, default: 25 },
  repaymentPeriodMax: { type: Number, default: 30 },
  repaymentPeriodMin: { type: Number, default: 5 },
  purchasePriceFixed: { type: Boolean },
  purchasePrice: { type: Number, required: true },
  ctaLink: { type: Number },
  ctaLabel: { type: Number },
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

const t = getLabelFactory(props.labels, {
  purchasePrice: 'Kjøpesum',
  equity: 'Egenkapital',
  nominalInterestRate: 'Nominell rente',
  nominalInterestRateShort: 'nom. rente',
  effectiveInterestRateShort: 'eff. rente',
  repaymentPeriod: 'Nedbetalingstid',
  monthlyEstimate: 'Estimert pr. måned',
  loanAmount: 'Lånesum',
  cost: 'Kostnad',
  total: 'Totalt',
})

const currency = formatFactory('currency', {
  locale: props.locale,
  currency: props.currency,
})

const capitalize = (v) => v.charAt(0).toUpperCase() + v.substring(1)
const percent = formatFactory('percent', { maximumFractionDigits: 2 })
const years = formatFactory('year', { locale: props.locale })

const root = ref(null)

provide(
  'metadata',
  computed(() => ({ root, props })),
)

const purchasePriceInput = ref(props.purchasePrice)
const equity = ref(props.purchasePrice * props.equityPercentDefault)
const repaymentPeriod = ref(props.repaymentPeriodDefault)
const nominelInterestRate = ref(props.nominelInterestRateDefault)

const equityLimits = computed(() => ({
  min: Math.round(purchasePriceInput.value * props.equityPercentMin),
  max: Math.round(purchasePriceInput.value * props.equityPercentMax),
}))

const loanAmount = computed(() => purchasePriceInput.value - equity.value)
const monthlyCost = computed(() => {
  const nominalRatePerMonth = nominelInterestRate.value / 12 / 100
  const numberOfPayments = repaymentPeriod.value * 12

  // Calculate monthly installment using annuity formula
  return (
    (loanAmount.value *
      nominalRatePerMonth *
      Math.pow(1 + nominalRatePerMonth, numberOfPayments)) /
      (Math.pow(1 + nominalRatePerMonth, numberOfPayments) - 1) +
    props.feeMonthly
  )
})
const totalCost = computed(() => {
  const numberOfPayments = repaymentPeriod.value * 12
  return (
    monthlyCost.value * numberOfPayments +
    props.feeEstablishing -
    loanAmount.value
  )
})
const effectiveRate = computed(() => {
  const loan = loanAmount.value - props.feeEstablishing // Loan principal minus establishment fee
  const totalPeriods = repaymentPeriod.value * 12 // Total months
  const paymentPerMonth = monthlyCost.value // Monthly payment including fees

  // Solve for the monthly interest rate using annuity formula:
  const calculateMonthlyRate = () => {
    const A = paymentPerMonth // Monthly Payment
    const P = loan // Principal (Loan Amount)
    const n = totalPeriods // Number of Payments

    // Iteratively solve for r:
    let low = 0 // Lower bound for interest rate
    let high = 1 // Upper bound for interest rate (100% monthly, an absurd limit)
    let mid
    const tolerance = 0.0000001 // High precision tolerance

    while (high - low > tolerance) {
      mid = (low + high) / 2
      const estimate =
        (P * mid * Math.pow(1 + mid, n)) / (Math.pow(1 + mid, n) - 1)
      if (estimate > A) {
        high = mid
      } else {
        low = mid
      }
    }
    return mid // Solved monthly rate
  }

  const monthlyRate = calculateMonthlyRate() // Calculate monthly rate using binary search
  const effectiveAnnualRate = Math.pow(1 + monthlyRate, 12) - 1 // Convert to annual effective rate
  return effectiveAnnualRate * 100 // Return percentage
})

const onPurchasePriceInput = () => {
  if (
    equity.value <= equityLimits.value.max &&
    equity.value >= equityLimits.value.min
  )
    return
  equity.value = Math.min(
    equityLimits.value.max,
    Math.max(equityLimits.value.min, equity.value),
  )
}
</script>

<template>
  <div class="kvass-loan-calculator" ref="root">
    <img v-if="logo" :src="logo" />

    <Slider
      v-model="purchasePriceInput"
      @update:model-value="onPurchasePriceInput"
      :label="t('purchasePrice')"
      :min="Math.round(purchasePrice / 2)"
      :max="Math.round(purchasePrice * 2)"
      :disabled="purchasePriceFixed"
      format="currency"
    />
    <Slider
      v-model="equity"
      :label="t('equity')"
      :min="equityLimits.min"
      :max="equityLimits.max"
      format="currency"
    />
    <Slider
      :label="t('repaymentPeriod')"
      :min="Math.round(repaymentPeriodMin)"
      :max="Math.round(repaymentPeriodMax)"
      format="year"
      v-model="repaymentPeriod"
    />
    <Slider
      :label="t('nominalInterestRate')"
      :min="Math.round(nominelInterestRateMin)"
      :max="Math.round(nominelInterestRateMax)"
      :step="0.1"
      format="percent"
      v-model="nominelInterestRate"
    />

    <div data-part="costs">
      <div>{{ t('monthlyEstimate') }}</div>
      <div data-part="cost">{{ currency(monthlyCost) }}</div>
      <div>
        {{ percent(effectiveRate) }} {{ t('effectiveInterestRateShort') }} /
        {{ percent(nominelInterestRate) }} {{ t('nominalInterestRateShort') }}
      </div>
      <div>{{ t('loanAmount') }}: {{ currency(loanAmount) }}</div>
    </div>

    <div data-part="summary">
      <div>
        {{ capitalize(t('effectiveInterestRateShort')) }}
        {{ percent(effectiveRate) }}, {{ currency(loanAmount) }} /
        {{ years(repaymentPeriod) }}.
      </div>
      <div>
        {{ t('cost') }}: {{ currency(totalCost) }} / {{ t('total') }}:
        {{ currency(totalCost + loanAmount) }}
      </div>
    </div>

    <Button
      v-if="ctaLabel && ctaLink"
      :label="ctaLabel"
      is="a"
      :href="ctaLink"
      target="_blank"
      variant="primary"
    />
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

@mixin setVar($name, $default) {
  --k-scoped-loan-#{$name}: var(--k-loan-#{$name}, #{$default});
}
@function useVar($name) {
  @return var(--k-scoped-loan-#{$name});
}
@function contrastVar($name) {
  @return lch(from #{useVar($name)} calc((50 - l) * infinity) 0 0);
}
@function lightenVar($name, $delta) {
  @return color-mix(in srgb, #{useVar($name)}, white $delta);
}
@function darkenVar($name, $delta) {
  @return color-mix(in srgb, #{useVar($name)}, black $delta);
}

.kvass-loan-calculator {
  @include setVar(primary, var(--k-ui-color-primary));
  @include setVar(background-color, white);
  @include setVar(border, useVar(primary));
  @include setVar(padding, var(--k-ui-spacing-xxl));
  @include setVar(gap, var(--k-ui-spacing-lg));
  @include setVar(border-radius, var(--k-ui-rounding));
  @include setVar(logo-width, 150px);
  @include setVar(thumb-size, 20px);
  @include setVar(thumb-border-width, 7px);
  @include setVar(cta-alignment, 'flex-start');
  @include setVar(slider-track-background, rgb(0 0 0 / 0.2));

  --k-slider-range-background: #{useVar(primary)};
  --k-slider-track-background: #{useVar(slider-track-background)};
  --k-slider-thumb-background: #{useVar(background-color)};
  --k-slider-thumb-border-color: var(--k-slider-range-background);
  --k-slider-thumb-border-width: #{useVar(thumb-border-width)};
  --k-slider-thumb-size: calc(
    #{useVar(thumb-size)} - var(--k-slider-thumb-border-width)
  );

  --k-button-primary-background: #{useVar(primary)};
  --k-button-primary-background-hover: #{darkenVar(primary, 10%)};
  --k-button-primary-background-active: #{darkenVar(primary, 15%)};
  --k-button-primary-text: #{contrastVar(primary)};
  --k-button-border-radius: #{useVar(border-radius)};

  display: flex;
  flex-direction: column;

  background-color: useVar(background-color);
  color: contrastVar(background-color);

  padding: useVar(padding);
  gap: useVar(gap);
  border-radius: useVar(border-radius);

  line-height: 1.42;

  img {
    max-width: useVar('logo-width');
  }

  &-slider--disabled {
    margin-bottom: calc(useVar(padding) * -0.5);
  }

  .k-button {
    align-self: useVar('cta-alignment');

    &__content {
      text-align: center;
    }
  }

  [data-part='cost'] {
    font-size: 2.5rem;
    font-weight: bold;
  }

  [data-part='summary'] {
    opacity: 0.4;
  }

  [data-part='costs'],
  [data-part='summary'] {
    font-size: 0.8em;
  }
}
</style>
