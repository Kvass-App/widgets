<script lang="ts" setup>
import { Button } from '@kvass/ui'
import { useCurrentElement } from '@vueuse/core'
import { ref, computed, onMounted, watch, useHost } from 'vue'
import PlayIcon from './PlayIcon.ce.vue'
import { requestAutoplay } from '../autoplay'

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

const dialog = ref()
const closeButton = ref()
const isOpen = ref(false)
const element = useCurrentElement()
const hasOwnTrigger = Boolean(useHost()?.children.length)

const isInline = computed(() => {
  try {
    return new URL(props.url).searchParams.get('display') === 'embed'
  } catch {
    return false
  }
})

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

function play() {
  if (isInline.value) {
    isOpen.value = true
    emit('open')
  } else openLightbox()
}

function openLightbox() {
  isOpen.value = true
  dialog.value.showModal()
  returnFocusFromPlayer()
  emit('open')
}

let stopReturningFocus = () => {}

function returnFocusFromPlayer() {
  const returnFocus = () => {
    stopReturningFocus()
    setTimeout(() => {
      window.focus()
      closeButton.value?.$el.focus()
    })
  }
  window.addEventListener('blur', returnFocus)
  stopReturningFocus = () => window.removeEventListener('blur', returnFocus)
}

function onPlayerLoad() {
  setTimeout(stopReturningFocus, 1000)
}

function onClose() {
  stopReturningFocus()
  isOpen.value = false
  emit('close')
}

onMounted(() => {
  if (props.openOnLoad) requestAutoplay(element.value, play)
})
</script>

<template>
  <div v-if="isInline" class="kvass-story-fly kvass-story-fly--inline">
    <iframe
      v-if="isOpen"
      class="kvass-story-fly__inline-player"
      :src="props.url"
    ></iframe>
    <button
      v-else
      type="button"
      class="kvass-story-fly__inline-trigger"
      :style="`background-image: url(${props.thumbnail});`"
      @click="play"
    >
      <PlayIcon size="large" />
      <span class="kvass-story-fly__inline-label">{{ props.label }}</span>
    </button>
  </div>

  <div
    v-else
    class="kvass-story-fly"
    :class="{ 'kvass-story-fly--own-trigger': hasOwnTrigger }"
  >
    <span
      v-if="hasOwnTrigger"
      class="kvass-story-fly__own-trigger"
      @click.prevent="openLightbox"
    >
      <slot />
    </span>
    <Button
      v-else
      class="kvass-story-fly__trigger-button"
      :style="`background-image: url(${props.thumbnail});`"
      @click="openLightbox"
    >
      <template #default>
        <PlayIcon />
        <span>
          {{ props.label }}
        </span>
      </template>
    </Button>

    <dialog
      ref="dialog"
      class="kvass-story-fly__lightbox"
      @click.self="dialog.close()"
      @close="onClose"
    >
      <div class="kvass-story-fly__lightbox-content">
        <Button
          ref="closeButton"
          class="kvass-story-fly__lightbox-close"
          icon="fa-pro-light:xmark"
          @click="dialog.close()"
        />
        <iframe v-if="isOpen" :src="props.url" @load="onPlayerLoad"></iframe>
      </div>
    </dialog>
  </div>
</template>

<style lang="scss">
.kvass-story-fly {
  --kvass-story-fly-button-background: var(
    --k-button-secondary-background,
    #1a1a1a
  );
  --kvass-story-fly-button-color: var(--k-button-secondary-text, #fff);
  --kvass-story-fly-play-color: var(--kvass-story-fly-button-background);
  --kvass-story-fly-play-ring: var(--kvass-story-fly-button-color);

  @supports (color: oklch(from red l c h)) {
    --kvass-story-fly-play-color: oklch(
      from var(--kvass-story-fly-button-background) min(l, 0.4) c h
    );
  }

  height: 100%;
  &--own-trigger {
    display: contents;
  }
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
      font: inherit;

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
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-sizing: border-box;
        min-height: 50px;
        max-width: calc(
          100% - 2 * var(--kvass-story-fly-trigger-left-offset, 15px)
        );
        padding: 8px var(--k-button-medium-padding-inline, 24px);
        border-radius: var(--k-button-border-radius, 4px);
        background: var(--kvass-story-fly-button-background);
        color: var(--kvass-story-fly-button-color);
        font-size: 16px;
        line-height: 1.25;
        text-align: left;
        white-space: normal;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
        transition: background-color 0.15s ease;
        cursor: pointer;
      }

      &:hover .k-button__content {
        background: var(
          --k-button-secondary-background-hover,
          var(--kvass-story-fly-button-background)
        );
      }
    }
  }
  &--inline {
    position: relative;
    aspect-ratio: var(
      --kvass-story-fly-aspect-ratio,
      var(--aspect-ratio, 16/9)
    );
    min-height: var(--kvass-story-fly-min-height, none);
    border-radius: var(--kvass-story-fly-border-radius, 0);
    overflow: hidden;
    background: #000;

    @media screen and (max-width: 680px) {
      aspect-ratio: var(
        --kvass-story-fly-aspect-ratio-small-device,
        var(--aspect-ratio, 16/9)
      );
    }
  }
  &__inline {
    &-trigger,
    &-player {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    &-trigger {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 0;
      background-color: #000;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      font: inherit;
      cursor: pointer;
    }

    &-label {
      color: #fff;
      font-size: 20px;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
    }
  }
  &__lightbox {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    overflow: hidden;

    &[open] {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &::backdrop {
      background: rgba(0, 0, 0, 0.8);
    }

    &[open],
    &[open]::backdrop {
      animation: kvass-story-fly-fade-in 0.3s ease-in-out;
    }

    &-content {
      position: relative;
      width: min(80vw, calc((100dvh - 160px) * 16 / 9));
      aspect-ratio: 16 / 9;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

      @media screen and (max-width: 767px) {
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
      }
    }

    &-close {
      position: absolute;
      bottom: calc(100% + 16px);
      right: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: #fff;
      color: #1a1a1a;
      font-size: 20px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      cursor: pointer;

      @media screen and (max-width: 767px) {
        top: 12px;
        right: 12px;
        bottom: auto;
      }
    }

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}

@keyframes kvass-story-fly-fade-in {
  from {
    opacity: 0;
  }
}
</style>
