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
          @click="() => (readMore = !readMore)"
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

.nabolagsprofil {
  h2 {
    font-weight: var(--kvass-nabolagsprofil-title-font-weight);
    font-size: var(--kvass-nabolagsprofil-title-font-size);
    font-family: var(--kvass-nabolagsprofil-title-font-family);
    margin: 0;
  }

  /* Title */
  --kvass-nabolagsprofil-title-font-weight: var(
    --custom-heading-font-weight,
    400
  );
  --kvass-nabolagsprofil-title-font-size: var(--custom-h2-font-size, 2rem);
  --kvass-nabolagsprofil-title-font-family: var(
    --custom-heading-font-family,
    var(--secondary-font)
  );

  /* Demographics */
  // --kvass-nabolagsprofil-demographics-columns
  --kvass-nabolagsprofil-demographics-value-font-size: 3rem;
  --kvass-nabolagsprofil-demographics-value-font-weight: 400;
  --kvass-nabolagsprofil-demographics-value-color: currentColor;
  --kvass-nabolagsprofil-demographics-label-font-size: 0.8rem;
  --kvass-nabolagsprofil-demographics-label-font-weight: 400;
  --kvass-nabolagsprofil-demographics-label-color: currentColor;
  --kvass-nabolagsprofil-demographics-title-spacing-y: 0rem 1rem;

  /* Population */
  --kvass-nabolagsprofil-population-color-primary: var(
    --primary,
    var(--k-ui-color-primary)
  );
  --kvass-nabolagsprofil-population-color-secondary: var(
    --secondary,
    var(--k-ui-color-secondary)
  );
  --kvass-nabolagsprofil-population-box-size: 1.25rem;
  --kvass-nabolagsprofil-population-box-rounding: 0px;
  --kvass-nabolagsprofil-population-bar-height: 200px;
  --kvass-nabolagsprofil-population-bar-gap: 0.75rem;
  --kvass-nabolagsprofil-population-bar-font-size: 1rem;
  --kvass-nabolagsprofil-population-bar-font-weight: 400;
  --kvass-nabolagsprofil-population-bar-padding: 0rem;

  /* Distance */
  --kvass-nabolagsprofil-distance-cell-padding: 0.75rem;
  --kvass-nabolagsprofil-distance-header-padding: 0.5rem 0.75rem;
  --kvass-nabolagsprofil-distance-header-font-weight: bold;
  --kvass-nabolagsprofil-distance-header-font-size: 1rem;
  --kvass-nabolagsprofil-distance-header-spacing-y: 0rem 1rem;

  /* Qualities */
  --kvass-nabolagsprofil-qualities-title-spacing-y: 0rem 1rem;

  /* Doughnut */
  --kvass-nabolagsprofil-doughnut-title-font-size: 1rem;
  --kvass-nabolagsprofil-doughnut-title-font-weight: 400;
  --kvass-nabolagsprofil-doughnut-subtitle-font-size: 1rem;
  --kvass-nabolagsprofil-doughnut-subtitle-font-weight: 400;
  --kvass-nabolagsprofil-doughnut-content-font-size: 1.5rem;
  --kvass-nabolagsprofil-doughnut-content-font-weight: 400;
  --kvass-nabolagsprofil-doughnut-size: 200px;
  --kvass-nabolagsprofil-doughnut-color-primary: var(
    --primary,
    var(--k-ui-color-primary)
  );
  --kvass-nabolagsprofil-doughnut-color-secondary: var(
    --secondary,
    var(--k-ui-color-secondary)
  );
}
</style>
