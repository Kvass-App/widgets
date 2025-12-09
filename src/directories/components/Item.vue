<script setup>
import { Icon } from '@kvass/ui'
import { computed } from 'vue'
import { getFileUrl } from '../utils'

const props = defineProps({
  value: Object,
  icons: Object,
  proxy: String,
  variant: {
    type: String,
    default: 'default',
  },
})

const url = computed(() => {
  return getFileUrl(props.value, props.proxy)
})

const icon = computed(() => {
  if (props.value.isDirectory) return { is: Icon, icon: props.icons.folder }
  if (props.value.type.startsWith('image/'))
    return { is: 'img', src: url.value.toString() }
  return { is: Icon, icon: props.icons[props.value.type] || props.icons.file }
})
</script>

<template>
  <div
    :class="['k-directory-item', `k-directory-item--variant-${variant}`]"
    v-on="$listeners"
  >
    <div class="k-directory-item__icon">
      <component :is="icon.is" v-bind="icon" />
    </div>
    <div v-if="variant === 'breadcrumb'" class="k-directory-item__breadcrumb">
      {{ value.fullPath.split('/').slice(0, -1).join('/') }}
    </div>
    <div class="k-directory-item__label">
      {{ value.name }}
    </div>
    <Icon
      v-if="!value.isDirectory"
      class="k-directory-item__action"
      :icon="icons.download"
    />
  </div>
</template>

<style lang="scss">
.k-directory-item {
  cursor: pointer;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;

    background-color: var(--_k-directory-item-icon-background);
    border-radius: var(--_k-directory-border-radius);
  }

  img {
    aspect-ratio: inherit;
    border-radius: inherit;
    max-width: 100%;
  }

  .k-directory__items--grid & {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--_k-directory-item-grid-gap);

    .k-directory-item__icon {
      aspect-ratio: 16 / 9;
      grid-column-end: span 2;
      font-size: 6rem;
    }
  }

  .k-directory__items--list & {
    display: grid;
    grid-template-columns: var(--_k-directory-thumbnail-width) 1fr auto;
    grid-template-areas: 'icon label download';
    gap: var(--_k-directory-item-list-gap);
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;
    align-items: center;
    row-gap: 0.5rem;

    .k-directory-item__icon {
      grid-area: icon;
      aspect-ratio: 1;
      width: 100%;
      font-size: 1.5rem;
    }

    .k-directory-item__label {
      grid-area: label;
      align-self: center;
    }

    .k-directory-item__breadcrumb {
      grid-area: breadcrumb;
      opacity: 0.5;
      font-size: 0.8em;
    }

    .k-directory-item__action {
      grid-area: download;
    }

    &--variant-breadcrumb {
      grid-template-areas: 'icon breadcrumb download' 'icon label download';
      row-gap: 0;
    }
  }
}
</style>
