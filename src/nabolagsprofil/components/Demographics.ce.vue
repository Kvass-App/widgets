<script setup>
import { Grid, Flex } from '@kvass/ui'
import { computed } from 'vue'

const props = defineProps({
  profile: Object,
})

const items = computed(() => {
  return props.profile?.demographics?.percent_text
})

const getValue = (item) => {
  return `${Math.floor(parseFloat(item.value))} %`
}

const getLabel = (item) => {
  return item.name
}
</script>

<template>
  <Grid class="demographics" gap="2rem" is="section">
    <h2 class="k-grid-span-full demographics__title">Demografi</h2>
    <Flex
      v-for="(item, index) in items"
      class="demographics-item"
      direction="column"
      gap="4px"
    >
      <span class="demographics-item__value">{{ getValue(item) }}</span>
      <span class="demographics-item__label">{{ getLabel(item) }}</span>
    </Flex>
  </Grid>
</template>

<style lang="scss">
@function useVar($name) {
  @return var(--k-scoped-nabolagsprofil-#{$name});
}

.demographics {
  &__title {
    margin-block: useVar(demographics-title-spacing-y) !important;
  }

  grid-template-columns: useVar(demographics-columns);

  // grid-template-columns: var(
  //   --kvass-nabolagsprofil-demographics-columns,
  //   repeat(3, 1fr)
  // );

  // @media (max-width: 992px) {
  //   grid-template-columns: var(
  //     --kvass-nabolagsprofil-demographics-columns,
  //     repeat(2, 1fr)
  //   );
  // }

  // @media (max-width: 767px) {
  //   grid-template-columns: var(
  //     --kvass-nabolagsprofil-demographics-columns,
  //     repeat(1, 1fr)
  //   );
  // }

  &-item {
    &__value {
      font-size: useVar(demographics-value-size);
      font-weight: useVar(demographics-value-weight);
      font-family: useVar(demographics-value-font);
      color: useVar(demographics-value-color);
    }
    &__label {
      font-size: useVar(demographics-label-size);
      font-weight: useVar(demographics-label-weight);
      font-family: useVar(demographics-label-font);
      color: useVar(demographics-label-color);

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>
