<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Card, Grid, Button, Image, Icon, Flex } from '@kvass/ui'
import {
  RenderBlock,
  BlockList,
  getTitle,
  getThumbnail,
  ValidateBlocks,
  FlattenBlocks,
} from './renderer'

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
const mapItem = (rawItem) => {
  const item = { ...rawItem, blocks: FlattenBlocks(rawItem.blocks) }
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

// Local dev (e.g. *.local.kvass.test, localhost): show all posts,
// including drafts/non-public, so the feed can be tested locally
const isLocal = () =>
  /(\.test|\.local|localhost)$/.test(window.location.hostname)

const isVisible = (e) =>
  isLocal() || (e.status === 'published' && e.channel === 'public')

const getPosts = () => {
  const { feed, posts: limit } = props
  const api = Replace(isUrl(feed) ? feed : defaultUrl, { feed, limit })

  fetch(api)
    .then((res) => res.json())
    .then((data) => (items.value = data.filter(isVisible).map(mapItem)))
}

// lock page scroll while the dialog is open
let previousOverflow = null
const lockPageScroll = (lock) => {
  const root = document.documentElement
  if (lock) {
    if (previousOverflow === null) previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    return
  }
  if (previousOverflow === null) return
  root.style.overflow = previousOverflow
  previousOverflow = null
}

const onDialog = (e) => {
  if (!e.isSupported) return window.open(`${e.externalUrl}`)
  item.value = e
}

watch(item, async (value) => {
  const dialog = knipsElement.value
  if (!dialog) return
  if (value) {
    await nextTick()
    if (!dialog.open) dialog.showModal()
    dialog.scrollTop = 0
    lockPageScroll(true)
  } else {
    if (dialog.open) dialog.close()
    lockPageScroll(false)
  }
})

const onModalClick = (event) => {
  if (event.target.closest('.k-card')) return
  item.value = null
}

onMounted(getPosts)
onBeforeUnmount(() => lockPageScroll(false))
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
    <dialog
      class="knips-feed__modal"
      @click="onModalClick"
      @close="item = null"
      ref="knipsElement"
    >
      <Card v-if="item" appearance="flat">
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
            <BlockList :blocks="item.content" />
          </div>
          <Button
            icon-right="fa-pro-light:times"
            data-field="close"
            @click="item = null"
          />
        </template>
      </Card>
    </dialog>
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
    border-radius: var(
      --knips-feed-card-border-radius,
      var(--k-ui-rounding-lg)
    );
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

  [data-block-type='regular']:empty,
  [data-block-type='quote']:empty {
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

  [data-block-type='columns'] {
    display: flex;
    gap: var(--k-ui-spacing);
    margin-block: 1.5em;

    &[data-align='middle'] {
      align-items: center;
    }

    &[data-align='bottom'] {
      align-items: flex-end;
    }

    &[data-stacked] {
      @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
      }
    }
  }

  [data-block-type='column'] {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  [data-block-type='mediaCarousel'] {
    margin-block: 1em;

    > span {
      display: flex;
      gap: var(--k-ui-spacing-sm);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      overscroll-behavior-x: contain;
    }

    figure {
      flex: 0 0 85%;
      margin: 0;
      scroll-snap-align: center;

      &:only-child {
        flex-basis: 100%;
      }
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  [alignment='center'] {
    text-align: center;
  }

  &__modal {
    // reset native <dialog> defaults
    border: none;
    padding: 0;
    margin: 0;
    max-width: none;
    max-height: none;
    width: 100%;
    height: 100%;
    background: transparent;
    color: var(--color);

    overflow-y: auto;
    overscroll-behavior: contain;

    &[open] {
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    &::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
    }

    .k-card {
      width: 100%;
      max-width: 75ch;
      margin: 2rem;
      position: relative;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);

      @media (max-width: 600px) {
        margin: 1rem;
      }
    }

    .k-card__content {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
      overflow: clip;
      padding: var(--k-ui-spacing-lg);
    }
  }
}
</style>
