<script setup>
import {
  Button,
  Dialog,
  Flex,
  FormControl,
  Grid,
  GridItem,
  Icon,
  Input,
  Scroller,
  Skeleton,
} from '@kvass/ui'
import { refDebounced } from '@vueuse/core'
import { computed, onBeforeMount, ref, watch, getCurrentInstance } from 'vue'
import { useIconApi } from '../composables/useIconApi.js'

import Collection from './Collection.ce.vue'
import IconButton from './IconButton.ce.vue'
import { Translate } from '../../utils/index.js'

const props = defineProps({
  apiUrl: {
    type: String,
    default: 'https://icons.ui.kvass.no',
  },
  value: String,
  default: String,
  defaultSearch: String,
  label: String,
  collections: {
    type: String,
    default:
      'fa-pro-solid,fa-pro-light,fa-pro-regular,fa-pro-brands,fa-pro-duotone',
  },
  searchPlaceholder: {
    type: String,
    default: Translate('iconSelectWidgetHelpText'),
  },
  featuredIcons: String,
})

const { getCollections, getIcons } = useIconApi(props.apiUrl)

// All collections with minimal metadata
const collections = ref()

// Selected collection and its icons
const collection = ref()

// All icons from the selected collection
const icons = ref()

const loadAllIcons = ref(false)
const allIconsIsLoaded = computed(
  () => icons.value?.length === slicedIcons.value?.length,
)
const slicedIcons = computed(() =>
  loadAllIcons.value ? icons.value : icons.value?.slice(0, 400),
)

const selectedIcon = ref(
  (props.value || props.default || '').replaceAll('"', ''),
)
const selectedIconUnsaved = ref('')
const selectedCollection = ref('')

function reset() {
  selectedCollection.value = ''
  selectedIconUnsaved.value = ''
  search.value = ''
  loadAllIcons.value = false
}

function selectCollection(prefix) {
  selectedCollection.value = selectedCollection.value === prefix ? '' : prefix
}

function update() {
  if (!selectedIconUnsaved.value) return
  selectedIcon.value = selectedIconUnsaved.value
}

const instance = getCurrentInstance()
const element = computed(() => instance?.vnode?.el)

watch(selectedIcon, async (icon) => {
  if (!icon || !element?.value) return

  // emit custom event
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: icon,
      bubbles: true,
      composed: true,
    }),
  )
})

watch(selectedCollection, async (c) => {
  if (!c) return
  collection.value = await getIcons({ collection: c })
  icons.value = collection.value.icons
})

onBeforeMount(async () => {
  collections.value = await getCollections({ collections: props.collections })
})

// Search
const search = ref(props.defaultSearch)
const searchDebounced = refDebounced(search, 500)

watch(
  searchDebounced,
  async (s) => {
    if (s === undefined || s === null) return

    collection.value = await getIcons({
      collection: selectedCollection.value,
      collections: selectedCollection.value || props.collections,
      search: s,
    })

    icons.value = collection.value.icons
  },
  { immediate: true },
)

function iconIsSelected(icon) {
  if (selectedIconUnsaved.value === icon) return true
  if (selectedIcon.value === icon && !selectedIconUnsaved.value) return true
  return false
}

// Featured icons
const featuredIcons = ref(props.featuredIcons?.split(',').map((i) => i.trim()))
</script>

