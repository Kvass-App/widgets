<script setup>
import { onMounted, ref } from 'vue'
import { Card, Grid, Button, Image, Icon, Flex } from '@kvass/ui'
import { RenderBlock, getTitle, getThumbnail, ValidateBlocks } from './renderer'

const Shorten = (e, l) => (e.length > l ? e.substring(e, l - 3) + '...' : e)
const Replace = (s, d) => s.replace(/{(\w+)}/g, (m, k) => d[k] || m)
const isUrl = (e) => e.match(/^https?:\/\/|\//)
const FormatDate = (e) =>
  new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(e))
const defaultUrl =
  '/api/integration/preset/knips/statics/getPosts?feed={feed}&limit={limit}'

const props = defineProps({
  feed: String,
  author: {
    type: Boolean,
    default: true,
  },
  posts: {
    type: Number,
    default: 3,
  },
  columns: {
    type: Number,
    default: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
})

const items = ref([])
const item = ref(null)
const knipsElement = ref(null)
const mapItem = (item) => {
  return {
    id: item.id,
    title: getTitle(item),
    date: FormatDate(item.publishDate),
    project: item?.project,
    author: item?.author?.name,
    externalUrl: item.externalUrl,
    thumbnailImage: item.featuredImage.src,
    thumbnail: getThumbnail(item),
    claps: item.clapCount,
    isSupported: ValidateBlocks(item),
    shortContent: Shorten(
      item.blocks
        .filter((b) => b.type === 'regular')
        .map((b) => b.text)
        .join('\n'),
      125,
    ),
    content: item.blocks.flatMap((b) => RenderBlock(b, item)).filter(Boolean),
  }
}

const clap = async (item) => {
  fetch(
    `/api/integration/preset/knips/statics/clap?feed=${props.feed}&post=${item.id}`,
  )
  item.claps = item.claps + 1
}

const getPosts = () => {
  const { feed, posts: limit } = props
  const api = Replace(isUrl(feed) ? feed : defaultUrl, { feed, limit })

  fetch(api)
    .then((res) => res.json())
    .then(
      (data) =>
        (items.value = data
          .filter((e) => e.status === 'published' && e.channel === 'public')
          .map(mapItem)),
    )
}

const onDialog = (e) => {
  if (!e.isSupported) return window.open(`${e.externalUrl}`)
  item.value = e

  //scroll to current element
  setTimeout(() => {
    let navigationHeight = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--k-navigation-nav-height')

    if (!navigationHeight || !knipsElement.value) return

    navigationHeight = navigationHeight.trim().replace(/\D/g, '')

    const y =
      knipsElement.value.getBoundingClientRect().top +
      window.pageYOffset -
      navigationHeight

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    })
  }, 30)
}

const onModalClick = (event) => {
  if (event.target.closest('.k-card')) return
  item.value = null
}

onMounted(getPosts)
</script>

<template>
  <div class="knips-feed">
    <Grid class="knips-feed__items" :columns="columns">
      <Card v-for="item in items" :key="item.id">
        <template #header>
          <Image
            :src="item.thumbnailImage"
            aspect-ratio="16/9"
            class="k-card__thumbnail"
          />
        </template>
        <template #default>
          <Flex data-field="metadata" align="center" gap="xs">
            <Flex align="center" gap="xxs">
              <Icon icon="fa-pro-light:calendar" />
              {{ item.date }}
            </Flex>
            <Flex v-if="item.project" align="center" gap="xxs">
              <Icon icon="fa-pro-light:location-dot" />
              {{ item.project }}
            </Flex>
            <Flex v-if="author && item.author" align="center" gap="xxs">
              <Icon icon="fa-pro-light:user-circle" />
              {{ item.author }}
            </Flex>
            <Flex
              v-if="item.claps"
              align="center"
              gap="xxs"
              data-field="clap"
              @click="() => clap(item)"
            >
              <Icon icon="fa-pro-light:hands-clapping" data-state="default" />
              <Icon icon="fa-pro-solid:hands-clapping" data-state="hover" />
              {{ item.claps }}
            </Flex>
          </Flex>
          <h3 v-if="item.title" data-field="title">{{ item.title }}</h3>
          <div data-field="content">{{ item.shortContent }}</div>
          <Button
            label="Les mer"
            size="small"
            variant="secondary"
            data-field="readmore"
            icon-right="fa-pro-light:circle-plus"
            @click="() => onDialog(item)"
          ></Button>
        </template>
      </Card>
    </Grid>
    <div
      v-if="item"
      class="knips-feed__modal"
      @click="onModalClick"
      ref="knipsElement"
    >
      <div class="knips-feed__modal-backdrop"></div>
      <Card appearance="flat">
        <template #header v-if="item">
          <component
            :is="item.thumbnail.component"
            v-bind="item.thumbnail.props"
          ></component>
        </template>
        <template v-if="item">
          <Flex data-field="metadata" align="center" gap="xs">
            <Flex align="center" gap="xxs">
              <Icon icon="fa-pro-light:calendar" />
              {{ item.date }}
            </Flex>
            <Flex v-if="author && item.author" align="center" gap="xxs">
              <Icon icon="fa-pro-light:user-circle" />
              {{ item.author }}
            </Flex>
            <Flex
              v-if="item.claps"
              align="center"
              gap="xxs"
              data-field="clap"
              @click="() => clap(item)"
            >
              <Icon icon="fa-pro-light:hands-clapping" data-state="default" />
              <Icon icon="fa-pro-solid:hands-clapping" data-state="hover" />
              {{ item.claps }}
            </Flex>
          </Flex>
          <div data-field="dialog-content">
            <component
              v-for="{ component, content, ...rest } in item.content"
              :is="component"
              v-bind="rest"
            >
              <span v-if="content" v-html="content"></span>
            </component>
          </div>
          <Button
            icon-right="fa-pro-light:times"
            data-field="close"
            @click="item = null"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

