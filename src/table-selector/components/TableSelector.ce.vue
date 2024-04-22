<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { DataTable, Input } from '@kvass/ui'

import RowSettings from './RowSettings.ce.vue'
import ColumnSettings from './ColumnSettings.ce.vue'

const element = useCurrentElement()

const props = withDefaults(
  defineProps<{
    columns: string
    rows: string
    maxColumns: number
    maxRows: number
  }>(),
  {
    maxRows: Infinity,
    maxColumns: Infinity,
    rows: '[{"0":{"value":"item 1"},"1":{"value":"item 2"},"2":{"value":"item 3"}},{"0":{"value":"item 1"},"1":{"value":"item 2"},"2":{"value":"item 3"}}]',
    columns:
      '[{"id":"0","label":"tittel 1"},{"id":"1","label":"tittel 2"},{"id":"2","label":"tittel 3"}]',
  },
)

type Column = {
  id: string
  label: string
}
type Row = {
  [x: string]: {
    value: string
  }
}

const columns = ref<Column[]>([])

const rows = ref<Row[]>([])

watch(
  () => props.rows,
  () => {
    let v = JSON.parse(props.rows) || []

    rows.value = v instanceof Array ? v : [v]
  },
  {
    immediate: true,
  },
)

watch(
  () => props.columns,
  () => {
    let v = JSON.parse(props.columns) || []

    columns.value = v instanceof Array ? v : [v]
  },
  {
    immediate: true,
  },
)

const addColumn = (index: number) => {
  const length = columns.value.length

  const newColum = {
    id: `${length}`,
    label: `tittel ${length + 1}`,
    disabled: false,
    size: '',
    align: '',
  }

  //@ts-ignore
  columns.value.splice(index, 0, newColum)

  rows.value = rows.value.map((i, index) => {
    return {
      ...i,
      [length]: {
        value: `item ${index + 1}`,
      },
    }
  })
}

const addRow = (index: number) => {
  const item = Object.fromEntries(
    columns.value.map((c, index) => {
      return [c.id, { value: `item ${index}` }]
    }),
  )

  //@ts-ignore
  rows.value.splice(index, 0, item)
}

const deleteColumn = (index: number) => {
  columns.value.splice(index, 1)
}

const deleteRow = (index: number) => {
  rows.value.splice(index, 1)
}

const rowWrapper = (item) => {
  return {
    component: 'div',
    bind: {
      class: 'test',
    },
  }
}

const cellWrapper = (item) => {
  return {
    component: 'div',
    bind: {
      class: 'celltest',
    },
  }
}

watch(
  [rows, columns],
  ([rows, columns]) => {
    // emit custom event
    //@ts-ignore
    element.value.dispatchEvent(
      new CustomEvent('webcomponent:update', {
        detail: {
          rows,
          columns,
        },
        bubbles: true,
        composed: true,
      }),
    )
  },
  {
    deep: true,
  },
)
</script>

<template>
  <DataTable
    :columns="columns"
    :items="rows"
    theme="default"
    :rowWrapper="rowWrapper"
    :cellWrapper="cellWrapper"
  >
    <!-- Columns -->
    <template
      v-for="(column, index) in columns"
      v-slot:[`${column.id}-label`]="{ item }"
    >
      <ColumnSettings
        class="column-settings"
        @delete-column="deleteColumn(index)"
        @add-column-right="addColumn(index + 1)"
        @add-column-left="addColumn(index)"
        :deleteDisabled="columns.length <= 1"
        :addDisabled="columns.length >= maxColumns"
      ></ColumnSettings>

      <!-- <RowSettings
        v-if="index === 0"
        class="row-settings"
        @delete-row="deleteRow(index)"
        @add-row-up="addRow(index)"
        @add-row-down="addRow(index + 1)"
        :deleteDisabled="rows.length <= 1"
        :addDisabled="rows.length >= maxRows"
      ></RowSettings> -->

      <Input v-model="item.label" :class="`cell-${column.id}`" />
    </template>
    <!-- Rows -->
    <template
      v-for="(column, idx) in columns"
      v-slot:[column.id]="{ item, rowIndex }"
    >
      <RowSettings
        v-if="idx === 0"
        class="row-settings"
        @delete-row="deleteRow(rowIndex)"
        @add-row-up="addRow(rowIndex)"
        @add-row-down="addRow(rowIndex + 1)"
        :deleteDisabled="rows.length <= 1"
        :addDisabled="rows.length >= maxRows"
      ></RowSettings>

      <Input v-model="item[column.id].value" :class="`cell-${column.id}`" />
    </template>
  </DataTable>
  <div></div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-datatable__cell {
  position: relative;
}

.k-dropdown {
  min-width: unset;
}

.k-datatable:not(.k-datatable--no-header) .k-datatable__row:first-child {
  font-size: 1rem;

  .k-input {
    font-weight: bold;
  }
}

.k-input {
  width: 100%;
}

.k-datatable__cell-sort-icon {
  display: none;
}

.row-settings {
  top: 50%;
  transform: translate(-100%, -50%);
  position: absolute;
  left: 0;
}

.column-settings {
  top: 0;
  transform: translate(-50%, -100%);
  position: absolute;
  left: 50%;
}
</style>
