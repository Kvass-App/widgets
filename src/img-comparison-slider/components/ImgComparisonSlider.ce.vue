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
        src: 'https://img-comparison-slider.sneas.io/demo/images/before.webp',
        name: 'Kort Bildetekst',
      },
      secondImage: {
        src: 'https://img-comparison-slider.sneas.io/demo/images/after.webp',
        name: 'Lang lang lang bildetekst ',
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
      :src="data.firstImage.src"
    />

    <img
      slot="first"
      class="img-comparison-slider__image"
      :src="data.secondImage.src"
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

  aspect-ratio: var(--kvass-img-comparison-slider-aspect-ratio, $aspect-ratio);

  &__image {
    width: 100%;
    height: 100%;
    aspect-ratio: var(
      --kvass-img-comparison-slider-aspect-ratio,
      $aspect-ratio
    );
  }

  .handle {
    display: flex;
    flex-direction: row;

    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    gap: 1rem;
    width: 2000px;

    // height: calc(calc(16 / 9 * 100%));

    //   height: 100px;

    // background: linear-gradient(
    //   to right,
    //   rgba(black, 0) 0%,
    //   rgba(black, 0.15) 50%,
    //   rgba(black, 0) 100%
    // );

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

        // @media (max-width: 600px) {
        //   width: 2em;
        //   height: 2em;
        // }
      }
    }
  }
}
</style>
