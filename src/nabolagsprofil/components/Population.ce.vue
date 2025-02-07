<script setup>
import { Flex } from '@kvass/ui'
import { computed, ref } from 'vue'

const props = defineProps({
  profile: Object,
})

const legends = computed(() => {
  return [
    {
      class: 'primary',
      label: props.profile?.nabolag?.name || 'Nabolag',
    },
    {
      class: 'secondary',
      label: props.profile?.nabolag?.cityName || 'By/kommune',
    },
  ]
})

const getData = (property, fallbackProps) => {
  const getFallbackValue = (type) => {
    return fallbackProps.reduce((result, prop) => {
      const percent =
        props.profile?.nabolag_demografics?.demografics?.[type]?.[prop]?.percent
      return result + parseFloat(percent || 0)
    }, 0)
  }

  let neighborValue = props.profile?.demographics?.ssb?.grunnkrets?.[property]
  let cityValue = props.profile?.demographics?.ssb?.kommune?.[property]

  if (!neighborValue || !cityValue) {
    neighborValue = getFallbackValue('nabolag')
    cityValue = getFallbackValue('by')
  }

  const numberFy = (v) => Math.floor(parseFloat(v))

  return [
    { class: 'primary', value: numberFy(neighborValue) },
    { class: 'secondary', value: numberFy(cityValue) },
  ]
}

const items = computed(() => {
  return [
    {
      label: 'Barn',
      age: '(0-12)',
      data: getData('barn_prosent', ['ALDU_5', 'ALD6_12']),
    },
    {
      label: 'Ungdom',
      age: '(13-18)',
      data: getData('ungdom_prosent', ['ALD13_15', 'ALD16_18']),
    },
    {
      label: 'Ungdom',
      age: '(19-34)',
      data: getData('ung_prosent', ['ALD19_23', 'ALD24_34']),
    },
    {
      label: 'Voksne',
      age: '(35-64)',
      data: getData('voksen_prosent', ['ALD35_44', 'ALD45_54', 'ALD55_64']),
    },
    {
      label: 'Eldre',
      age: '(64 - )',
      data: getData('eldre_prosent', ['ALD65_74', 'ALD75_84', 'ALD85_O']),
    },
  ]
})

const multiplier = computed(() => {
  const maxValue = Math.max(
    ...items.value.flatMap((item) => item.data.map((v) => v.value)),
  )
  return 100 / maxValue
})
const population = ref(null)
</script>

<template>
  <div class="population" ref="population">
    <h2 class="population__title">Familiesammensetning</h2>
    <Flex gap="0.5rem" direction="column" class="k-mt-xxl">
      <Flex class="population__legend" v-for="legend in legends" gap="0.5rem">
        <div
          class="population__legend-box"
          :class="`population__legend-box--${legend.class}`"
        />
        <div class="population__legend-label">{{ legend.label }}</div>
      </Flex>
    </Flex>
    <Flex justify="space-evenly" class="k-py-xxl population__chart">
      <Flex v-for="item in items" justify="end" direction="column" gap="0.5rem">
        <Flex align="end" class="population__chart-bars">
          <Flex
            v-for="bar in item.data"
            direction="column"
            align="end"
            gap="0.5rem"
          >
            <span class="population__chart-value">{{ bar.value }} %</span>
            <div
              class="population__chart-bar"
              :class="[`population__chart-bar--${bar.class}`]"
              :style="{
                '--percentage': bar.value * multiplier,
              }"
            ></div>
          </Flex>
        </Flex>
        <Flex direction="column" align="center" gap="0" class="k-text--sm">
          <span> {{ item.label }} </span>
          <span> {{ item.age }} </span>
        </Flex>
      </Flex>
    </Flex>
  </div>
</template>

<style lang="scss">
@function useVar($name) {
  @return var(--k-scoped-nabolagsprofil-#{$name});
}

.population {
  &__legend {
    &-box {
      width: useVar(population-box-size);
      height: useVar(population-box-size);
      border-radius: useVar(population-box-rounding);

      &--primary {
        background: useVar(population-primary);
      }

      &--secondary {
        background: useVar(population-secondary);
      }
    }
  }

  &__chart {
    @media (min-width: 992px) {
      margin-top: 2rem;
    }
    @media (max-width: 992px) {
      justify-items: center;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem 0;
    }

    &-bars {
      gap: useVar(population-bar-gap);
    }

    &-bar {
      width: 100%;
      height: calc(var(--percentage) * useVar(population-bar-height) / 100);
      &--primary {
        background: useVar(population-primary);
      }
      &--secondary {
        background: useVar(population-secondary);
      }
    }

    &-value {
      font-size: useVar(population-bar-size);
      padding: useVar(population-bar-padding);
      font-weight: useVar(population-bar-weight);
      font-family: useVar(population-bar-font);
    }
  }
}
</style>
