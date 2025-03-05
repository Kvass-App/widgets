<script setup lang="ts">
import { computed, provide } from 'vue'

import Dashboard from './Dashboard.ce.vue'
import Mutate from './Mutate/Component.ce.vue'
import { PropsInjectionKey } from '../keys'

import type { Webcomponent } from '../types/webcomponent'

const props = withDefaults(defineProps<Webcomponent>(), {
  view: 'dashboard',
})

provide(PropsInjectionKey, props)

const getComponent = computed(() => {
  switch (props.view) {
    case 'mutate':
      return Mutate
    case 'dashboard':
    default:
      return Dashboard
  }
})
</script>

<template>
  <!-- 
   Wrapped the component in a div to ensure the dropdown closes properly when clicking outside the shadow DOM. 
   Clicking directly on the web component root element does not trigger the close event. 
   -->
  <div>
    <component
      :is="getComponent"
      v-bind="{ ...$attrs, ...$props }"
      class="finn"
    />
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.finn {
  .v-popper__popper {
    word-break: break-all;
    white-space: pre-wrap;
  }

  --synced-icon: #185089;
  --edited-icon: orange;

  --k-ui-color-primary: var(--primary);
  --k-ui-color-primary-dark: var(--primary-dark);
  --k-ui-color-primary-darkest: var(--primary-darkest);
  --k-ui-color-primary-light: var(--primary-light);
  --k-ui-color-primary-lightest: var(--primary-lightest);

  --k-card-background: #fafafa;

  --k-ui-color-neutral: #c9c9c9;
  --k-ui-color-neutral-dark: #939393;
  --k-ui-color-neutral-darkest: #272727;
  --k-ui-color-neutral-light: #eaeaea;
  --k-ui-color-neutral-lightest: #f8f8f8;

  --k-badge-danger-background: #fde8e8;
  --k-badge-danger-border-color: #fcdad9;
  --k-badge-danger-text: #6d2423;

  --k-badge-success-background: #dfebe5;
  --k-badge-success-border-color: #b4d3c2;
  --k-badge-success-text: #247448;

  --k-badge-warning-background: #fefaef;
  --k-badge-warning-border-color: #fcecbd;
  --k-badge-warning-text: #644902;

  --k-badge-info-background: #ebf3f9;
  --k-badge-info-border-color: #d7e7f3;
  --k-badge-info-text: #314a5e;

  --k-badge-neutral-background: #f8f8f8;
  --k-badge-neutral-border-color: #c9c9c9;
  --k-badge-neutral-text: #272727;

  --k-datatable-cell-size: 1rem;
  --k-datatable-odd-color: white;
  --k-datatable-even-color: var(--k-ui-color-neutral-lightest);

  --k-alert-info-border: #d3e6f7;
  --k-alert-info-background: #d3e6f7;
  --k-alert-info-text: #303336;
  --k-alert-icon-size: var(--k-ui-spacing-lg);

  // --k-ui-color-danger: #fcdad9;
  // --k-ui-color-danger-dark: var(--danger-dark);
  // --k-ui-color-danger-darkest: #6d2423;
  // --k-ui-color-danger-light: var(--danger-light);
  // --k-ui-color-danger-lightest: #fde8e8;

  // --k-ui-color-primary: var(--primary);

  // --k-dialog-max-width: 900px;
  // --k-dialog-min-width: 900px;

  color: var(--k-ui-color-neutral-darkest);

  --k-button-secondary-text: var(--k-ui-color-neutral-darkest);
  --k-button-tertiary-text: var(--k-ui-color-neutral-darkest);

  .k-input__input {
    color: var(--k-ui-color-neutral-darkest);
  }

  box-sizing: border-box;

  max-width: 1000px;
  margin: 0 auto;

  .k-media {
    .k-media-droparea {
      height: 320px;
    }
  }

  --k-dropdown-z-index: 1009;

  .k-dialog__container,
  .k-dialog__backdrop {
    z-index: 1010;
  }

  .k-expandable__header {
    & > .k-button__content {
      & > .k-button__icon {
        font-size: var(--k-ui-font-size-lg);
      }
    }
  }

  .k-expandable__title {
    font-size: var(--k-ui-font-size-lg);

    .godfather-hint {
      transform: translateY(-50%);
      top: 50%;
      right: -25px;
    }
  }

  .k-expandable__subtitle {
    font-size: var(--k-ui-font-size);
  }

  .k-formcontrol__label {
    font-weight: bold;
  }

  .k-alert {
    flex-direction: row-reverse;
  }
}
</style>
