<script setup lang="ts">
import { UnitSelector as FlatfinderComponent } from '@kvass/unit-selector'

const props = withDefaults(
  defineProps<{
    projectUrl: string
    projectId: string

    clientUrl?: string
    draftId?: string

    flatfinderId?: string
    currentUnitId?: string
    pathPrefix?: string
    filterParamsPrefix?: string

    title?: string
    subtitle?: string

    lazyload?: boolean
    smallScreenBreakpoint?: number

    layout?: 'top' | 'right' | 'bottom' | 'left'
    hoverCardLayout?: 'top' | 'right' | 'bottom' | 'left'

    hideTotalPrice?: boolean
    hideRegisterInterest?: boolean
    hideIllustrationDisclaimer?: boolean
    hideFavorites?: boolean
    hideHelp?: boolean
    hideFilter?: boolean
    hideUnitLists?: boolean

    showFloorplan?: boolean
  }>(),
  {
    lazyload: true,
  },
)
</script>

<template>
  <FlatfinderComponent
    class="kvass-flatfinder"
    :project-url="projectUrl"
    :project-id="projectId"
    :client-url="clientUrl"
    :draft-id="draftId"
    :flatfinder-id="flatfinderId"
    :path-prefix="pathPrefix"
    :title="title"
    :subtitle="subtitle"
    :filter-params-prefix="filterParamsPrefix"
    :small-screen-breakpoint="smallScreenBreakpoint"
    :current-unit-id="currentUnitId"
    :layout="layout"
    :hover-card-layout="hoverCardLayout"
    :lazyload="lazyload"
    :hide-total-price="hideTotalPrice"
    :hide-register-interest="hideRegisterInterest"
    :hide-illustration-disclaimer="hideIllustrationDisclaimer"
    :hide-favorites="hideFavorites"
    :hide-help="hideHelp"
    :hide-filter="hideFilter"
    :hide-unit-lists="hideUnitLists"
    :show-floorplan="showFloorplan"
  />
</template>

<style lang="scss">
@import url('@kvass/unit-selector/style.css');
// https://help.kvass.no/nb/articles/301111-embed-unit-selector

.kvass-flatfinder {
}
</style>
