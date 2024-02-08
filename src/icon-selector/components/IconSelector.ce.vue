<script setup>
import { Button, Dialog, FormControl, Icon, Input } from '@kvass/ui'
import { refDebounced, useCurrentElement } from '@vueuse/core'
import { onBeforeMount, ref, watch } from 'vue'
import { useIconApi } from '../composables/useIconApi.js'
import { getCategorizedIcons } from '../utils.js'

import Collection from './Collection.ce.vue'
import IconButton from './IconButton.ce.vue'

const props = defineProps({
  apiUrl: {
    type: String,
    default: 'https://icons.ui.kvass.no',
  },
  value: String,
  label: String,
})

const { getCollections, getIcons } = useIconApi(props.apiUrl)

const collections = ref()
const collection = ref()
const icons = ref()

const selectedIcon = ref(props.value || '')
const selectedIconUnsaved = ref('')
const selectedCollection = ref('')

function reset() {
  selectedCollection.value = ''
  selectedIconUnsaved.value = ''
}

function selectCollection(prefix) {
  selectedCollection.value = selectedCollection.value === prefix ? '' : prefix
}

const element = useCurrentElement()

watch(selectedIcon, async (icon) => {
  if (!icon) return

  // emit custom event
  element.value.dispatchEvent(
    new CustomEvent('webcomponent:update', {
      detail: { icon },
      bubbles: true,
      composed: true,
    }),
  )
})

watch(selectedCollection, async (c) => {
  if (!c) return
  collection.value = await getIcons({ collection: c })
  icons.value = getCategorizedIcons(collection.value)
})

onBeforeMount(async () => {
  collections.value = await getCollections()
})

// Search
const search = ref('')
const searchDebounced = refDebounced(search, 500)

watch(searchDebounced, async (s) => {
  collection.value = await getIcons({
    collection: selectedCollection.value,
    search: s,
  })
  icons.value = collection.value.icons
})
</script>

<template>
  <div class="kvass-icon-selector">
    <Dialog
      class="kvass-icon-selector__dialog"
      title="Velg ikon"
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
            <Icon v-else :icon="selectedIcon" />
            <Icon
              icon="tabler:selector"
              class="kvass-icon-selector__trigger-icon"
            />
          </button>
        </FormControl>
      </template>

      <template #title="{ titleProps }">
        <strong v-bind="titleProps" style="margin-bottom: 1rem; display: block">
          Velg ikon
        </strong>
        <Input placeholder="Søk" v-model="search" />
      </template>

      <template #default>
        <div>
          <Transition name="fade" mode="out-in">
            <div
              v-if="!selectedCollection"
              style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                overflow-y: auto;
                max-height: 50dvh;
              "
            >
              <Collection
                v-for="(collection, prefix) of collections"
                :key="prefix"
                :collection="collection"
                :prefix="prefix"
                :selected="selectedCollection === prefix"
                @click="selectCollection(prefix)"
              />
            </div>
            <div
              v-else-if="collection"
              style="overflow-y: auto; max-height: 50dvh"
            >
              <div style="position: sticky; top: 0; background: white">
                <button
                  @click="reset"
                  style="background: none; border: none; font: inherit"
                >
                  <Icon icon="tabler:arrow-left" />
                  Gå tilbake
                </button>
                <h3 style="margin-bottom: 0">{{ collection.title }}</h3>
                <p style="opacity: 0.5">{{ collection.total }} ikoner</p>
              </div>
              <section
                v-for="(category, i) in icons"
                :key="category.title || i"
                style="
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
                  grid-column: 1/-1;
                "
              >
                <h4
                  v-if="category.title"
                  style="grid-column: 1/-1; margin-bottom: 0.5rem"
                >
                  {{ category.title }}
                </h4>
                <IconButton
                  v-for="icon in category.icons"
                  :key="icon"
                  :icon="`${selectedCollection}:${icon}`"
                  :selected="
                    selectedIconUnsaved === `${selectedCollection}:${icon}`
                  "
                  @click="selectedIconUnsaved = `${selectedCollection}:${icon}`"
                />
              </section>
            </div>
          </Transition>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="kvass-icon-selector__footer">
          <Button @click="close" variant="tertiary">Avbryt</Button>
          <Button
            @click="
              () => {
                selectedIcon = selectedIconUnsaved
                close()
              }
            "
            variant="primary"
          >
            Bekreft valg
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-icon-selector {
  // Default variables
  --__kvass-icon-selector-background-color: white;
  --__kvass-icon-selector-padding-y: 1rem;
  --__kvass-icon-selector-padding-x: 1rem;
  --__kvass-icon-selector-border-width: 1px;
  --__kvass-icon-selector-border-style: solid;
  --__kvass-icon-selector-border-color: #eaeaea;
  --__kvass-icon-selector-border-radius: 6px;
  --__kvass-icon-selector-max-width: 500px;
  --__kvass-icon-selector-label-color: currentColor;
  --__kvass-icon-selector-label-weight: 400;

  border-radius: var(
    --kvass-icon-selector-border-radius,
    var(--__kvass-icon-selector-border-radius)
  );
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
        --kvass-icon-selector-padding-y,
        var(--__kvass-icon-selector-padding-y)
      )
      var(
        --kvass-icon-selector-padding-x,
        var(--__kvass-icon-selector-padding-x)
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

  &__label {
    color: var(
      --kvass-icon-selector-label-color,
      var(--__kvass-icon-selector-label-color)
    );
    font-weight: var(
      --kvass-icon-selector-label-weight,
      var(--__kvass-icon-selector-label-weight)
    );
    display: block;
    margin-bottom: 0.5rem;
  }

  &__footer {
    width: 100%;
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    align-items: center;
  }

  &__dialog {
    .k-dialog__card {
      --k-dialog-max-width: 1000px;
      --k-dialog-min-width: 100px;
      width: 100%;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all 100ms ease-out;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