*,
*:before,
*:after {
  box-sizing: border-box;
}

.knips-feed {
  --k-card-border-radius: var(--border-radius);
  --color: var(--knips-feed-color, var(--text-color));
  --background: var(--knips-feed-background, var(--background-color));
  --k-card-border-color: var(--knips-feed-border-color, rgba(0, 0, 0, 0.05));
  --k-dialog-backdrop-background: rgba(0, 0, 0, 0.8);

  color: var(--color);

  [data-field='close'] {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);

    &:not(:hover) {
      color: black;
    }
  }

  .k-grid {
    grid-template-columns: var(
      --knips-feed-grid-columns,
      var(--k-grid-columns)
    );

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  .k-card {
    background-color: var(--background, #fff);
    display: flex;
    flex-direction: column;
  }

  .k-card__header {
    padding: 0;
    aspect-ratio: var(--knips-feed-header-aspect-ratio, 16/9);
  }

  .knips-feed__items {
    .k-card__header {
      border-radius: var(--knips-feed-header-border-radius, 0px);
      figure {
        aspect-ratio: inherit;
        border-radius: inherit;
      }
    }
  }

  .k-card__content {
    display: flex;
    flex-direction: column;
    padding: var(--k-ui-spacing);
    gap: var(--k-ui-spacing-sm);
  }

  .k-image {
    flex-grow: 1;
  }

  [data-field='title'] {
    margin: 0;
    font-weight: bold;
    font-size: var(--knips-feed-title-font-size, inherit);
    line-height: var(--knips-feed-title-line-height, inherit);
    font-family: var(--knips-feed-title-font-family, inherit);
  }

  [data-field='metadata'] {
    font-size: 0.8em;
  }

  h2:first-child {
    margin: 0;
  }

  video {
    aspect-ratio: 16/9;
    width: 100%;
  }

  .k-button--variant-tertiary {
    color: inherit;
    border-color: var(--color);
  }

  [data-field='readmore'] {
    align-self: var(--knips-feed-action-align, center);
  }

  //button color / border adjustments
  [data-field='close'],
  [data-field='readmore'] {
    --k-button-secondary-border: var(
      --knips-feed-action-border-color,
      transparent
    );

    --k-button-secondary-background: var(
      --knips-feed-action-background,
      var(--secondary)
    );
    --k-button-secondary-text: var(
      --knips-feed-action-text-color,
      var(--secondary-contrast)
    );
    --k-button-secondary-background-hover: var(
      --knips-feed-action-background-hover,
      hsl(var(--secondary-h), var(--secondary-s), calc(var(--secondary-l) - 5%))
    );
    --k-button-secondary-background-active: var(
      --k-button-secondary-background-hover
    );
  }

  [data-field='dialog-content'] {
    display: flex;
    flex-direction: column;
  }

  [data-field='clap'] {
    cursor: pointer;

    &:hover {
      [data-state='default'] {
        display: none;
      }
    }

    &:not(:hover) {
      [data-state='hover'] {
        display: none;
      }
    }
  }

  [data-block-type='regular']:empty {
    display: none;
  }

  [data-block-type='video'] {
    margin-block: 2em;
  }

  [data-block-type='divider'] {
    border: none;
    border-top: 1px solid currentColor;
    opacity: 0.2;
  }

  [data-block-type='quote'] {
    font-style: italic;
    margin-block: 1rem;
    border-left: 0.25em solid rgba(black, 0.2);
    padding-left: 0.5em;
  }

  [data-block-type='list'] {
    margin-bottom: 0;

    & + [data-block-type='list'] {
      margin-top: 0.25em;
    }
  }

  [data-block-type='link'] {
    margin: 0 auto;
  }

  [alignment='center'] {
    text-align: center;
  }

  &__modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-color: rgb(0 0 0 / 0.3);
    z-index: 10000;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    .k-card {
      width: 100%;
      max-width: 75ch;
      max-height: calc(100vh - 4rem);
      margin: 2rem;
      overflow-y: auto;
      position: relative;
    }

    .k-card__content {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
      overflow: clip;
      padding: var(--k-ui-spacing-lg);
    }

    &-backdrop {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(black, 0.2);
      backdrop-filter: blur(8px);
    }
  }
}
</style>
