<script setup lang="ts">
import { Icon, Image } from '@kvass/ui'
import { Tooltip } from 'floating-vue'

const props = defineProps<{
  src?: string
  content?: string
}>()
</script>
<template>
  <Tooltip :container="false">
    <Icon icon="material-symbols:question-mark" class="v-popper__icon"></Icon>
    <template #popper>
      <div
        v-if="content"
        class="tooltip__content"
        :class="{ 'k-mb-sm': src }"
        v-html="content"
      ></div>
      <Image
        class="tooltip__image"
        v-if="src"
        :src="src"
        width="100%"
        size="cover"
        aspect-ratio="16/9"
      >
      </Image>
    </template>
  </Tooltip>
</template>

<style lang="scss">
.tooltip__image {
  border-radius: var(--k-ui-rounding);
}

.tooltip__content {
  ul {
    padding: 0;
    margin: 0;
    list-style: disc inside;
  }
  ul li {
    margin: 0;
    line-height: normal;
    padding: 0;

    &::marker {
      margin: 0;
      padding: 0;
    }
  }
}
</style>
