<script setup>
import { Grid, Card } from '@kvass/ui'
import { ref, onMounted, useHost } from 'vue'
import { getLabel as getLabelFactory } from '../../utils/index.js'

const props = defineProps({
  labels: {
    type: Object,
    default: () => ({}),
  },
  app_url: {
    type: String,
  },
  integration_id: {
    type: String,
  },
  columns: {
    type: Number,
    default: 'repeat(auto-fill, minmax(350px, 1fr))',
  },
})

const t = getLabelFactory(props.labels, {})
const items = ref([
  /* {
    url: 'https://www.facebook.com/facebook/posts/pfbid024E7fTAUVHZC8UAym5XiM9f3ZYGZBqhBr9ZvvyLwSbBXkyzojx6uM9GTy6zZV4D3Ll',
    width: 300,
  }, */
  /*{
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
  }, */
])

const src = ref('')
onMounted(() => {
  const host = useHost()

  fetch(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/fetchMedia`,
  )
    .then((res) => {
      console.log(res)

      return res.json()
    })
    .then((data) => {
      data.forEach((el) => items.value.push(el))
      src.value = `https://connect.facebook.net/${data[0]?.location}/sdk.js#xfbml=1&amp;version=${data[0]?.version}`
    })
    .then(() => {
      console.log(items.value)

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
})
</script>

<template>
  <div class="kvass-facebook-feed">
    <h2>Facebook Feed</h2>
    <Grid class="kvass-facebook-feed__grid" :columns="columns">
      <Card v-for="item in items" :key="items.indexOf(item)">
        <div>
          <div id="fb-root"></div>
          <component
            is="script"
            async
            defer
            crossorigin="anonymous"
            :src
          ></component>
          <div class="fb-post" :data-href="item.url" data-width="300"></div>
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
  --__kvass-facebook-feed-border: 1px solid #eaeaea;
  --__kvass-facebook-feed-height: auto;
  --__kvasss-facebook-feed-padding: 1rem;

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
    }

    .k-card__content {
      margin-block: auto;
    }
  }
}
</style>
