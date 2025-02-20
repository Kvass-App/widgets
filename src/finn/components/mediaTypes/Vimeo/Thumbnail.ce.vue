<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type MediaItem as Media } from '@kvass/ui'

const props = defineProps<{
  value: Media
}>()

const style = computed(() => {
  let thumbnail = `/api/media/thumbnail/?url=${props.value.url}&size=small`
  return {
    backgroundImage: `url(${thumbnail})`,
    position: 'relative',
    height: 'inherit',
    'background-size': 'cover',
    'background-repeat': 'no-repeat',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'background-position': 'center',
  }
})
</script>

<template>
  <div class="k-media-vimeo-thumbnail" :style="style" @click="$emit('click')">
    <div
      class="k-media-vimeo-thumbnail__icon"
      style="
        width: 20px;
        height: 20px;
        position: absolute;
        top: -1px;
        left: -1px;
        background: #f2f2f2;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--border-radius);
      "
    >
      <Icon icon="fa6-brands:vimeo" style="color: #00adef" />
    </div>
  </div>
</template>

<style lang="scss"></style>
