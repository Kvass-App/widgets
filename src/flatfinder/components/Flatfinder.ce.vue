<script setup>
import { Flatfinder as FlatfinderComponent } from '@kvass/vue3-flatfinder'

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
  <FlatfinderComponent
    class="kvass-flatfinder"
    :project-url="projectUrl"
    :project-id="projectId"
    :path-prefix="pathPrefix"
  />
</template>

<style>
@import url('@kvass/vue3-flatfinder/style.css');
</style>
