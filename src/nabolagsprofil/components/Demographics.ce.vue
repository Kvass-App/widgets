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
.demographics {
  &__title {
    margin-block: var(
      --kvass-nabolagsprofil-demographics-title-spacing-y
    ) !important;
  }
  grid-template-columns: var(
    --kvass-nabolagsprofil-demographics-columns,
    repeat(3, 1fr)
  );

  @media (max-width: 992px) {
    grid-template-columns: var(
      --kvass-nabolagsprofil-demographics-columns,
      repeat(2, 1fr)
    );
  }

  @media (max-width: 767px) {
    grid-template-columns: var(
      --kvass-nabolagsprofil-demographics-columns,
      repeat(1, 1fr)
    );
  }

  &-item {
    &__value {
      font-size: var(--kvass-nabolagsprofil-demographics-value-font-size);
      font-weight: var(--kvass-nabolagsprofil-demographics-value-font-weight);
      color: var(--kvass-nabolagsprofil-demographics-value-color);
    }
    &__label {
      font-size: var(--kvass-nabolagsprofil-demographics-label-font-size);
      font-weight: var(--kvass-nabolagsprofil-demographics-label-font-weight);
      color: var(--kvass-nabolagsprofil-demographics-label-color);

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }
}
</style>
