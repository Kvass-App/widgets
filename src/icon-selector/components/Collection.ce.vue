<script setup>
import { Icon } from '@kvass/ui'
import { computed } from 'vue'
import { Translate } from '../../utils/index.js'

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
  () => Translate(props.prefix) || props.collection.name,
)
</script>

<template>
  <button class="kvass-icon-selector-collection">
    <span class="kvass-icon-selector-collection__name">{{
      collectionName
    }}</span>
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

  &__name {
    text-align: left;
  }
  &__icons {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
