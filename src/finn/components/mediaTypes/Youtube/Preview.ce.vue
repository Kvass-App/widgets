<script setup lang="ts">
import Youtube from './Youtube.ce.vue'

import { Icon } from '@kvass/ui'

import { type MediaItem as Media } from '@kvass/ui'

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
    class="k-media-youtube-preview"
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
      <Icon icon="fa6-brands:youtube" style="font-size: 2rem; color: #fe0002" />
      <div>
        {{ label }}
      </div>
    </template>

    <Youtube
      v-else
      :src="value.url"
      class="k-media-youtube-preview__preview"
      style="width: 100%; height: inherit; position: relative"
      :controls="true"
    />
  </div>
</template>

<style lang="scss"></style>
