<script lang="ts" setup>
import { Button } from '@kvass/ui'
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

const dialog = ref()
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
  isOpen.value = true
  dialog.value.showModal()
  keepFocusOnClose()
  emit('open')
}

function keepFocusOnClose() {
  const close = dialog.value.querySelector('.kvass-story-fly__lightbox-close')
  const refocus = () =>
    setTimeout(() => {
      window.focus()
      close.focus()
    })
  window.addEventListener('blur', refocus, { once: true })
  setTimeout(() => window.removeEventListener('blur', refocus), 3000)
}

function onClose() {
  isOpen.value = false
  emit('close')
}

onMounted(() => {
  if (props.openOnLoad) openLightbox()
})
</script>

<template>
  <div class="kvass-story-fly">
    <Button
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

    <dialog
      ref="dialog"
      class="kvass-story-fly__lightbox"
      @click.self="dialog.close()"
      @close="onClose"
    >
      <div class="kvass-story-fly__lightbox-content">
        <Button
          class="kvass-story-fly__lightbox-close"
          icon="fa-pro-light:xmark"
          @click="dialog.close()"
        />
        <iframe v-if="isOpen" :src="props.url"></iframe>
      </div>
    </dialog>
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
