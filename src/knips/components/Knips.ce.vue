<script setup>
import { onMounted, ref } from 'vue'
import { Card, Grid, Button, Image, Icon, Flex } from '@kvass/ui'

const Shorten = (e, l) => (e.length > l ? e.substring(e, l - 3) + '...' : e)
const Replace = (s, d) => s.replace(/{(\w+)}/g, (m, k) => d[k] || m)
const isUrl = (e) => e.match(/^https?:\/\/|\//)
const FormatDate = (e) =>
  new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(e))
const WrapMap = { bold: 'b', italic: 'i' }
const Wrap = (t, e) => `<${WrapMap[t] || t}>${e}</${WrapMap[t] || t}>`
const defaultUrl =
  '/api/integration/preset/knips/statics/getPosts?feed={feed}&limit={limit}'

const props = defineProps({
  url: String,
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
    default: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
})

const getTitle = (item) =>
  item.blocks.find((b) => ['h1', 'h2'].includes(b.type))?.text

const el = ref(null)
const dialog = ref(null)

const items = ref([])
const item = ref(null)
const mapItem = (item) => {
  const getThumbnail = () => {
    if (item.featuredImage.type === 'video')
      return {
        component: 'video',
        props: {
          src: item.blocks.find(
            (b) => b.type === 'video' && b.imageUrl === item.featuredImage.src,
          )?.videoStorageUrl,
          autoplay: true,
          type: 'video/mp4',
        },
      }

    return {
      component: Image,
      props: { src: item.featuredImage.src, 'aspect-ratio': '16/9' },
    }
  }

  return {
    id: item.id,
    title: getTitle(item),
    date: FormatDate(item.publishDate),
    project: item?.project,
    author: item?.author?.name,
    thumbnailImage: item.featuredImage.src,
    thumbnail: getThumbnail(),
    claps: item.clapCount,
    shortContent: Shorten(
      item.blocks
        .filter((b) => b.type === 'regular')
        .map((b) => b.text)
        .join('\n'),
      125,
    ),
    content: [
      ...item.blocks
        .flatMap((b) => {
          switch (b.type) {
            case 'image':
              return
            case 'h1':
            case 'h2':
              return { component: 'h2', content: b.text }
            case 'form':
              const form = item.forms.find((f) => f.id === b.formId)
              return {
                component: Button,
                label: form.title,
                variant: 'tertiary',
                is: 'a',
                href: `${props.url}/p/${item.id}?showForm=${form.id}`,
                target: '_blank',
              }
            case 'link':
              if (
                b.url.replace(/\/$/, '') ===
                (window.location.origin + window.location.pathname).replace(
                  /\/$/,
                  '',
                )
              )
                return
              return {
                component: b.style === 'button' ? Button : 'a',
                [b.style === 'button' ? 'label' : 'content']: b.text,
                variant: 'tertiary',
                is: 'a',
                href: b.urlRedirect || b.url,
                target: '_blank',
              }
            case 'regular':
              if (!b.spans?.length) return { component: 'p', content: b.text }
              return b.spans.map((s) => {
                let content = s.text
                s.styles.forEach((t) => (content = Wrap(t, content)))
                return { component: 'p', content }
              })
            case 'video':
              if (item.featuredImage.src === b.imageUrl) return
              return {
                component: 'video',
                type: 'video/mp4',
                controls: true,
                src: b.videoStorageUrl,
              }
          }
        })
        .filter(Boolean),
    ],
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
  // .then(() => onDialog(items.value.at(1)))
}

const onDialog = (e) => {
  item.value = e
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
          <div v-if="item.title" data-field="title">{{ item.title }}</div>
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
    <div v-if="item" class="knips-feed__modal" @click="onModalClick">
      <Card>
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
  --knips-feed-color: currentColor;
  --background: var(--knips-feed-background, var(--background-color));
  --k-card-border-color: rgba(0, 0, 0, 0.05);
  --k-dialog-backdrop-background: rgba(0, 0, 0, 0.8);

  [data-field='close'] {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
  }

  .k-card {
    background-color: var(--background, #fff);
    display: flex;
    flex-direction: column;
  }

  .k-card__header {
    padding: 0;
    aspect-ratio: 16/9;
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
    font-weight: bold;
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
    border-color: currentColor;
  }

  [data-field='readmore'] {
    align-self: center;
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

  &__modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-color: rgb(0 0 0 / 0.3);
    z-index: 10000;

    padding: 2rem;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    .k-card {
      max-width: 65ch;
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
      position: relative;
    }

    .k-card__content {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
      overflow: clip;
    }
  }
}
</style>
