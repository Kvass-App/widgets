<template>
  <div class="project-selector-card" :class="'project-selector-card--' + theme">
    <component
      :is="item.url && !['development'].includes(status) ? 'a' : 'div'"
      class="project-selector-card__header"
      :href="item.url"
    >
      <div v-if="!disableLabel" class="project-selector-card__header-category">
        <Category :value="status" component="div" active />
      </div>
      <div
        class="project-selector-card__header-cover"
        :style="{ backgroundImage: `url(${cover})` }"
      ></div>
    </component>
    <div class="project-selector-card__content">
      <h2 class="project-selector-card__content-name">
        {{ item.name }}
      </h2>

      <span
        v-if="item.address && item.address.city"
        class="project-selector-card__content-location"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="map-pin"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 288 512"
        >
          <path
            fill="currentColor"
            d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"
          ></path>
        </svg>

        <span class="project-selector-card__content-city">
          {{ item.address ? item.address.city : '' }}
        </span>
      </span>
      <div
        class="project-selector-card__content-intro"
        v-html="item.intro"
      ></div>
      <a
        v-if="item.url && !['development'].includes(status)"
        class="project-selector-card__content-url"
        :href="item.url"
      >
        Se prosjektet</a
      >
    </div>
  </div>
</template>

<script setup>
import Category from './Category.ce.vue'
import { ref, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  theme: {
    type: String,
    default: 'default',
    enums: ['default', 'primary', 'flat'],
  },
  disableLabel: {
    type: Boolean,
    default: false,
  },
})

const cover = computed(() => {
  return (
    getImage(
      props.item.media && props.item.media.cover
        ? props.item.media.cover
        : null,
    ) ||
    getImage(
      props.item.media && props.item.media.gallery
        ? props.item.media.gallery
        : null,
    )
  )
})

const status = computed(() => props.item.status)

function getImage(value) {
  if (!value || !value.length) return
  let result = value.find((i) => {
    if (i.type) return i.type.startsWith('image')
    return i
  })
  if (!result) return
  return result.url
}
</script>

<style lang="scss">
@import '../styles/components/card';
</style>
