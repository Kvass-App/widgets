<script lang="ts" setup>
import { useMachine, normalizeProps } from '@zag-js/vue'
import * as select from '@zag-js/select'
import { computed } from 'vue'
import { useCurrentElement } from '@vueuse/core'

const fonts = [
  {
    value: 'Roboto',
    label: 'Roboto',
  },
  {
    value: 'Open+Sans',
    label: 'Open Sans',
  },
  {
    value: 'Lato',
    label: 'Lato',
  },
  {
    value: 'Montserrat',
    label: 'Montserrat',
  },
  {
    value: 'Roboto+Condensed',
    label: 'Roboto Condensed',
  },
  {
    value: 'Oswald',
    label: 'Oswald',
  },
  {
    value: 'Poppins',
    label: 'Poppins',
  },
  {
    value: 'Raleway',
    label: 'Raleway',
  },
  {
    value: 'Slabo+27px',
    label: 'Slabo 27px',
  },
  {
    value: 'Merriweather',
    label: 'Merriweather',
  },
]

const currentElement = useCurrentElement()

const [state, send] = useMachine(
  select.machine({
    id: 'font-selector',
    collection: select.collection({
      items: fonts,
      itemToString: (item) => item.label,
    }),
    getRootNode: currentElement.value?.getRootNode,
  }),
)

const api = computed(() => select.connect(state.value, send, normalizeProps))
</script>

<template>
  <div class="kvass-font-selector">
    <div>
      <label>Teksttype</label>
      <button v-bind="api.triggerProps">
        <span>{{ api.valueAsString || 'Velg teksttype' }}</span>
      </button>
    </div>

    <div v-bind="api.positionerProps">
      <ul v-bind="api.contentProps">
        <li
          v-for="item in fonts"
          :key="item.value"
          v-bind="api.getItemProps({ item })"
        >
          <span>{{ item.label }}</span>
          <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
        </li>
      </ul>
    </div>

    <select v-bind="api.hiddenSelectProps">
      <option
        v-for="item in fonts"
        :key="item.value"
        v-bind="api.getItemProps({ item })"
      ></option>
    </select>
  </div>
</template>
