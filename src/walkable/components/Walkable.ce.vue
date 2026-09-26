<script lang="ts" setup>
import { Button } from '@kvass/ui'
import { useElementSize, useMutationObserver } from '@vueuse/core'
import { computed, ref, useHost, watch, watchEffect } from 'vue'
import WalkableIcon from './WalkableIcon.ce.vue'

import(
  /* @vite-ignore */ 'https://player-cdn.walkable.visuado.com/latest/walkable-player.element.js'
)

const props = withDefaults(
  defineProps<{
    url: string
    variant?: 'inline' | 'lightbox' | 'button'
    label?: string
  }>(),
  {
    variant: 'lightbox',
  },
)

const dialog = ref()
const isOpen = ref(false)

const link = computed(() => new URL(props.url))

const buttonLabel = computed(
  () => link.value.searchParams.get('label') || props.label,
)

const player = computed(() => {
  const [slug] = link.value.pathname.split('/').filter(Boolean)
  // Player settings on the link, e.g. ?show-greet=false, turn off what the player shows by default
  const settings = [...link.value.searchParams].filter(([key]) =>
    key.startsWith('show-'),
  )

  return {
    'apartment-json': `https://tours.walkable.visuado.com/${slug}/apartment.json`,
    'show-editor': 'false',
    ...Object.fromEntries(settings),
  }
})

// The close button sits among the player's own top-left controls: its «?» (shown with the greeting)
// and its disclaimer, both on by default
const showsHelp = computed(
  () => link.value.searchParams.get('show-greet') !== 'false',
)
const showsDisclaimer = computed(
  () => link.value.searchParams.get('show-disclaimer') !== 'false',
)

const closePlacement = computed(() => {
  if (showsHelp.value) return 'after-help'
  if (showsDisclaimer.value) return 'below-disclaimer'
  return 'corner'
})

const lightboxPlayer = ref<HTMLElement>()
const disclaimer = ref<HTMLElement | null>()

function findDisclaimer() {
  disclaimer.value =
    lightboxPlayer.value?.shadowRoot?.querySelector('.disclaimer')
}

watch(lightboxPlayer, findDisclaimer)
useMutationObserver(() => lightboxPlayer.value?.shadowRoot, findDisclaimer, {
  childList: true,
  subtree: true,
})

const { height: disclaimerHeight } = useElementSize(disclaimer, undefined, {
  box: 'border-box',
})

// The placement and the measured height are kept on the host, where the page can override the position
const host = useHost()!

watchEffect(() => {
  host.dataset.closePlacement = closePlacement.value
  host.style.setProperty(
    '--kvass-walkable-disclaimer-height',
    `${disclaimerHeight.value}px`,
  )
})

function openLightbox() {
  isOpen.value = true
  dialog.value.showModal()
}

function onClose() {
  isOpen.value = false
}

// The open player sits in the page, which must still scroll past it. The player zooms on every wheel,
// so a plain wheel is kept from it and scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch) still zooms
function scrollPageOnWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) return
  event.stopPropagation()
}

// The player blocks all touch panning; vertical panning is handed back to the page
const inlinePlayer = ref<HTMLElement>()
const panY = new CSSStyleSheet()
panY.replaceSync('.player-shell { touch-action: pan-y !important; }')

watch(inlinePlayer, async (player) => {
  if (!player) return
  await customElements.whenDefined('visuado-walkable-player')

  const root = player.shadowRoot!
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, panY]
})

// A one-finger swipe on the tour locks to an axis: vertical scrolls the page, horizontal turns the tour.
// The player cancels every touch, which would stop the page from scrolling, so its preventDefault on the
// first touch is a no-op, and moves are kept from it until the axis is known. It measures a drag from where
// the touch started, so a horizontal swipe loses nothing
let swipe: { x: number; y: number; axis?: 'x' | 'y' } | undefined

function onTouchstart(event: TouchEvent) {
  const [target] = event.composedPath() as Element[]
  // Pinches, and touches on the player's own buttons and strip, are left to the player
  if (event.touches.length > 1 || !target.classList.contains('player-canvas')) {
    swipe = undefined
    return
  }

  const [touch] = event.touches
  swipe = { x: touch.clientX, y: touch.clientY }
  Object.defineProperty(event, 'preventDefault', { value: () => {} })
}

function onTouchmove(event: TouchEvent) {
  if (!swipe || event.touches.length > 1) return

  if (!swipe.axis) {
    const [touch] = event.touches
    const dx = Math.abs(touch.clientX - swipe.x)
    const dy = Math.abs(touch.clientY - swipe.y)
    // The same 6px the player allows for a tap
    if (Math.max(dx, dy) < 6) {
      event.stopPropagation()
      return
    }

    swipe.axis = dy > dx ? 'y' : 'x'
  }

  if (swipe.axis === 'y') event.stopPropagation()
}

