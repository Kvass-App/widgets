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
})
</script>

<template>
  <LazyLoad>
    <FlatfinderComponent
      class="kvass-flatfinder"
      :project-url="projectUrl"
      :project-id="projectId"
      :path-prefix="pathPrefix"
    />
  </LazyLoad>
</template>

<style>
@import url('@kvass/vue3-flatfinder/style.css');
</style>
