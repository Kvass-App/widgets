<script setup lang="ts">
import { onMounted } from 'vue'
import { LoadScript } from '../../../../utils'

interface VideoProps {
  src: string
  videoState?: string
  autoplay?: boolean
  controls?: boolean
  disablePointerEvents?: boolean
  loop?: boolean
}

const props = defineProps<VideoProps>()

onMounted(() => {
  LoadScript('https://unpkg.com/@kvass/widgets@latest/dist/vimeo.js', {
    type: 'module',
  })
})
</script>

<template>
  <component
    v-if="props.src"
    is="kvass-vimeo"
    video-state="ready"
    :url="props.src"
    :loop="props.loop"
    :autoplay="props.autoplay"
    :controls="props.controls"
    @ended="$emit('ended')"
  />
</template>
