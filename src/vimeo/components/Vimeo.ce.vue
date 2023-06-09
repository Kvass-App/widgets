<script>
import { WaitUntil, LoadScript, ExtractString } from '../../utils'

export default {
  props: {
    url: {
      type: String,
      default: '',
    },

    loop: {
      type: [String, Boolean],
      default: true,
    },
    autoplay: {
      type: [String, Boolean],
      default: false,
    },

    controls: {
      type: [String, Boolean],
      default: true,
    },
    mute: {
      type: [String, Boolean],
      default: false,
    },
    displayThumbnail: {
      type: [String, Boolean],
      default: true,
    },

    ignoreConsent: {
      type: [String, Boolean],
      default: false,
    },
    hideConsent: {
      type: [String, Boolean],
      default: false,
    },
    thumbnailSource: {
      type: String,
      default: '',
    },

    consentBlockMessage: {
      type: String,
      default: 'The video is blocked due to lack of consent to cookies',
    },

    consentButtonLabel: {
      type: String,
      default: 'Edit consents',
    },

    aspectRatio: {
      type: String,
      default: '16/9',
    },
  },
  data() {
    return {
      ready: false,
      player: null,
      thumbnail: null,
      consents: [],
    }
  },
  computed: {
    kvassDefined() {
      return typeof Kvass !== 'undefined'
    },
    showConsent() {
      if (this.hideConsent || !this.kvassDefined) return false
      return !this.ignoreConsent && !this.consents.includes('statistics')
    },

    videoId() {
      if (!this.url) return

      return [
        ExtractString(this.url, /https\:\/\/(w{3}\.)?vimeo\.com\/(.+)\/?/, {
          group: 2,
        }),
        ExtractString(
          this.url,
          /https\:\/\/(w{3}\.)?player\.vimeo\.com\/(video\/)?(.+)\/?/,
          {
            group: 3,
          },
        ),
      ]
        .find((e) => Boolean(e))
        .split('&')[0]
    },
  },

  methods: {
    openConsent() {
      if (!this.kvassDefined) return
      Kvass.emit('consent:show')
    },
    play() {
      if (!this.player || !this.ready) return
      this.player.play()
    },

    async init() {
      const mergeOptions = {
        id: this.videoId,
        loop: this.loop,
        autoplay: this.autoplay,
        controls: this.controls,
        muted: this.mute || this.autoplay,
        playsinline: 1,
        dnt: 1,
      }

      function stringToBoolean(value) {
        if (value === 'false') return false
        if (value === 'true') return true
        return value
      }

      Object.entries(mergeOptions).map(([key, value]) => {
        return (mergeOptions[key] = stringToBoolean(value))
      })

      LoadScript('https://player.vimeo.com/api/player.js')
      const Vimeo = await WaitUntil(() => window.Vimeo, { limit: 100 })

      this.player = new Vimeo.Player(this.$refs.vimeoPlayer, {
        ...mergeOptions,
      })

      await this.player
        .ready()
        .then(() => {
          this.ready = true
        })
        .catch((error) => {
          this.ready = true
        })
    },
  },

  async mounted() {
    if (this.displayThumbnail)
      this.thumbnail =
        !this.thumbnailSource && this.kvassDefined
          ? `/api/media/thumbnail?url=${this.url}`
          : this.thumbnailSource

    if (this.ignoreConsent || !this.kvassDefined) return this.init()

    let onChange = (consents) => {
      this.consents = consents || []
      if (!this.consents || !this.consents.length) return

      if (this.consents.includes('statistics')) return this.init()
      return this.$nextTick(() => this.$emit('ended'))
    }

    if (this.kvassDefined) {
      Kvass.emit('consent:get', (c) => onChange(c))
      Kvass.on('consent:change', onChange)
    }
  },
}
</script>

<template>
  <div
    class="widget-kvass-media-render-vimeo"
    :style="`aspect-ratio: ${aspectRatio};`"
  >
    <div
      v-show="ready"
      :key="videoId"
      ref="vimeoPlayer"
      class="widget-kvass-media-render-vimeo__embed"
      frameborder="0"
      allow="autoplay; fullscreen;"
      webkitallowfullscreen
      mozallowfullscreen
    />

    <transition name="fade" mode="in-out">
      <div
        v-show="!ready && thumbnail"
        class="widget-kvass-media-render-vimeo__thumbnail"
        :style="{ backgroundImage: `url(${thumbnail})` }"
      />
    </transition>
    <div v-if="showConsent" class="widget-kvass-media-render-vimeo__blocked">
      <div class="widget-kvass-media-render-vimeo__blocked-warning">
        {{ consentBlockMessage }}
        <button
          class="widget-kvass-media-render-vimeo__blocked-warning-button"
          @click="openConsent"
        >
          {{ consentButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.widget-kvass-media-render-vimeo {
  height: 100%;
  width: 100%;
  position: relative;

  iframe {
    height: 100%;
    width: 100%;
  }

  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__thumbnail {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    filter: blur(10px);
    opacity: 0.7;
  }

  &__blocked {
    display: flex;
    justify-content: center;
    align-items: center;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    svg {
      opacity: 0.3;
    }

    @media (max-width: 992px) {
      svg {
        font-size: 2.5em;
      }
    }
    &-warning {
      pointer-events: initial;
      position: absolute;
      bottom: 0;
      text-align: center;
      background-color: #f2f2f2;
      font-size: 0.6em;
      bottom: 3rem;
      left: 3rem;
      max-width: 400px;
      font-size: 0.8em;
      padding: 1.5em 2em;

      &-button {
        padding: 0.5rem;
        border: 1px solid #818181;
        backdrop-filter: none;
        background-color: transparent;
      }

      @media (max-width: 992px) {
        left: 0.5rem;
        bottom: 0.5rem;
        font-size: 0.6em;
        max-width: 200px;
      }
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 500ms;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
