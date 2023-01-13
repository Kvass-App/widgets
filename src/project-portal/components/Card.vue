<template>
  <div
    class="project-portal-card"
    :class="`project-portal-card--theme-${theme}`"
  >
    <component
      :is="item.url && !['development'].includes(status) ? 'a' : 'div'"
      class="project-portal-card__header"
      :href="item.url"
    >
      <div v-if="!disableLabel" class="project-portal-card__header-category">
        <Category :value="status" component="div" active />
      </div>
      <div
        class="project-portal-card__header-cover"
        :style="{ backgroundImage: `url(${cover})` }"
      ></div>
    </component>
    <div class="project-portal-card__content">
      <h2 class="project-portal-card__content-name">
        {{ item.name }}
      </h2>

      <span
        v-if="item.address && item.address.city"
        class="project-portal-card__content-location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="map-pin"
          role="img"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
            clip-rule="evenodd"
          />
        </svg>

        <span class="project-portal-card__content-city">
          {{ item.address ? item.address.city : '' }}
        </span>
      </span>
      <div class="project-portal-card__content-intro" v-html="item.intro"></div>
      <a
        v-if="item.url && !['development'].includes(status)"
        class="project-portal-card__content-url"
        :href="item.url"
      >
        Se prosjektet
      </a>
    </div>
  </div>
</template>

<script setup>
import Category from './Category.vue'
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  disableLabel: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'tiles'].includes(val),
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
