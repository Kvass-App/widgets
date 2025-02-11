<script setup>
import { ref, computed, reactive } from 'vue'
import Item from './Item.vue'
import { Icon, Button, Input } from '@kvass/ui'

const props = defineProps({
  title: String,
  value: {
    type: String,
    default: '[]',
  },
  showSearch: {
    type: String,
    transform: (value) => value === 'true',
  },
  icons: {
    type: Object,
    default: () => ({
      folder: 'fa-pro-light:folder',
      file: 'fa-pro-light:file',
      download: 'fa-pro-light:arrow-down-to-line',
      'application/pdf': 'fa-pro-light:file-pdf',
      back: 'fa-pro-light:arrow-left',
      breadcrumb: 'fa-pro-light:chevron-right',
    }),
  },
})

const value = reactive(JSON.parse(props.value))

const icons = reactive(
  typeof props.icons === 'object' ? props.icons : JSON.parse(props.icons),
)

const currentPath = ref('')
const layout = ref('grid')
const search = ref('')

const layoutComputed = computed(() => {
  return search.value ? 'list' : layout.value
})

const currentPathSplitted = computed(() => currentPath.value.split('/'))

const breadcrumbs = computed(() =>
  currentPathSplitted.value.map((name, i) => ({
    name,
    path: currentPathSplitted.value.slice(0, i + 1).join('/'),
  })),
)

const items = computed(() => {
  const files = []
  const directories = new Map()

  value.forEach((item) => {
    const { path } = item

    if (search.value) {
      item.files
        .map((file) => ({ ...file, fullPath: `${path}${file.name}` }))
        .filter((item) =>
          item.fullPath
            .toLowerCase()
            .trim()
            .includes(search.value.toLowerCase().trim()),
        )
        .forEach((item) => files.push(item))

      return files
    }

    const pathSplitted = path.split('/')

    if (item.path === currentPath.value) files.push(...item.files)
    if (currentPath.value === '' && item.path !== '')
      directories.set(pathSplitted[0], pathSplitted[0])

    if (
      pathSplitted.length > currentPathSplitted.value.length &&
      pathSplitted.slice(0, currentPathSplitted.value.length).join('/') ===
        currentPathSplitted.value.join('/')
    ) {
      const nextDirName = pathSplitted[currentPathSplitted.value.length]
      directories.set(
        nextDirName,
        pathSplitted.slice(0, currentPathSplitted.value.length + 1).join('/'),
      )
    }
  })

  return [
    ...Array.from(directories).map(([name, path]) => ({
      isDirectory: true,
      name,
      path,
    })),
    ...files.map((file) => ({ isDirectory: false, ...file })),
  ]
})

function onItemClick(item) {
  if (item.isDirectory) return (currentPath.value = item.path)
  window.open(item.url, '_blank')
}

const back = () =>
  (currentPath.value = currentPath.value.split('/').slice(0, -1).join('/'))
</script>

<template>
  <div class="k-directory">
    <div class="k-directory__header">
      <div v-if="title" class="k-directory__title">{{ title }}</div>

      <div class="k-directory__layout-settings">
        <div class="k-directory__search">
          <Input
            v-if="showSearch"
            v-model="search"
            type="text"
            placeholder="Søk her"
          />
          <Button
            v-if="search"
            class="k-directory__search-close"
            @click="search = ''"
            icon="fa-pro-duotone:x"
          ></Button>
        </div>

        <Button
          v-for="l in ['grid', 'list']"
          @click="layout = l"
          :icon="`fa-pro-solid:${l}`"
        />
      </div>
    </div>

    <div v-if="currentPath && !search" class="k-directory__breadcrumbs">
      <Button
        class="k-directory__back"
        :icon="icons.back"
        size="small"
        @click="back"
      />

      <div
        v-for="(breadCrumb, index) in breadcrumbs"
        @click="currentPath = breadCrumb.path"
        class="k-directory__breadcrumb"
      >
        <Icon v-if="index > 0" :icon="icons.breadcrumb" />

        <div>{{ breadCrumb.name }}</div>
      </div>
    </div>

    <div class="k-directory__no-results" v-if="search && !items.length">
      <p>Ingen søkresultater funnet</p>
    </div>

    <div
      :class="['k-directory__items', `k-directory__items--${layoutComputed}`]"
    >
      <Item
        v-for="(item, index) in items"
        :key="item.url"
        :value="item"
        :icons="icons"
        :search="search"
        @click="() => onItemClick(item)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-directory {
  --_k-directory-item-background: var(
    --k-directory-item-background,
    rgb(255 255 255 / 0.05)
  );
  --_k-directory-items-gap: var(--k-directory-items-gap, 1.5rem);
  --_k-directory-item-grid-gap: var(--k-directory-item-grid-gap, 0.5rem);
  --_k-directory-item-list-gap: var(--k-directory-item-list-gap, 1rem);
  --_k-directory-border-radius: var(
    --k-directory-border-radius,
    var(--border-radius)
  );
  --_k-directory-thumbnail-width: var(--k-directory-thumbnail-width, 50px);
  --_k-directory-title-size: var(--k-directory-title-size, 1.5rem);
  --_k-directory-title-weight: var(--k-directory-title-weight, normal);
  --k-directory-opacity: 0.5;

  --k-button-secondary-text: currentColor;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 1em;
  }

  &__title {
    font-size: var(--_k-directory-title-size);
    font-weight: var(--_k-directory-title-weight);
  }

  &__layout-settings {
    display: flex;
    gap: 1rem;
  }

  &__breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 50px;

    margin-bottom: 0.5rem;

    svg {
      color: white;
    }
  }

  &__items {
    &--grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--_k-directory-items-gap);
    }

    &--list {
      display: flex;
      flex-direction: column;

      .k-directory-item:nth-child(even) {
        background-color: var(--_k-directory-item-background);
      }
    }
  }

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    svg {
      font-size: 0.8em;
    }
  }

  &__no-results {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    p {
      opacity: var(--k-directory-opacity);
    }
  }

  &__search {
    position: relative;

    &-close {
      border: none;
      position: absolute;
      right: 0px;
      top: 0px;
      height: 100%;

      &:hover {
        background: none !important;
        outline: none !important;
      }
    }
  }
}
</style>
