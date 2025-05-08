<script setup lang="ts">
import { ref, computed, watch, inject, nextTick } from 'vue'
import { GetLabelInjectionKey, RootNodeInjectionKey } from '../keys'

import { toCurrency } from '../../utils'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)

type Line = {
  comment?: string
  description: string
  value: number | string
  type: 'hourly' | 'monthly' | 'fixed' | 'offer'
}

type Item = {
  title: string
  lines: Line[]
}

const props = defineProps<{
  value: Item
}>()

const getSuffix = (line: Line) => {
  switch (line.type) {
    case 'hourly':
      return `/ time`
    case 'monthly':
      return `/ mnd`
    default:
      return ''
  }
}
</script>

<template>
  <div class="subscription-lines">
    <div v-if="value.title" class="subscription-line subscription-line--header">
      <div data-part="description">{{ value.title }}</div>
    </div>
    <div class="subscription-line" v-for="line in value.lines">
      <div data-part="description">
        {{ line.description }}
        <span v-if="line.comment">({{ line.comment }})</span>
      </div>
      <div data-part="value">{{ toCurrency(line.value) }}</div>
      <div data-part="suffix">{{ getSuffix(line) }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.subscription-lines {
  display: grid;
  grid-template-columns: 1fr auto auto;

  --line-space: 0.6em;

  & + & {
    margin-top: var(--k-ui-spacing-xxl);
  }

  .subscription-line {
    display: contents;

    [data-part='description'] {
      padding-right: 2em;

      span {
        margin-left: var(--k-ui-spacing-xxs);
        color: var(--k-ui-color-neutral-dark);
      }
    }

    [data-part='value'],
    [data-part='suffix'] {
      text-align: right;
      vertical-align: baseline;
    }

    [data-part='suffix'] {
      padding-left: 0.25em;
      align-self: flex-end;
    }

    &--footer {
      font-weight: bold;

      [data-part='value'] {
        grid-column-end: span 2;
      }

      & + & [data-part='value']:before {
        content: '+ ';
      }
    }

    &--header {
      font-weight: bold;

      [data-part] {
        padding-bottom: var(--line-space);
        margin-bottom: var(--line-space);
        border-bottom: 1px solid var(--k-ui-color-neutral-light);
        grid-column: 1 / -1;
      }
    }
  }
}
</style>
