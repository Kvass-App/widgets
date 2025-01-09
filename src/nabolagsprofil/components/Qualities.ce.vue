<script setup>
import { Flex } from '@kvass/ui'
import { computed } from 'vue'
import Doughnut from './Doughnut.ce.vue'

const props = defineProps({
  profile: Object,
  ratings: Array,
})

const getItem = (id) => {
  const values = props.profile?.nabolag?.ratings || []
  return values.find((r) => r.id === id)
}

const items = computed(() => {
  // 1007 = Kvalitet på skolene
  // 1008 = Kvalitet på barnehagene
  // 1006 = Trygghet der barna ferdes
  // 1004 = Naboskapet
  // 1003 = Opplevd trygghet
  // 1005 = Støynivået
  // 1001 = Vedlikehold veier
  // 1002 = Vedlikehold hager
  // 1010 = Kollektivtilbud
  // 1012 = Trafikk
  // 1011 = Gateparkering
  // 1009 = Turmulighetene
  // 2016 = Aktivitetstilbud
  // 2017 = Kulturtilbud
  // 2019 = Serveringstilbud
  // 2018 = Uteliv
  // 2014 = Shoppingutvalg
  // 2015 = Dagligvaretilbud
  // 1013 = Matvareutvalg

  return props.ratings.map((r) => getItem(r)).filter(Boolean)
})

const getValue = (item) => {
  return `${Math.floor(parseFloat(item.score.value * 100))} %`
}

const getLabel = (item) => {
  return item.name
}

const getSublabel = (item) => {
  return item.score.text
}

const getData = (item) => {
  return [
    Math.floor(parseFloat(item.score.value * 100)),
    Math.floor(100 - parseFloat(item.score.value * 100)),
  ]
}
</script>

<template>
  <Flex
    v-if="items.length"
    class="qualities"
    gap="2rem"
    is="section"
    :columns="items.length"
    wrap
    justify="center"
  >
    <h2 class="qualities__title">Kvaliteter</h2>

    <Doughnut
      v-for="(item, index) in items"
      :data="getData(item)"
      :title="getLabel(item)"
      :subtitle="getSublabel(item)"
      :value="getValue(item)"
    ></Doughnut>
    <!-- <Flex
      v-for="(item, index) in items"
      class="qualities-item"
      direction="column"
      gap="0rem"
    >
      <span class="qualities-item__value">{{ getValue(item) }}</span>
      <span class="qualities-item__label">{{ getLabel(item) }}</span> 
    </Flex> -->
  </Flex>
</template>

<style lang="scss">
.qualities {
  &__title {
    width: 100%;
    grid-column: 1/-1;
    margin-block: var(
      --kvass-nabolagsprofil-qualities-title-spacing-y
    ) !important;
  }

  @media (max-width: 992px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
  }

  // &-item {
  //   &__value {
  //     font-size: 3rem;
  //   }
  //   &__label {
  //     font-size: 0.8rem;
  //     &:first-letter {
  //       text-transform: uppercase;
  //     }
  //   }
  // }
}
</style>