<template>
  <div class="kvass-icon-selector">
    <Dialog
      class="kvass-icon-selector__dialog"
      :title="Translate('selectIcon')"
      :close-on-outside-click="false"
      :teleport="false"
      @close="reset"
    >
      <template #trigger="{ triggerProps }">
        <FormControl :label="label" v-slot="{ id }">
          <button
            :id="id"
            class="kvass-icon-selector__trigger"
            v-bind="triggerProps"
          >
            <span v-if="!selectedIcon"></span>
            <Icon v-else :icon="selectedIcon" style="font-size: 1.25rem" />
            <Icon
              icon="tabler:selector"
              class="kvass-icon-selector__trigger-icon"
            />
          </button>
        </FormControl>
      </template>

      <template #title="{ titleProps }">
        <strong v-bind="titleProps" style="margin-bottom: 1rem; display: block">
          {{ Translate('selectIcon') }}
        </strong>
        <Input :placeholder="searchPlaceholder" v-model="search" />
      </template>

      <template #default>
        <Transition name="fade" mode="out-in">
          <Scroller style="max-height: 50dvh">
            <Grid
              v-if="search"
              gap="0.5rem"
              columns="repeat(auto-fill, minmax(2rem, 1fr))"
            >
              <GridItem>
                <div class="kvass-icon-selector__header">
                  <button
                    @click="reset"
                    style="background: none; border: none; font: inherit"
                  >
                    <Icon icon="tabler:arrow-left" />
                    {{ Translate('goBack') }}
                  </button>
                  <h3
                    v-if="selectedCollection && collection.prefix"
                    style="margin-bottom: 0"
                  >
                    {{ Translate(collection.prefix) }}
                  </h3>
                  <p v-if="collection.total" style="opacity: 0.5">
                    {{ collection.total }}
                    {{ Translate('iconsSelectWidgetIconsFound') }}
                  </p>
                </div>
              </GridItem>
              <template v-if="searchDebounced && slicedIcons?.length">
                <GridItem v-for="icon in slicedIcons" :key="icon">
                  <IconButton
                    :icon="icon"
                    :selected="iconIsSelected(icon)"
                    @click="selectedIconUnsaved = icon"
                  />
                </GridItem>
              </template>
              <template v-else-if="!slicedIcons?.length">
                <GridItem>
                  <div style="grid-column: 1 / -1; text-align: center">
                    {{ Translate('iconsSelectWidgetNoIconsMatchYourSearch') }}
                  </div>
                </GridItem>
              </template>
              <template v-else>
                <GridItem v-for="i in 100" :key="i">
                  <Skeleton height="2rem" width="2rem" rounding="6px" />
                </GridItem>
              </template>
            </Grid>
            <Grid
              v-else-if="!selectedCollection"
              gap="1rem"
              columns="repeat(auto-fill, minmax(200px, 1fr))"
            >
              <GridItem v-if="featuredIcons">
                <Grid
                  style="grid-column: 1/-1; margin-block-end: 1rem"
                  gap="0"
                  columns="repeat(auto-fill, minmax(2.5rem, 1fr))"
                >
                  <small
                    style="
                      grid-column: 1/-1;
                      opacity: 0.5;
                      letter-spacing: 0.5px;
                      margin-block-end: 0.2rem;
                    "
                  >
                    {{ Translate('highlightedIcons') }}
                  </small>
                  <IconButton
                    v-for="icon in featuredIcons"
                    :icon="icon"
                    :selected="iconIsSelected(icon)"
                    @click="selectedIconUnsaved = icon"
                  />
                </Grid>
              </GridItem>
              <GridItem
                v-for="(collection, prefix) of collections"
                :key="prefix"
              >
                <Collection
                  :collection="collection"
                  :prefix="prefix"
                  :selected="selectedCollection === prefix"
                  @click="selectCollection(prefix)"
                />
              </GridItem>
            </Grid>
            <Grid
              v-else-if="collection"
              gap="0"
              columns="repeat(auto-fill, minmax(2.5rem, 1fr))"
            >
              <GridItem>
                <div class="kvass-icon-selector__header">
                  <button
                    @click="reset"
                    style="background: none; border: none; font: inherit"
                  >
                    <Icon icon="tabler:arrow-left" />
                    {{ Translate('goBack') }}
                  </button>
                  <h3 v-if="collection.prefix" style="margin-bottom: 0">
                    {{ Translate(collection.prefix) }}
                  </h3>
                  <p
                    v-if="collection.total"
                    style="opacity: 0.5; margin-block: 0.5rem 1.5rem"
                  >
                    {{ collection.total }} {{ Translate('icon', 2) }}
                  </p>
                </div>
              </GridItem>
              <GridItem v-for="icon in slicedIcons" :key="icon">
                <IconButton
                  :icon="`${selectedCollection}:${icon}`"
                  :selected="iconIsSelected(`${selectedCollection}:${icon}`)"
                  @click="selectedIconUnsaved = `${selectedCollection}:${icon}`"
                />
              </GridItem>
              <GridItem>
                <Flex justify="center" style="grid-column: 1/-1">
                  <Button
                    v-if="!allIconsIsLoaded"
                    variant="secondary"
                    icon-right="tabler:loader"
                    size="small"
                    @click="loadAllIcons = true"
                    :loading="loadAllIcons"
                  >
                    {{ Translate('loadAllElements') }}
                  </Button>
                </Flex>
              </GridItem>
            </Grid>
          </Scroller>
        </Transition>
      </template>

      <template #actions="{ close }">
        <Flex
          align="center"
          justify="end"
          gap="0.5rem"
          class="kvass-icon-selector__footer"
        >
          <Button @click="close" variant="tertiary">{{
            Translate('cancel')
          }}</Button>
          <Button
            @click="
              () => {
                update()
                close()
              }
            "
            variant="primary"
          >
            {{ Translate('confirm') }}
          </Button>
        </Flex>
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-icon-selector {
  // Default variables
  --__kvass-icon-selector-background-color: white;
  --__kvass-icon-selector-trigger-padding-y: 1rem;
  --__kvass-icon-selector-trigger-padding-x: 1rem;
  --__kvass-icon-selector-border-width: 1px;
  --__kvass-icon-selector-border-style: solid;
  --__kvass-icon-selector-border-color: #eaeaea;
  --__kvass-icon-selector-border-radius: 6px;
  --__kvass-icon-selector-max-width: 100%;
  --__kvass-icon-selector-label-color: currentColor;
  --__kvass-icon-selector-label-weight: 400;
  --__kvass-icon-selector-transition-easing: ease-out;
  --__kvass-icon-selector-transition-duration: 100ms;
  --__kvass-icon-selector-z-index: 1009;

  max-width: var(
    --kvass-icon-selector-max-width,
    var(--__kvass-icon-selector-max-width)
  );

  &__trigger {
    cursor: pointer;
    font: inherit;
    text-align: start;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(
      --kvass-icon-selector-padding-x,
      var(--__kvass-icon-selector-padding-x)
    );
    background-color: var(
      --kvass-icon-selector-background-color,
      var(--__kvass-icon-selector-background-color)
    );
    padding: var(
        --kvass-icon-selector-trigger-padding-y,
        var(--__kvass-icon-selector-trigger-padding-y)
      )
      var(
        --kvass-icon-selector-trigger-padding-x,
        var(--__kvass-icon-selector-trigger-padding-x)
      );
    border: var(
        --kvass-icon-selector-border-width,
        var(--__kvass-icon-selector-border-width)
      )
      var(
        --kvass-icon-selector-border-style,
        var(--__kvass-icon-selector-border-style)
      )
      var(
        --kvass-icon-selector-border-color,
        var(--__kvass-icon-selector-border-color)
      );
    border-radius: var(
      --kvass-icon-selector-border-radius,
      var(--__kvass-icon-selector-border-radius)
    );

    &-icon {
      opacity: 0.5;
    }
  }

  .k-formcontrol__label {
    color: var(
      --kvass-icon-selector-label-color,
      var(--__kvass-icon-selector-label-color)
    );
    font-weight: var(
      --kvass-icon-selector-label-weight,
      var(--__kvass-icon-selector-label-weight)
    );
  }

  &__footer {
    width: 100%;
  }

  &__dialog {
    .k-dialog {
      --k-dialog-max-width: 1000px;
      --k-dialog-min-width: 100px;

      &__card {
        width: 100%;
      }

      &__backdrop,
      &__container {
        z-index: var(
          --kvass-icon-selector-z-index,
          var(--__kvass-icon-selector-z-index)
        );
      }
    }
  }

  &__header {
    position: sticky;
    top: 0;
    background: var(
      --kvass-icon-selector-background-color,
      var(--__kvass-icon-selector-background-color)
    );
    grid-column: 1/-1;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all
      var(
        --kvass-icon-selector-transition-duration,
        var(--__kvass-icon-selector-transition-duration)
      )
      var(
        --kvass-icon-selector-transition-easing,
        var(--__kvass-icon-selector-transition-easing)
      );
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
