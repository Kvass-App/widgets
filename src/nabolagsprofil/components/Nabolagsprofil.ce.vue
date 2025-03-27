<script setup>
import { onMounted, ref, computed } from 'vue'
import { Button, Flex } from '@kvass/ui'
import Demographics from './Demographics.ce.vue'
import Population from './Population.ce.vue'
import Distance from './Distance.ce.vue'
import Qualities from './Qualities.ce.vue'
import Disclaimer from './Disclaimer.ce.vue'

const profile = ref(null)
const readMore = ref(false)

const props = defineProps({
  url: String,
  // type: {
  //   type: String,
  //   default: 'profile'
  // },
  // version: {
  //   type: String, // 'rent' | 'housing' | '''
  //   default: 'housing',
  // },
  // variant: {
  //   type: String,
  //   default: '', // graphs
  // },

  distances: {
    type: String,
    default: 'Skoler,Transport,Sport,Varer/tjenester',
  },
  ratings: {
    type: String,
    default: '1007,1008,1003,1010,1009',
  },
  readMoreLabel: {
    type: String,
    default: 'Les mer om nabolaget',
  },
  readLessLabel: {
    type: String,
    default: 'Les mindre om nabolaget',
  },
  interactiveLabel: {
    type: String,
    default: 'Interaktiv versjon',
  },
  iconsMap: {
    type: String,
    default: '{}',
  },
})

const interactiveUrl = computed(() => {
  const id = profile.value?.info?.orderLineId
  if (!id) return

  return `https://profil.nabolag.no/${id}`
})

function click(v) {
  readMore.value = !readMore.value

  if (readMore.value) {
    v.target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }
}

const getProfile = () => {
  const { url } = props

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      profile.value = data.profile
    })
    .catch((err) => {
      console.error(err)
    })
}

onMounted(getProfile)
</script>

<template>
  <template v-if="profile">
    <Flex direction="column" gap="3rem" class="nabolagsprofil">
      <Demographics :profile="profile" />
      <Flex is="section">
        <Button
          :label="readMore ? readLessLabel : readMoreLabel"
          variant="secondary"
          :iconRight="readMore ? 'fa-pro-solid:minus' : 'fa-pro-solid:plus'"
          @click="click"
        />

        <Button
          v-if="interactiveUrl && interactiveLabel"
          :label="interactiveLabel"
          variant="secondary"
          is="a"
          target="_blank"
          iconRight="fa-pro-solid:external-link"
          :href="interactiveUrl"
        />
      </Flex>

      <template v-if="readMore">
        <Population :profile="profile" />
        <Distance
          :profile="profile"
          :distances="distances.split(',')"
          :iconsMap="JSON.parse(iconsMap)"
        />
        <Qualities :profile="profile" :ratings="ratings.split(',')" />
        <Disclaimer />
      </template>
    </Flex>
  </template>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

@mixin setVar($name, $default) {
  --k-scoped-nabolagsprofil-#{$name}: var(
    --k-nabolagsprofil-#{$name},
    #{$default}
  );
}
@function useVar($name) {
  @return var(--k-scoped-nabolagsprofil-#{$name});
}

.nabolagsprofil {
  @include setVar(primary, var(--primary, var(--k-ui-color-primary)));
  @include setVar(
    secondary,
    var(--secondary, var(--k-ui-color-secondary, var(--k-ui-color-neutral)))
  );

  /* Title */
  @include setVar(title-weight, var(--custom-heading-font-weight, 400));
  @include setVar(title-size, var(--custom-h2-font-size, 2rem));
  @include setVar(
    title-font,
    var(--custom-heading-font-family, var(--secondary-font))
  );

  h2 {
    font-weight: useVar(title-weight);
    font-size: useVar(title-size);
    font-family: useVar(title-font);
    margin: 0;
  }

  /* Demographics */
  // --kvass-nabolagsprofil-demographics-columns

  @include setVar(demographics-columns, repeat(3, 1fr));
  @media (max-width: 992px) {
    @include setVar(demographics-columns, repeat(2, 1fr));
  }
  @media (max-width: 767px) {
    @include setVar(demographics-columns, repeat(1, 1fr));
  }

  @include setVar(demographics-value-size, 3rem);
  @include setVar(demographics-value-weight, 400);
  @include setVar(demographics-value-font, inherit);
  @include setVar(demographics-value-color, currentColor);

  @include setVar(demographics-label-size, 0.8rem);
  @include setVar(demographics-label-weight, 400);
  @include setVar(demographics-label-font, inherit);
  @include setVar(demographics-label-color, currentColor);

  @include setVar(demographics-title-spacing-y, 0rem 1rem);

  /* Population */

  @include setVar(population-primary, useVar(primary));

  @include setVar(population-secondary, useVar(secondary));

  @include setVar(population-box-size, 1.25rem);
  @include setVar(population-box-rounding, 0px);
  @include setVar(population-bar-height, 200px);
  @include setVar(population-bar-gap, 0.75rem);
  @include setVar(population-bar-size, 1rem);
  @include setVar(population-bar-weight, 400);
  @include setVar(population-bar-font, inherit);
  @include setVar(population-bar-padding, 0rem);
  @include setVar(population-bar-rounding, 0px);

  /* Distance */
  @include setVar(distance-cell-padding, 0.75rem);
  @include setVar(distance-header-padding, 0.5rem 0.75rem);
  @include setVar(distance-header-weight, bold);
  @include setVar(distance-header-font, inherit);
  @include setVar(distance-header-size, 1rem);
  @include setVar(distance-header-spacing-y, 0rem 1rem);

  @include setVar(distance-item-name-gap, 4px);
  @include setVar(distance-item-distance-gap, 4px);

  @include setVar(
    distance-header-seperator,
    1px solid var(--k-datatable-border-color, var(--k-ui-color-neutral-light))
  );
  @include setVar(distance-seperator, none);
  @media (max-width: 992px) {
    @include setVar(
      distance-seperator,
      1px solid var(--k-datatable-border-color, var(--k-ui-color-neutral-light))
    );
  }

  /* Qualities */
  @include setVar(qualities-title-spacing-y, 0rem 1rem);

  /* Doughnut */
  @include setVar(doughnut-title-size, 1rem);
  @include setVar(doughnut-title-weight, 400);
  @include setVar(doughnut-title-font, inherit);

  @include setVar(doughnut-subtitle-size, 1rem);
  @include setVar(doughnut-subtitle-weight, 400);
  @include setVar(doughnut-subtitle-font, inherit);

  @include setVar(doughnut-content-size, 1.5rem);
  @include setVar(doughnut-content-weight, 400);
  @include setVar(doughnut-content-font, inherit);

  @include setVar(doughnut-size, 200px);
  @include setVar(doughnut-primary, useVar(primary));
  @include setVar(doughnut-secondary, useVar(secondary));
}
</style>
