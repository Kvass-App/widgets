<script>
import { WaitUntil, LoadScript, ExtractString } from '../../utils'

export default {
  props: {
    url: {
      type: String,
      default: '',
    },
    videoState: {
      type: String,
      default: 'ready',
      enums: ['ready ', 'play', 'pause'],
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

  watch: {
    videoState: {
      handler(newValue, oldValue) {
        if (newValue === oldValue) return
        switch (newValue) {
          case 'play':
            return this.play()
          case 'pause':
            return this.pause()
          default:
            return
        }
      },
    },
  },
  data() {
    return {
      ready: false,
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
      let value = this.url
      let id = [
        ExtractString(
          value,
          /https\:\/\/(w{3}\.)?youtube\.com\/watch\?v=(.+)\/?/,
          { group: 2 },
        ),
        ExtractString(
          value,
          /https\:\/\/(w{3}\.)?youtube\.com\/embed\/(.+)\/?/,
          { group: 2 },
        ),
        ExtractString(
          value,
          /https\:\/\/(w{3}\.)?youtube\.com\/watch\/(.+)\/?/,
          { group: 2 },
        ),
        ExtractString(value, /https\:\/\/(w{3}\.)?youtu\.be\/(.+)\/?/, {
          group: 2,
        }),
      ].find((e) => {
        return Boolean(e)
      })

      if (id) return id.split('&')[0]
    },
  },

  methods: {
    openConsent() {
      if (!this.kvassDefined) return
      Kvass.emit('consent:show')
    },
    play() {
      this.player.mute()
      this.player.playVideo()
    },
    pause() {
      this.player.pauseVideo()
    },

    async init() {
      const mergeOptions = {
        loop: this.loop,
        autoplay: this.autoplay,
        controls: this.controls,
        muted: this.mute || this.autoplay,
        enablejsapi: 1,
        playsinline: 1,
      }

      function stringToBoolean(value) {
        if (value === 'false') return false
        if (value === 'true') return true
        return value
      }

      Object.entries(mergeOptions).map(([key, value]) => {
        return (mergeOptions[key] = Number(stringToBoolean(value)))
      })

      LoadScript('https://www.youtube.com/iframe_api')

      await WaitUntil(() => window.YT && window.YT.Player, { limit: 200 })
      this.player = new YT.Player(this.$refs.youtubePlayer, {
        videoId: this.videoId,
        playerVars: {
          ...mergeOptions,
          videoId: this.videoId,
          origin: window.location.host,
        },
        events: {
          onReady: (event) => {
            this.ready = true

            if (Boolean(mergeOptions.mute)) this.player.mute()
            if (Boolean(mergeOptions.autoplay)) this.play()
          },
        },
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
    class="widget-kvass-media-render-youtube"
    :style="`aspect-ratio: ${aspectRatio};`"
  >
    <div
      ref="youtubePlayer"
      class="kvass-media-render-youtube__embed"
      frameborder="0"
      allow="autoplay; fullscreen;"
      webkitallowfullscreen
      mozallowfullscreen
    />

    <transition name="fade" mode="in-out">
      <div
        v-show="!ready && thumbnail"
        class="widget-kvass-media-render-youtube__thumbnail"
        :style="{ backgroundImage: `url(${thumbnail})` }"
      />
    </transition>
    <div v-if="showConsent" class="widget-kvass-media-render-youtube__blocked">
      <div class="widget-kvass-media-render-youtube__blocked-warning">
        {{ consentBlockMessage }}
        <button
          class="widget-kvass-media-render-youtube__blocked-warning-button"
          @click="openConsent"
        >
          {{ consentButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.widget-kvass-media-render-youtube {
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
