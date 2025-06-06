<script setup lang="ts">
import { computed, inject } from 'vue'

import PricingLine from './PricingLine.ce.vue'
import { Services, Rooms, CameraAngles } from '../enums'

import type { Order } from '../types'

import { GetLabelInjectionKey, RootNodeInjectionKey } from '../keys'
const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)

const props = defineProps<{
  order: Order
}>()

const getTotal = (lines: Line[]) => {
  const result = lines.reduce(
    (res, line) => {
      if (typeof line.value === 'number') {
        res[line.type] =
          typeof res[line.type] === 'number'
            ? res[line.type] + line.value
            : line.value
      } else if (typeof line.value === 'string' && res[line.type] === 0) {
        res[line.type] = line.value
      }

      return res
    },
    { fixed: 0, monthly: 0, hourly: 0, offer: 0 },
  )

  return [
    { type: 'fixed', value: result.fixed },
    { type: 'monthly', value: result.monthly },
    { type: 'hourly', value: result.hourly },
    // { type: 'offer', value: result.offer },
  ].filter(({ value }) => value)
}

const interior = computed(() => {
  const items = props.order.images.filter((v) => v.type === 'interior')
  if (!items.length) return

  return {
    title: getLabel('interiorImages'),
    lines: Rooms.map((v) => {
      const total = items.filter((item) => item.room === v.id).length

      return {
        description: getLabel(v.label),
        value: 7000 * total,
        type: 'fixed',
        comment: `${total} ${getLabel('totalSuffix')}`,
      }
    }).filter((v) => v.value),
  }
})

const exteriorSmall = computed(() => {
  const isBetween0And10 = (number) => number >= 0 && number <= 10

  const items = props.order.images.filter(
    (v) => v.type === 'exterior' && isBetween0And10(v.units),
  )

  if (!items.length) return

  const exterior = items.filter((v) => !v.photomontage)
  const photomontage = items.filter((v) => v.photomontage)

  return {
    title: getLabel('exteriorImagesSmall'),
    lines: [
      ...CameraAngles.map((v) => {
        const total = exterior.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: getLabel(v.label),
          value: 8000 * total,
          type: 'fixed',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),

      ...CameraAngles.map((v) => {
        const total = photomontage.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: `${getLabel('photomontage')} - ${getLabel(v.label)} `,
          value: 9000 * total,
          type: 'fixed',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),
    ].filter((v) => v.value),
  }
})

const exteriorMedium = computed(() => {
  const isBetween11And29 = (number) => number >= 11 && number <= 29

  const items = props.order.images.filter(
    (v) => v.type === 'exterior' && isBetween11And29(v.units),
  )

  if (!items.length) return

  const exterior = items.filter((v) => !v.photomontage)
  const photomontage = items.filter((v) => v.photomontage)

  return {
    title: getLabel('exteriorImagesMedium'),
    lines: [
      ...CameraAngles.map((v) => {
        const total = exterior.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: getLabel(v.label),
          value: 10000 * total,
          type: 'fixed',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),

      ...CameraAngles.map((v) => {
        const total = photomontage.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: `${getLabel('photomontage')} - ${getLabel(v.label)} `,
          value: 11000 * total,
          type: 'fixed',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),
    ].filter((v) => v.value),
  }
})

const exteriorLarge = computed(() => {
  const items = props.order.images.filter(
    (v) => v.type === 'exterior' && v.units >= 30,
  )

  if (!items.length) return

  const exterior = items.filter((v) => !v.photomontage)
  const photomontage = items.filter((v) => v.photomontage)

  return {
    title: getLabel('exteriorImagesLarge'),
    lines: [
      ...CameraAngles.map((v) => {
        const total = exterior.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: getLabel(v.label),
          value: total ? getLabel('seperateOffer') : 0,
          type: 'offer',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),

      ...CameraAngles.map((v) => {
        const total = photomontage.filter(
          (item) => item.cameraAngle === v.id,
        ).length

        return {
          description: `${getLabel('photomontage')} - ${getLabel(v.label)} `,
          value: total ? getLabel('seperateOffer') : 0,
          type: 'offer',
          comment: `${total} ${getLabel('totalSuffix')}`,
        }
      }).filter((v) => v.value),
    ].filter((v) => v.value),
  }
})

const total = computed(() => {
  const value = getTotal(
    [
      interior.value,
      exteriorSmall.value,
      exteriorMedium.value,
      exteriorLarge.value,
      services.value,
    ]
      .filter(Boolean)
      .map(({ lines }) => lines)
      .flat(),
  )

  if (!value.length) return [{ type: 'offer', value: getLabel('noPrice') }]

  return value
})

const services = computed(() => {
  const items = props.order.services.filter((v) => v.selected)

  if (!items.length) return

  return {
    title: getLabel('additionalServices'),
    lines: items.map((v) => {
      return {
        //@ts-ignore
        description: getLabel(Services.find((s) => s.id === v.id).label),
        value: getLabel('seperateOffer'),
        type: 'offer',
      }
    }),
  }
})
</script>

<template>
  <div>
    <PricingLine :value="interior" v-if="interior"></PricingLine>
    <PricingLine :value="exteriorSmall" v-if="exteriorSmall"></PricingLine>
    <PricingLine :value="exteriorMedium" v-if="exteriorMedium"></PricingLine>
    <PricingLine :value="exteriorLarge" v-if="exteriorLarge"></PricingLine>
    <PricingLine :value="services" v-if="services"></PricingLine>

    <div data-section="total">
      <div>
        <h3>{{ getLabel('totalPrice') }}</h3>
        <p>
          {{ getLabel('totalPriceDisclaimer') }}
        </p>
      </div>

      <PricingLine :value="{ lines: total }" />
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

[data-section='total'] {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  background-color: var(--k-ui-color-neutral-lightest);

  border-bottom: 2px solid var(--k-ui-color-neutral-light);
  border-top: 2px solid var(--k-ui-color-neutral-light);

  margin: var(--k-ui-spacing-lg) 0;
  padding: var(--k-ui-spacing-lg);

  position: relative;
  width: 100%;
  // width: calc(100% + (2 * var(--k-ui-spacing-lg)));
  left: calc(var(--k-ui-spacing-lg) * -1);

  h3 {
    margin-bottom: 0.25em;
  }

  p {
    margin: 0;
    color: var(--k-ui-color-neutral-dark);
    font-size: 0.8rem;
  }

  [data-part='value'] {
    white-space: nowrap;
    font-weight: bold;
  }
}
</style>
