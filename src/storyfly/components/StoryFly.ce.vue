<script lang="ts" setup>
import { Button, Icon } from '@kvass/ui'
import { useCurrentElement } from '@vueuse/core'
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    url: string
    label?: string
    thumbnail?: string
    openOnLoad?: boolean
  }>(),
  {
    label: 'Interaktiv film',
  },
)

const emit = defineEmits(['open', 'close'])

const lightbox = ref()
const iframe = ref()
const isOpen = ref(false)
const element = useCurrentElement()

watch(
  () => isOpen.value,
  (val) => {
    element.value.dispatchEvent(
      new CustomEvent('webcomponent:update', {
        detail: val,
        bubbles: true,
        composed: true,
      }),
    )
  },
  { deep: true },
)

function openLightbox() {
  lightbox.value.style.display = 'flex'
  setTimeout(() => {
    lightbox.value.classList.add('kvass-story-fly__lightbox--show')
  }, 10)
  iframe.value.src = props.url

  isOpen.value = true
  emit('open')
}

function closeLightbox(event) {
  isOpen.value = false
  if (
    !event ||
    event.target.classList.contains('kvass-story-fly__lightbox-close') ||
    event.target === lightbox.value
  ) {
    lightbox.value.classList.remove('kvass-story-fly__lightbox--show')
    setTimeout(() => {
      lightbox.value.style.display = 'none'
      iframe.value.src = ''
    }, 500)
  }

  emit('close')
}

onMounted(() => {
  if (props.openOnLoad) openLightbox()
})
</script>

<template>
  <div class="kvass-story-fly">
    <Button
      v-if="!isOpen"
      class="kvass-story-fly__trigger-button"
      :style="`background-image: url(${props.thumbnail});`"
      @click="openLightbox"
      icon="fa-pro-solid:play"
    >
      <template #default>
        <span>
          {{ props.label }}
        </span>
      </template>
    </Button>

    <div
      class="kvass-story-fly__lightbox"
      ref="lightbox"
      @click="closeLightbox"
    >
      <div
        class="kvass-story-fly__lightbox-content"
        @click.stop.prevent="() => ''"
      >
        <span class="kvass-story-fly__lightbox-close" @click="closeLightbox"
          >&times;</span
        >
        <iframe ref="iframe" src=""></iframe>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.kvass-story-fly {
  height: 100%;
  &__trigger {
    &-button {
      border: none;
      border-color: transparent;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      aspect-ratio: var(
        --kvass-story-fly-aspect-ratio,
        var(--aspect-ratio, 16/9)
      );
      min-height: var(--kvass-story-fly-min-height, none);
      height: 100%;
      width: 100%;
      border-radius: var(--kvass-story-fly-border-radius, 0);
      position: relative;

      @media screen and (max-width: 680px) {
        aspect-ratio: var(
          --kvass-story-fly-aspect-ratio-small-device,
          var(--aspect-ratio, 16/9)
        );
      }

      .k-button__content {
        position: absolute;
        bottom: var(--kvass-story-fly-trigger-bottom-offset, 15px);
        left: var(--kvass-story-fly-trigger-left-offset, 15px);
        backdrop-filter: blur(8px);
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 18px;
        font-weight: bold;
        padding: 8px 20px;
        border-radius: 99px;
        transition: transform 0.2s ease-in-out;
        z-index: 10;
        display: inline-flex;
        gap: 0.5rem;

        align-items: center;
        cursor: pointer;
        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
  &__lightbox {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.8);
    justify-content: center;
    align-items: center;
    z-index: 99999;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    padding-bottom: env(safe-area-inset-bottom);

    &--show {
      display: flex;
      opacity: 1;
    }

    &-content {
      position: relative;
      background: #fff;
      padding: 0;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100dvh;
    }

    &-close {
      $size: 30px;
      $offset: 30px;

      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 23px;

      cursor: pointer;
      background: #fff;
      border-radius: 50%;

      width: $size;
      height: $size;

      text-align: center;

      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      font-weight: bold;
      border: none;
      z-index: 10;
      display: block;
      line-height: normal;
      @media screen and (max-width: 680px) {
        top: calc(#{$size} + #{$offset});
        right: 12px;
      }
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
