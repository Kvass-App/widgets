<script setup>
import { Flatfinder as FlatfinderComponent } from '@kvass/vue3-flatfinder'
import { LazyLoad } from '@kvass/ui'

const props = defineProps({
  projectUrl: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  pathPrefix: {
    type: String,
    default: '',
  },
  showResidentialList: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <LazyLoad>
    <FlatfinderComponent
      class="kvass-flatfinder"
      :project-url="projectUrl"
      :project-id="projectId"
      :path-prefix="pathPrefix"
      :show-residential-list="showResidentialList"
    />
  </LazyLoad>
</template>

<style lang="scss">
@import url('@kvass/vue3-flatfinder/style.css');

.kvass-flatfinder {
  // https://help.kvass.no/nb/articles/301111-embed-unit-selector
  --k-rangeslider-range-background: var(--kvass-flatfinder-filter-background);
  --k-checkbox-accent: var(--kvass-flatfinder-filter-background);
  --k-button-secondary-background: var(--kvass-flatfinder-filter-background);
  --k-button-secondary-text: var(--kvass-flatfinder-filter-contrast);
  --k-button-secondary-border: var(--kvass-flatfinder-filter-border-color);
  --k-button-secondary-background-hover: var(
    --kvass-flatfinder-filter-background-hover,
    var(--kvass-flatfinder-filter-background)
  );
  --k-button-border-radius: var(--kvass-flatfinder-filter-border-radius);

  .k-datatable {
    color: var(--kvass-flatfinder-list-color, inherit);
    &__row {
      --k-datatable-odd-color: var(--kvass-flatfinder-list-odd-background);
      &:nth-child(even) .k-datatable__cell {
        background-color: var(--kvass-flatfinder-list-even-background);
      }
    }
  }
  .k-checkbox[data-state='checked']:not([data-disabled]) [data-part='control'] {
    --k-checkbox-accent: var(--kvass-flatfinder-filter-background);
    --k-checkbox-accent-contrast: var(--kvass-flatfinder-filter-contrast);
  }
}
</style>
