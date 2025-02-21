<script setup>
import { onMounted, ref } from 'vue'
import { Card, Grid, Button, Dialog, Image, Icon, Flex } from '@kvass/ui'

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
  item.blog.find((b) => ['h1', 'h2'].includes(b.type))?.text

const el = ref(null)
const dialog = ref(null)

const items = ref([])
const item = ref(null)
const mapItem = (item) => {
  return {
    id: item.id,
    title: getTitle(item),
    date: FormatDate(item.publishDate),
    author: item?.author?.name,
    thumbnail: item.featuredImage.src,
    claps: item.clapCount,
    shortContent: Shorten(
      item.blog
        .filter((b) => b.type === 'regular')
        .map((b) => b.text)
        .join('\n'),
      125,
    ),
    content: [
      ...item.blog
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
  if (e) dialog.value.open()
}

onMounted(getPosts)
</script>

<template>
  <div class="knips-feed">
    <Grid class="knips-feed__items" :columns="columns">
      <Card v-for="item in items" :key="item.id">
        <template #header>
          <Image
            :src="item.thumbnail"
            aspect-ratio="16/9"
            class="k-card__thumbnail"
          />
        </template>
        <template #default>
          <Flex data-field="metadata" align="center" gap="sm">
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
          <div v-if="item.title" data-field="title">{{ item.title }}</div>
          <div data-field="content">{{ item.shortContent }}</div>
        </template>
        <template #actions>
          <Button
            label="Les mer"
            size="small"
            variant="secondary"
            icon-right="fa-pro-light:circle-plus"
            @click="() => onDialog(item)"
          ></Button>
        </template>
      </Card>
    </Grid>
    <Dialog
      ref="dialog"
      :teleport="false"
      dialog-id="knips"
      @close="() => onDialog()"
    >
      <template #header v-if="item">
        <Image :src="item.thumbnail" aspect-ratio="16/9" />
      </template>
      <template v-if="item">
        <Flex data-field="metadata" align="center" gap="sm">
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
      </template>
      <template #actions="{ close }" v-if="item">
        <Button
          label="Lukk"
          icon-right="fa-pro-light:times"
          data-field="close"
          @click="close"
        />
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

*,
*:before,
*:after {
  box-sizing: border-box;
}

[data-field='metadata'] {
  font-size: 0.8em;
}

.knips-feed {
  --k-card-border-radius: var(--border-radius);
  --knips-feed-color: currentColor;
  --background: var(--knips-feed-background, var(--background-color));
  --k-card-border-color: rgba(0, 0, 0, 0.05);
  --k-dialog-backdrop-background: rgba(0, 0, 0, 0.8);

  &__items {
    [data-field='metadata'] {
      margin-bottom: var(--k-ui-spacing-xs);
    }

    .k-card {
      background-color: var(--background);
    }

    .k-card__header {
      padding: 0;
    }
  }

  [data-field='title'] {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .k-button--variant-tertiary {
    color: inherit;
    border-color: currentColor;
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

  .k-dialog[data-id='knips'] {
    z-index: 10000;
    position: relative;

    .k-card {
      max-width: 65ch;
      background-color: var(--background);
    }

    .k-card__content {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
      overflow: clip;
      padding: 0;
    }

    .k-card__footer {
      position: sticky;
      bottom: 0;
      justify-content: center;
      padding-top: var(--k-card-spacing, var(--k-ui-spacing-lg));

      background: linear-gradient(
        to bottom,
        transparent 0%,
        var(--background) 20%,
        var(--background) 100%
      );
    }

    [data-field='metadata'] {
      padding: var(--k-card-spacing, var(--k-ui-spacing-lg));
      padding-bottom: calc(var(--k-card-spacing, var(--k-ui-spacing-lg)) / 4);
    }

    [data-field='dialog-content'] {
      padding-inline: var(--k-card-spacing, var(--k-ui-spacing-lg));

      & > * {
        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
