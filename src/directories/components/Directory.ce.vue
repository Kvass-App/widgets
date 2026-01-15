<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import Item from './Item.vue'
import { Icon, Button, Input } from '@kvass/ui'
import { getFileUrl } from '../utils'

const props = defineProps({
  title: String,
  value: {
    type: String,
    default: '[]',
  },
  search: Boolean,
  proxy: String,
  layout: String,
  icons: {
    type: Object,
    default: () => ({
      folder: 'fa-pro-duotone:folder',
      file: 'fa-pro-duotone:file',
      download: 'fa-pro-duotone:arrow-down-to-line',
      'application/pdf': 'fa-pro-duotone:file-pdf',
      back: 'fa-pro-duotone:arrow-left',
      breadcrumb: 'fa-pro-duotone:chevron-right',
    }),
  },
})

const value = reactive(JSON.parse(props.value))

const icons = reactive(
  typeof props.icons === 'object' ? props.icons : JSON.parse(props.icons),
)

const url = new URL(window.location.href)
const role = window.localStorage.getItem('role')
const currentPath = ref(url.searchParams.get('directory') || '')
watch(currentPath, (v) => {
  let u = new URL(window.location.href)
  if (v === u.searchParams.get('directory')) return

  if (v) u.searchParams.set('directory', v)
  else u.searchParams.delete('directory')
  window.history.pushState({}, '', u.toString())
})

onMounted(() => {
  window.addEventListener('popstate', () => {
    currentPath.value =
      new URL(window.location.href).searchParams.get('directory') || ''
  })
})

const layout = ref('list')
const searchInput = ref('')

const layoutComputed = computed(() => {
  if (props.layout) return props.layout
  return searchInput.value ? 'list' : layout.value
})

const currentPathSplitted = computed(() => currentPath.value.split('/'))

const breadcrumbs = computed(() => [
  {
    name: 'Dokumenter',
    path: '',
  },
  ...currentPathSplitted.value.map((name, i) => ({
    name,
    path: currentPathSplitted.value.slice(0, i + 1).join('/'),
  })),
])

const filterByRole = (v) => !role || !v?.acl?.length || v.acl.includes(role)

const getFolderContent = (path = '') => {
  const getSubpath = (v) =>
    v.path
      .split('/')
      .slice(0, !path ? 1 : path.split('/').length + 1)
      .join('/')

  const addedPaths = []

  return [
    ...value
      .filter(
        (v) => v.path !== path && v.path.startsWith(path) && filterByRole(v),
      )
      .map((v) => {
        const subpath = getSubpath(v)
        if (addedPaths.includes(subpath)) return
        addedPaths.push(subpath)
        return {
          isDirectory: true,
          name: subpath.split('/').pop(),
          path: subpath,
        }
      })
      .filter(Boolean),
    ...value
      .filter((v) => v.path === path)
      .flatMap((v) => v.files.map((f) => ({ isDirectory: false, ...f })))
      .filter(filterByRole),
  ]
}

const items = computed(() => {
  if (searchInput.value) {
    return value
      .flatMap((v) => v.files)
      .map((file) => ({ ...file, fullPath: `${item.path}/${file.name}` }))
      .filter((item) => new RegExp(searchInput.value, 'i').test(item.fullPath))
      .filter(filterByRole)
      .forEach((item) => files.push(item))
  }

  return getFolderContent(currentPath.value)
})

