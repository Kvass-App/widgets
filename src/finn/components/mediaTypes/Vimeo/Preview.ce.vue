<script setup lang="ts">
import Vimeo from './Vimeo.ce.vue'
import { Icon, type MediaItem as Media } from '@kvass/ui'

const props = withDefaults(
  defineProps<{
    value: Media
    invalid: boolean
    label: string
  }>(),
  {
    invalid: false,
  },
)
</script>

<template>
  <div
    class="k-media-vimeo-preview"
    style="
      box-sizing: border-box;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-size: 0.9em;
      flex-grow: 1;
      padding: 1rem;
      background: transparent;
      height: 320px;
    "
  >
    <template v-if="invalid">
      <Icon icon="fa6-brands:vimeo" style="font-size: 2rem; color: #00adef" />
      <div>
        {{ label }}
      </div>
    </template>

    <Vimeo
      v-else
      :src="value.url"
      class="k-media-vimeo-preview__preview"
      style="width: 100%; height: inherit; position: relative"
      :controls="true"
    />
  </div>
</template>

<style lang="scss"></style>
