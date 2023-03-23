<script setup>
import { computed } from 'vue'
import { ImgComparisonSlider } from '@img-comparison-slider/vue'

const defaultOptions = {
  value: 50,
  hover: false,
  direction: 'horizontal',
  keyboard: 'enabled',
  handle: false,
}

const firstImageCaption = computed(
  () => props.data.firstImage.description || props.data.firstImage.name,
)
const secondImageCaption = computed(
  () => props.data.secondImage.description || props.data.secondImage.name,
)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      firstImage: {
        url: 'https://assets.kvass.no/641c0b087c49867b0b1065ec',
        description: 'Første bilde',
      },
      secondImage: {
        url: 'https://assets.kvass.no/641c0a8c7c49867b0b106570',

        description: 'Andre bilde',
      },
    }),
  },

  options: {
    type: Object,
    default: () => ({}),
  },

  handleSVG: {
    type: String,
    default:
      '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="-8 -3 16 6"><path stroke="#fff" d="M -3 -2 L -5 0 L -3 2 M -3 -2 L -3 2 M 3 -2 L 5 0 L 3 2 M 3 -2 L 3 2" stroke-width="1" fill="#fff" vector-effect="non-scaling-stroke"></path></svg>',
  },
})
</script>

<template>
  <ImgComparisonSlider
    :style="`--first-image-caption: ${firstImageCaption}; --second-image-caption: ${secondImageCaption}`"
    tabindex="0"
    class="img-comparison-slider"
    v-bind="{
      ...defaultOptions,
      ...options,
    }"
  >
    <img
      slot="second"
      class="img-comparison-slider__image"
      :src="data.firstImage.url"
    />

    <img
      slot="first"
      class="img-comparison-slider__image"
      :src="data.secondImage.url"
    />

    <div slot="handle" class="handle">
      <p class="handle__caption handle__caption--left">
        {{ data.firstImage.description || data.firstImage.name }}
      </p>
      <div class="handle__svg" v-html="handleSVG"></div>
      <p class="handle__caption handle__caption--right">
        {{ data.secondImage.description || data.secondImage.name }}
      </p>
    </div>
  </ImgComparisonSlider>
</template>

<style lang="scss">
.img-comparison-slider {
  width: 100%;
  height: 100%;

  --divider-width: 4px;
  --divider-color: black;

  $aspect-ratio: 16/9;
  $handleColor: black;
  $IconColor: white;

  // aspect-ratio: var(--kvass-img-comparison-slider-aspect-ratio, $aspect-ratio);
  //   aspect-ratio: var(
  //     --kvass-img-comparison-slider-aspect-ratio,
  //     $aspect-ratio
  //   );

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .handle {
    display: flex;
    flex-direction: row;

    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    gap: 1rem;
    min-width: 800px;

    font-size: 1rem;

    @media (max-width: 600px) {
      font-size: 0.75rem;
    }

    &__caption {
      color: white;
      word-wrap: wrap;
      width: 100%;

      &--left {
        text-align: right;
      }
    }

    &__svg {
      padding: 0.3em;
      background-color: black;
      border-radius: 100%;

      svg {
        width: 2.5em;
        height: 2.5em;
      }
    }
  }
}
</style>
