<script setup>
import { Icon } from "@kvass/ui";
import { computed } from "vue";

const props = defineProps({
  value: Object,
  icons: Object,
});

const icon = computed(() => {
  if (props.value.isDirectory) return { is: Icon, icon: props.icons.folder };
  if (props.value.type.startsWith("image/"))
    return { is: "img", src: props.value.url };
  return { is: Icon, icon: props.icons[props.value.type] || props.icons.file };
});
</script>

<template>
  <div class="k-directory-item" v-on="$listeners">
    <div class="k-directory-item__icon">
      <component :is="icon.is" v-bind="icon" />
    </div>
    <div class="k-directory-item__label">{{ value.name }}</div>
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

    background-color: var(--_k-directory-item-background);
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
      font-size: 3rem;
      grid-column-end: span 2;
    }
  }

  .k-directory__items--list & {
    display: flex;
    align-items: center;
    gap: var(--_k-directory-item-list-gap);
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;

    .k-directory-item__label {
      flex-grow: 1;
    }

    .k-directory-item__icon {
      aspect-ratio: 1;
      width: 100%;
      max-width: var(--_k-directory-thumbnail-width);
    }
  }
}
</style>
