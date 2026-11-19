<script lang="ts" setup>
withDefaults(defineProps<{ size?: 'small' | 'large' }>(), { size: 'small' })
</script>

<template>
  <span
    class="kvass-story-fly-play"
    :class="`kvass-story-fly-play--${size}`"
    aria-hidden="true"
  >
    <svg viewBox="0 0 384 512">
      <path
        d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80v352c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9l288-176c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
      />
    </svg>
  </span>
</template>

<style lang="scss">
.kvass-story-fly-play {
  position: relative;
  flex: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  svg {
    display: block;
    width: 0.75em;
    height: 1em;
    fill: currentColor;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    box-sizing: border-box;
    border-radius: 50%;
    pointer-events: none;
  }

  &--small {
    width: 26px;
    height: 26px;
    padding-left: 2px;
    font-size: 11px;
    background: #fff;
    color: var(--kvass-story-fly-play-color, #1a1a1a);

    &::after {
      inset: 0;
      border: 2px solid var(--kvass-story-fly-play-ring, #fff);
      animation: kvass-story-fly-pulse 2s ease-out infinite;
    }

    &::before {
      display: none;
    }
  }

  &--large {
    width: 96px;
    height: 96px;
    border: 3px solid #fff;
    font-size: 30px;
    background: var(--kvass-story-fly-button-background, #1a1a1a);
    color: var(--kvass-story-fly-button-color, #fff);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    &::before,
    &::after {
      inset: -3px;
      border: 2px solid #fff;
      animation: kvass-story-fly-pulse-large 2.4s ease-out infinite;
    }

    &::after {
      animation-delay: 1.2s;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
      opacity: 0;
    }
  }
}

@keyframes kvass-story-fly-pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  75%,
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

@keyframes kvass-story-fly-pulse-large {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.65);
    opacity: 0;
  }
}
</style>
