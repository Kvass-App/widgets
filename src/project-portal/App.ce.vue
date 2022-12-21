<template>
  <!-- <Loader :value="promise">  -->
  <div
    v-if="promiseDone"
    class="project-selector"
    :class="`project-selector--theme-${theme}`"
  >
    <div
      v-if="!disableNav || !navItems.length"
      class="project-selector__navigation"
    >
      <CategorySelector
        class="project-selector__navigation-category"
        v-if="navItems.length"
        :items="navItems"
        :value="category"
        @input="
          ($ev) => {
            category = $ev
            filterItems()
          }
        "
      />

      <ProjectTypeSelector
        v-if="projectTypes.length > 1"
        :trigger-label="triggerLabel"
        class="project-selector__navigation-project-type"
        :items="projectTypes"
        :value="projectType"
        @input="
          ($ev) => {
            projectType = $ev
            filterItems()
          }
        "
      />
    </div>

    <transition-group
      v-if="items && items.length"
      tag="div"
      name="list"
      appear
      class="project-selector__card"
    >
      <Card
        v-for="(item, index) in items"
        :disable-label="disableNav"
        :key="index"
        :item="item"
        theme="border"
      />
    </transition-group>

    <div class="project-selector__no-result" v-else>Ingen resultater</div>
  </div>
  <!-- </Loader>  -->
</template>

<script>
export default {
  created() {
    this.fetch()
  },
}
</script>

<script setup>
import { ref, computed } from 'vue'

import Card from './components/Card.ce.vue'
import CategorySelector from './components/CategorySelector.ce.vue'
import ProjectTypeSelector from './components/ProjectTypeSelector.ce.vue'
// import { LoaderComponent as Loader } from 'vue-elder-loader'

import { getProjects } from './api'

function getSortValue(type, value) {
  switch (type) {
    case 'status':
      switch (value[type]) {
        case 'sale':
          return 2
        case 'upcoming':
          return 1
        default:
          return 0
      }
    case 'name':
      return value[type]
  }
}

const props = defineProps({
  source: {
    type: String,
    default: 'https://feature.kvass.no',
  },
  startCategory: {
    type: String,
    default: 'all',
    enums: ['all', 'sale', 'upcoming', 'development', 'sold'],
  },
  enabledCategories: {
    type: String,
    default: 'all,sale,upcoming,development,sold',
  },
  theme: {
    type: String,
    enum: ['default', 'tiles'],
    default: 'default',
  },
  sortOn: {
    type: String,
    enum: ['status', 'name'],
    default: 'status',
  },
  triggerLabel: {
    type: String,
    default: 'Velg type',
  },
  disableNav: {
    type: Boolean,
    default: false,
  },
})

const category = ref('')
const projectType = ref('none')
const items = ref([])
var allItems = []
const promise = ref(null)
const promiseDone = ref(false)

const navItems = computed(() => {
  return [
    ...props.enabledCategories.split(',').filter((i) => {
      if (i === 'all') return true
      return allItems.find((k) => k.status.includes(i))
    }),
  ]
})

const projectTypes = computed(() => {
  let types = ['none'].concat(
    allItems.map((i) => {
      if (i.customFields && i.customFields['project-type'])
        return i.customFields['project-type']
    }),
  )

  return [...new Set(types || [])].filter(Boolean)
})

function filterItems() {
  items.value = allItems
    .filter((i) => {
      if (category.value === 'all') return true
      return i.status.includes(category.value)
    })
    .filter((i) => {
      if (!projectTypes.length || projectType.value === 'none') return true
      if (!i.customFields || !i.customFields['project-type']) return
      return i.customFields['project-type'].includes(projectType.value)
    })
}

function getFromSource() {
  if (props.source) return getProjects(props.source)
  return Promise.resolve()
}

function getStatus(item) {
  if (item.status) return item.status
  let total = item.stats.total
  if (item.isPublished && total && !item.stats.sale) return 'sold'
  if (item.isPublished && total) return 'sale'
  if (item.isPublished && !total) return 'upcoming'
  if (!item.isPublished) return 'development'
  return 'development'
}

function fetch() {
  promise.value = getFromSource()
    .then(async (data) => {
      let items = []
      //read from global customItems
      if (typeof customItems !== 'undefined') {
        items =
          typeof customItems === 'function' ? await customItems() : customItems
      }
      //remove kvass projects that is defined in customItems
      let kvassProjects = data
        ? data.Projects.filter((item) => {
            if (items.find((i) => (i.id ? i.id.includes(item.id) : undefined)))
              return
            return item
          })
        : []

      allItems = [...kvassProjects, ...items]

      return (allItems = allItems
        .map((item) => {
          item.status = getStatus(item)
          return {
            intro: item.customFields ? item.customFields['project-intro'] : '',
            ...item,
            sortVale: getSortValue(props.sortOn, item),
            url: item.url,
          }
        })
        .sort((a, b) => {
          switch (props.sortOn) {
            case 'status':
              if (a.sortVale < b.sortVale) return 1
              if (a.sortVale > b.sortVale) return -1
          }
        })
        .filter((i) => props.enabledCategories.split(',').includes(i.status)))
    })
    .then(() => {
      category.value = props.startCategory
      items.value = allItems
      promiseDone.value = true
    })
}
</script>

<style lang="scss">
@import './styles/_variables';
.project-selector {
  $gap: 1.5rem;
  &__navigation {
    display: flex;
    justify-content: var(--kvass-project-selector-nav-position, center);
    padding: 0 2rem;
    padding-bottom: 3rem;
    gap: $gap;
    @media (max-width: $kvass-project-selector-resposive) {
      flex-direction: column-reverse;
      justify-content: center;
      gap: $gap - 1rem;
    }
    &-category {
      display: flex;
      justify-content: center;
      gap: $gap;
      @media (max-width: $kvass-project-selector-resposive) {
        flex-direction: column;
        gap: $gap - 1rem;
        align-items: center;
      }
    }
  }
  &__card {
    position: relative;
    display: grid;
    grid-template-columns: repeat(
      var(--kvass-project-selector-grid-columns, 4),
      1fr
    );
    gap: var(--kvass-project-selector-grid-gap, 2rem);
    @media (max-width: $kvass-project-selector-resposive) {
      grid-template-columns: 1fr;
      padding-top: 2rem;
    }
  }
  &__no-result {
    font-size: 1.2em;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    margin: 2rem 0;
    background-color: GetVariable('light-grey');
    @media (max-width: $kvass-project-selector-resposive) {
      min-height: 100px;
    }
  }
  .list {
    &-leave-active {
      position: absolute;
    }
    &-move,
    &-enter-active,
    &-leave-active {
      transition: all 500ms ease;
    }
    &-enter {
      transform: scale(0.95);
    }
    &-enter,
    &-leave-to {
      opacity: 0;
    }
  }
}
// tiles theme
.project-selector--theme-tiles {
  .project-selector__card {
    grid-template-columns: repeat(
      var(--kvass-project-selector-grid-columns, 2),
      1fr
    );
    gap: var(--kvass-project-selector-grid-gap, 0rem);
    @media (max-width: $kvass-project-selector-resposive) {
      grid-template-columns: 1fr;
      padding-top: 2rem;
    }
  }
}
</style>
