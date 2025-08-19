<script setup>
import { Grid } from '@kvass/ui'
import { ref, onMounted, nextTick, useHost } from 'vue'

const props = defineProps({
  app_url: {
    type: String,
    required: true,
  },
  integration_id: {
    type: String,
    required: true,
  },
  columns: {
    type: Number,
    default: 'repeat(auto-fill, minmax(350px, 1fr))',
  },
})

const items = ref([])
const host = useHost()
const loading = ref(true)

const facebookItems = ref([])
const instagramItems = ref([])

// Load Facebook SDK
function loadFacebookSDK(location = 'en_US', version = 'v23.0') {
  if (!document.getElementById('facebook-jssdk')) {
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = `https://connect.facebook.net/${location}/sdk.js#xfbml=1&version=${version}`
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      FB?.XFBML?.parse(host.shadowRoot.querySelector('.kvass-facebook-feed'))
    }
  } else {
    FB?.XFBML?.parse(host.shadowRoot.querySelector('.kvass-facebook-feed'))
  }
}

// Load Instagram Embed Script
function loadInstagramSDK(location = 'en_US') {
  if (!document.querySelector('script[src*="platform.instagram.com"]')) {
    const script = document.createElement('script')
    script.id = 'instagram-jssdk'
    script.src = `//platform.instagram.com/${location}/embeds.js`
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      if (window.instgrm?.Embeds?.process) {
        console.log('loading instagram script 1')

        window.instgrm.Embeds.process(
          host.shadowRoot.querySelector('.kvass-facebook-feed'),
        )
      }
    }
  } else {
    if (window.instgrm?.Embeds?.process) {
      console.log('loading instagram script 2')
      window.instgrm.Embeds.process(
        host.shadowRoot.querySelector('.kvass-facebook-feed'),
      )
    }
  }
}

onMounted(async () => {
  const res = await fetch(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/posts`,
  )
  const data = await res.json()

  facebookItems.value = data.filter((item) =>
    item.url?.includes('facebook.com'),
  )
  instagramItems.value = data.filter((item) =>
    item.url?.includes('instagram.com'),
  )

  // Store all items for general use (optional)
  items.value = [...facebookItems.value, ...instagramItems.value]

  await nextTick()

  // Load both SDKs
  if (facebookItems.value.length) {
    loadFacebookSDK(data[0]?.location, data[0]?.version)
  }

  if (instagramItems.value.length) {
    loadInstagramSDK(data[0]?.location)
  }

  loading.value = false
})
</script>

<template>
  <div class="kvass-facebook-feed" v-if="items.length">
    <Grid
      ref="grid"
      class="kvass-facebook-feed__grid"
      :columns="columns"
      style="align-items: center"
    >
      <div v-for="(item, index) in facebookItems" :key="'fb-' + index">
        <div
          class="fb-post"
          :data-href="item.url"
          :data-width="item.width || 500"
        ></div>
      </div>

      <div v-for="(item, index) in instagramItems" :key="'ig-' + index">
        <div v-html="item.url"></div>
      </div>
    </Grid>
    <div class="kvass-facebook-feed__redirect"></div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-facebook-feed {
  --__kvass-facebook-feed-background-color: #f8f8f8;
  --__kvass-facebook-feed-max-width: 100%;
  --__kvass-facebook-feed-border: 1px solid #eaeaea;
  --__kvass-facebook-feed-height: auto;
  --__kvasss-facebook-feed-padding: 1rem;
  --__kvass-facebook-feed-color: black;

  color: var(--kvass-facebook-feed-color, var(--__kvass-facebook-feed-color));

  background-color: var(
    --kvass-facebook-feed-background-color,
    var(--__kvass-facebook-feed-background-color)
  );
  max-width: var(
    --kvass-facebook-feed-max-width,
    var(--__kvass-facebook-feed-max-width)
  );
  margin-top: 0.5rem;

  height: var(
    --kvass-facebook-feed-height,
    var(--__kvass-facebook-feed-height)
  );

  border: var(
    --kvass-facebook-feed-border,
    var(--__kvass-facebook-feed-border)
  );

  border-radius: var(--kvass-facebook-feed-border-radius, 3px);

  padding: var(
    --kvass-facebook-feed-padding,
    var(--__kvasss-facebook-feed-padding)
  );
  &__grid {
    .k-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      aspect-ratio: 5/7;
      overflow-y: scroll;
    }

    .k-card__content {
      max-height: 95%;
      margin-block: auto;
    }
  }

  &__redirect {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }
}
</style>
