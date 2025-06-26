<script setup>
import { Grid, Card, Flex, Button, Skeleton } from '@kvass/ui'
import { ref, computed, onMounted, useHost, nextTick, watch } from 'vue'
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
  header: {
    type: String,
  },
})

const t = getLabelFactory(props.labels, {
  goToPage: 'Gå til siden!',
})
const items = ref([])

const src = ref('')
const host = useHost()
const loading = ref(true)
function updateParse() {
  if (typeof FB !== 'undefined') {
    FB.init({ version: 'v23.0' })
    FB.XFBML.parse(host.shadowRoot.querySelector('.kvass-facebook-feed'))
  } else {
    setTimeout(() => {
      updateParse()
    }, 500)
  }
}
onMounted(() => {
  fetch(
    `${props.app_url}/api/integration/${props.integration_id}/callbacks/fetchMedia`,
  )
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      data.forEach((el) => items.value.push(el))
      src.value = `https://connect.facebook.net/${data[0]?.location}/sdk.js#xfbml=1&amp;version=${data[0]?.version}`
    })
    .then(() => updateParse())
    .then(() => (loading.value = false))
})
</script>

<template>
  <div class="kvass-facebook-feed">
    <h2>{{ header }}</h2>
    <Grid ref="grid" class="kvass-facebook-feed__grid" :columns="columns">
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
    <div class="kvass-facebook-feed__redirect">
      <Button variant="primary" is="a" :href="pageLink" target="_blank">{{
        t('goToPage')
      }}</Button>
    </div>
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