function onItemClick(item) {
  if (item.isDirectory) return (currentPath.value = item.path)

  const url = getFileUrl(item, props.proxy)
  const link = document.createElement('a')
  link.href = url.toString()
  link.download = item.name || ''
  link.style.position = 'absolute'
  link.style.left = '-9999px'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const back = () =>
  (currentPath.value = currentPath.value.split('/').slice(0, -1).join('/'))
</script>

<template>
  <div class="k-directory">
    <div class="k-directory__header">
      <div v-if="title" class="k-directory__title">{{ title }}</div>

      <div class="k-directory__layout-settings">
        <div v-if="search" class="k-directory__search">
          <Input v-model="searchInput" type="text" placeholder="Søk her..." />
          <Icon icon="fa-pro-light:search" />
        </div>

        <template v-if="!props.layout">
          <Button
            v-for="l in ['grid', 'list']"
            @click="layout = l"
            :disabled="searchInput.length"
            :icon="`fa-pro-solid:${l}`"
            variant="primary"
          />
        </template>
      </div>
    </div>

    <div
      v-if="currentPath && !searchInput.length"
      class="k-directory__breadcrumbs"
    >
      <Button
        class="k-directory__back"
        :icon="icons.back"
        size="small"
        variant="primary"
        label="Gå tilbake"
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

    <div
      class="k-directory__no-results"
      v-if="searchInput.length && !items.length"
    >
      <p>Ingen treff for "{{ searchInput }}"</p>
    </div>

    <div class="k-directory__no-results" v-else-if="!items.length">
      <p>Ingen dokumenter</p>
    </div>

    <div
      v-else
      :class="['k-directory__items', `k-directory__items--${layoutComputed}`]"
    >
      <Item
        v-for="(item, index) in items"
        :key="item.url"
        :value="item"
        :icons="icons"
        :proxy="proxy"
        :variant="searchInput.length ? 'breadcrumb' : 'default'"
        @click="() => onItemClick(item)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-directory {
  --_k-directory-text-color: var(--k-directory-text-color, currentColor);
  --_k-directory-item-background: var(
    --k-directory-item-background,
    rgb(0 0 0 / 0.05)
  );
  --_k-directory-item-background-even: var(
    --k-directory-item-background-even,
    rgb(0 0 0 / 0.02)
  );
  --_k-directory-item-icon-background: var(
    --k-directory-item-icon-background,
    rgb(0 0 0 / 0.02)
  );
  --_k-directory-primary-background: var(
    --k-directory-primary-background,
    var(--_k-directory-item-background)
  );
  --_k-directory-primary-color: var(
    --k-directory-primary-color,
    var(--_k-directory-text-color)
  );
  --_k-directory-primary-background-hover: var(
    --k-directory-primary-background-hover,
    var(--_k-directory-primary-background)
  );
  --_k-directory-primary-background-active: var(
    --k-directory-primary-background-active,
    var(--_k-directory-primary-background)
  );
  --_k-directory-primary: var(--k-directory-item-background, rgb(0 0 0 / 0.05));
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

  --k-button-primary-background: var(--_k-directory-primary-background);
  --k-button-primary-background-hover: var(
    --_k-directory-primary-background-hover
  );
  --k-button-primary-background-active: var(
    --_k-directory-primary-background-active
  );
  --k-button-primary-text: var(--_k-directory-primary-color);

  color: var(--_k-directory-text-color);

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
    gap: 0.5rem;
  }

  &__breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 50px;

    margin-bottom: 0.5rem;

    svg {
      color: var(--k-button-primary-text);
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

      .k-directory-item:nth-child(odd) {
        background-color: var(--_k-directory-item-background);
      }

      .k-directory-item:nth-child(even) {
        background-color: var(--_k-directory-item-background-even);
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
      opacity: 0.5;
    }
  }

  &__search {
    position: relative;

    padding-block: var(--k-input-padding-y, var(--k-ui-spacing-sm));
    padding-inline: var(--k-input-padding-x, var(--k-ui-spacing-sm));
    border-radius: var(--k-input-border-radius, var(--k-ui-rounding));
    border: 1px solid var(--k-input-border-color, var(--k-ui-color-neutral));

    background-color: white;
    color: black;

    display: flex;
    align-items: center;
    gap: 0.5em;

    &:focus-within {
      outline: 2px solid var(--k-ui-outline-color);
      outline-offset: var(--k-ui-outline-offset);
    }

    .k-input {
      border: none;
      outline: none;

      &__input {
        padding: 0;
      }
    }
  }
}
</style>