// The end always reaches the player, which resets its drag there. A tap is cancelled here instead of at its start,
// so the browser doesn't follow it with mouse events that would pick the marker a second time
function onTouchend(event: TouchEvent) {
  if (swipe && swipe.axis !== 'y') event.preventDefault()
  swipe = undefined
}

function onTouchcancel() {
  swipe = undefined
}
</script>

<template>
  <div class="kvass-walkable">
    <visuado-walkable-player
      v-if="variant === 'inline'"
      ref="inlinePlayer"
      v-bind="player"
      @wheel.capture.passive="scrollPageOnWheel"
      @touchstart.capture.passive="onTouchstart"
      @touchmove.capture.passive="onTouchmove"
      @touchend.capture="onTouchend"
      @touchcancel.capture="onTouchcancel"
    ></visuado-walkable-player>

    <template v-else>
      <Button
        :class="
          variant === 'button'
            ? 'kvass-walkable__button'
            : 'kvass-walkable__trigger'
        "
        :label="buttonLabel"
        @click="openLightbox"
      >
        <template #icon>
          <WalkableIcon />
        </template>
      </Button>

      <dialog
        ref="dialog"
        class="kvass-walkable__dialog"
        @click.self="dialog.close()"
        @close="onClose"
      >
        <div class="kvass-walkable__dialog-content">
          <Button
            class="kvass-walkable__close"
            icon="fa-pro-light:xmark"
            @click="dialog.close()"
          />
          <visuado-walkable-player
            v-if="isOpen"
            ref="lightboxPlayer"
            v-bind="player"
          ></visuado-walkable-player>
        </div>
      </dialog>
    </template>
  </div>
</template>

<style lang="scss">
:host {
  --kvass-walkable-close-background: #12171ea8;
  --kvass-walkable-close-color: #f2f5f8;

  --kvass-walkable-close-top: 14px;
  --kvass-walkable-close-left: 14px;

  display: block;
  height: 100%;
}

// Under the player's «?», or beside it where the player stacks its controls
:host([data-close-placement='after-help']) {
  --kvass-walkable-close-top: 64px;
}

// Under the disclaimer, whose height is measured from the player
:host([data-close-placement='below-disclaimer']) {
  --kvass-walkable-close-top: calc(
    14px + var(--kvass-walkable-disclaimer-height) + 8px
  );
}

@media (width <= 560px), (height <= 560px) {
  :host {
    --kvass-walkable-close-top: 10px;
    --kvass-walkable-close-left: 10px;
  }

  :host([data-close-placement='after-help']) {
    --kvass-walkable-close-top: 10px;
    --kvass-walkable-close-left: 48px;
  }

  :host([data-close-placement='below-disclaimer']) {
    --kvass-walkable-close-top: calc(
      10px + var(--kvass-walkable-disclaimer-height) + 6px
    );
  }
}

// The button variant is only the pill, so it sizes to it
:host([variant='button']) {
  width: fit-content;
  height: auto;
}

.kvass-walkable {
  height: 100%;

  visuado-walkable-player {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 0;
    isolation: isolate;
  }

  .k-button__icon {
    display: flex;
  }

  &__trigger,
  &__button {
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;

    .k-button__content {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 8px 20px;
      border-radius: 99px;
      backdrop-filter: blur(8px);
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 18px;
      font-weight: bold;
      transition: transform 0.2s ease-in-out;
    }

    &:hover .k-button__content {
      transform: scale(1.1);
    }
  }

  &__trigger {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;

    .k-button__content {
      position: absolute;
      bottom: 15px;
      right: 15px;
    }
  }

  &__dialog {
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

    @media screen and (min-width: 680px) {
      padding: 2rem;
    }

    &::backdrop {
      background: rgba(0, 0, 0, 0.8);
    }

    &[open],
    &[open]::backdrop {
      animation: kvass-walkable-fade-in 0.3s ease-in-out;
    }

    &-content {
      position: relative;
      height: 100%;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }
  }

  // Sized like the player's own buttons; placed by the variables on :host
  &__close {
    position: absolute;
    top: var(--kvass-walkable-close-top);
    left: var(--kvass-walkable-close-left);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    padding: 0;
    border: 1px solid #ffffff24;
    border-radius: 10px;
    backdrop-filter: blur(12px);
    background: var(--kvass-walkable-close-background);
    color: var(--kvass-walkable-close-color);
    font-size: 22px;
    cursor: pointer;

    @media (width <= 560px), (height <= 560px) {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 16px;
    }
  }
}

@keyframes kvass-walkable-fade-in {
  from {
    opacity: 0;
  }
}
</style>
