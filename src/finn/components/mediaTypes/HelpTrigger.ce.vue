<script setup lang="ts">
import { Button } from '@kvass/ui'

const props = withDefaults(
  defineProps<{
    triggerId: number
    label: string
  }>(),
  {
    triggerId: 14451,
  },
)
</script>

<template>
  <div
    class="k-media-help-trigger"
    style="
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      font-size: 0.75em;
      opacity: 0.7;
      padding: 0px 5px;
    "
  >
    <Button
      :label="label"
      is="a"
      target="_blank"
      :href="`https://help.kvass.no/nb/articles/${triggerId}`"
    />
  </div>
</template>

<style lang="scss"></style>
