<script setup>
import { Icon } from '@kvass/ui'
import { computed } from 'vue'
import { translateCollectionName } from '../i18n.js'

const props = defineProps({
  collection: {
    type: Object,
    required: true,
  },
  prefix: {
    type: String,
    required: true,
  },
})

const collectionName = computed(
  () => translateCollectionName(props.prefix) || props.collection.name,
)
</script>

<template>
  <button class="kvass-icon-selector-collection">
    <span>{{ collectionName }}</span>
    <div class="kvass-icon-selector-collection__icons">
      <Icon
        v-for="icon in collection.samples"
        :key="icon"
        :icon="`${prefix}:${icon}`"
      />
    </div>
  </button>
</template>

<style lang="scss">
.kvass-icon-selector-collection {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;

  &:is(:hover, :focus-visible) {
    border-color: #c0c0c0;
  }

  &__icons {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
