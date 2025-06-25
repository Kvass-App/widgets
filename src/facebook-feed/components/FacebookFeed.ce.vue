<script setup>
import { Grid, Card } from '@kvass/ui'
import { ref, onMounted, useHost } from 'vue'

const props = defineProps({
  columns: {
    type: Number,
    default: 'repeat(auto-fill, minmax(350px, 1fr))',
  },
})
const items = ref([
  {
    url: 'https://www.facebook.com/facebook/posts/pfbid024E7fTAUVHZC8UAym5XiM9f3ZYGZBqhBr9ZvvyLwSbBXkyzojx6uM9GTy6zZV4D3Ll',
    width: 300,
  },
  {
    url: 'https://www.facebook.com/facebook/posts/pfbid024E7fTAUVHZC8UAym5XiM9f3ZYGZBqhBr9ZvvyLwSbBXkyzojx6uM9GTy6zZV4D3Ll',
    width: 300,
  },
  {
    url: 'https://www.facebook.com/facebook/posts/pfbid024E7fTAUVHZC8UAym5XiM9f3ZYGZBqhBr9ZvvyLwSbBXkyzojx6uM9GTy6zZV4D3Ll',
    width: 300,
  },
  {
    url: 'https://www.facebook.com/facebook/posts/pfbid024E7fTAUVHZC8UAym5XiM9f3ZYGZBqhBr9ZvvyLwSbBXkyzojx6uM9GTy6zZV4D3Ll',
    width: 300,
  },
])

onMounted(() => {
  const host = useHost()
  function updateParse() {
    if (typeof FB !== 'undefined') {
      FB.init({ version: 'v23.0' })
      FB.XFBML.parse(host.shadowRoot.querySelector('.kvass-facebook-feed'))
    } else {
      setTimeout(() => {
        updateParse()
      }, 300)
    }
  }
  updateParse()
})
</script>

<template>
  <div class="kvass-facebook-feed">
    <Grid class="kvass-facebook-feed__grid" :columns="columns">
      <Card v-for="item in items" :key="items.indexOf(item)">
        <div>
          <div id="fb-root"></div>
          <component
            is="script"
            async
            defer
            crossorigin="anonymous"
            src="https://connect.facebook.net/nb_NO/sdk.js#xfbml=1&amp;version=v23.0"
          ></component>
          <div
            class="fb-post"
            :data-href="item.url"
            :data-width="item.width"
          ></div>
        </div>
      </Card>
    </Grid>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-facebook-feed {
  --__kvass-facebook-feed-background-color: #f8f8f8;
  --__kvass-facebook-feed-max-width: 100%;
  --__facebook-feed-size: 25vw;
  --__kvass-facebook-feed-size-min: 400px;
  --__kvass-facebook-feed-size-max: 800px;
  --__kvass-facebook-feed-border: 1px solid #eaeaea;
  --__kvass-facebook-feed-height: 100%;

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

  &__grid {
    .k-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .k-card__content {
      margin-block: auto;
    }
  }
}
</style>
