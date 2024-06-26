<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCurrentElement } from '@vueuse/core'
import { DataTable, Input } from '@kvass/ui'

import RowSettings from './RowSettings.ce.vue'
import ColumnSettings from './ColumnSettings.ce.vue'

const element = useCurrentElement()
const main = ref<HTMLDivElement>()
const width = ref(0)

const props = withDefaults(
  defineProps<{
    maxColumns: number
    maxRows: number
    value: string
  }>(),
  {
    value: '',
    maxRows: Infinity,
    maxColumns: Infinity,
  },
)

type Column = {
  columnId: string
  label: string
  id: string
}
type Row = {
  [x: string]: {
    value: string
  }
}

const columns = ref<Column[]>([
  { id: '0', columnId: '0', label: 'Kolonne 1' },
  { id: '1', columnId: '1', label: 'Kolonne 2' },
  { id: '2', columnId: '2', label: 'Kolonne 3' },
])

const rows = ref<Row[]>([
  {
    '0': { value: '' },
    '1': { value: '' },
    '2': { value: '' },
  },
  {
    '0': { value: '' },
    '1': { value: '' },
    '2': { value: '' },
  },
])

//set data from prop value
if (props.value) {
  let v = JSON.parse(props.value) || []

  Object.entries(v).forEach(([key, value]) => {
    if (!value) return
    switch (key) {
      case 'rows':
        rows.value = v.rows
      case 'columns':
        columns.value = v.columns.map((c) => {
          return {
            id: c.columnId,
            ...c,
          }
        })
    }
  })
}

const addColumn = (index: number) => {
  const getColumn = (tempId = 0) => {
    if (columns.value.some((c) => c.columnId === `${tempId}`))
      return getColumn(tempId + 1)
    return tempId
  }

  const columnId = getColumn()

  const newColum = {
    id: `${columnId}`,
    columnId: `${columnId}`,
    label: `Kolonne ${Math.max(columnId, columns.value.length) + 1}`,
  }

  //@ts-ignore
  columns.value.splice(index, 0, newColum)

  rows.value = rows.value.map((i, index) => {
    return {
      ...i,
      [`${columnId}`]: {
        value: ``,
      },
    }
  })
}

const addRow = (index: number) => {
  const item = Object.fromEntries(
    columns.value.map((c) => {
      return [c.columnId, { value: `` }]
    }),
  )

  //@ts-ignore
  rows.value.splice(index, 0, item)
}

const deleteColumn = (id: string) => {
  columns.value = columns.value.filter((i) => i.columnId !== id)

  rows.value = rows.value.map((row) => {
    return Object.fromEntries(
      Object.entries(row).filter(([ID, val]) => id !== ID),
    )
  })
}

const deleteRow = (index: number) => {
  rows.value.splice(index, 1)
}

const style = computed(() => {
  return `--kvass-table-builder-max-width: ${width.value}px; --kvass-table-builder--columns-count: ${columns.value?.length}`
})

const rowWrapper = (item) => {
  return {
    component: 'div',
    bind: {
      class: 'table-builder-row',
    },
  }
}

const cellWrapper = (item) => {
  return {
    component: 'div',
    bind: {
      class: 'table-builder-cell',
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
          columns: columns.map((v) => {
            const { id, ...rest } = v
            return {
              ...rest,
            }
          }),
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

const setWidth = () => {
  const value = main.value?.clientWidth || 0
  if (value > 900) width.value = 900
  else width.value = value
}

onMounted(() => {
  setWidth()
  window.addEventListener('resize', setWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setWidth)
})
</script>

<template>
  <div class="table-builder" ref="main" :style="style">
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
        v-slot:[`${column.columnId}-label`]="{ item }"
      >
        <ColumnSettings
          class="table-builder__column-settings"
          @delete-column="deleteColumn(column.columnId)"
          @add-column-right="addColumn(index + 1)"
          @add-column-left="addColumn(index)"
          :deleteDisabled="columns.length <= 1"
          :addDisabled="columns.length >= maxColumns"
        ></ColumnSettings>

        <Input
          v-model="item.label"
          placeholder="..."
          :class="`cell-${column.columnId}`"
        />
      </template>
      <!-- Rows -->
      <template
        v-for="(column, idx) in columns"
        v-slot:[column.columnId]="{ item, rowIndex }"
      >
        <RowSettings
          v-if="idx === 0"
          class="table-builder__row-settings"
          @delete-row="deleteRow(rowIndex)"
          @add-row-up="addRow(rowIndex)"
          @add-row-down="addRow(rowIndex + 1)"
          :deleteDisabled="rows.length <= 1"
          :addDisabled="rows.length >= maxRows"
        ></RowSettings>

        <Input
          v-if="item[column.columnId]"
          v-model="item[column.columnId].value"
          placeholder="..."
          :class="`cell-${column.columnId}`"
        />
      </template>
    </DataTable>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.table-builder {
  --__kvass-table-builder-border: 1px solid #eaeaea;
  --__kvass-table-builder-wrapper-width: 900px;

  --k-button-secondary-background-hover: hsl(
    var(--secondary-h),
    var(--secondary-s),
    90%
  );
  --k-button-secondary-border: transparent;

  padding: 1rem;
  width: auto;

  &__icon {
    &--left {
      transform: rotate(180deg);
    }
    &--up {
      transform: rotate(270deg);
    }
    &--down {
      transform: rotate(90deg);
    }
    &--right {
      transform: rotate(0deg);
    }
  }

  .k-datatable:not(.k-datatable--no-header) .k-datatable__row:first-child {
    font-size: 1rem;

    .k-input {
      font-weight: bold;
    }
  }
  &__row-settings,
  &__column-settings {
    background-color: hsl(var(--secondary-h), var(--secondary-s), 92%);
  }

  &__row-settings {
    top: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    position: absolute;
    left: 0;
    opacity: 0;

    & + .k-dropdown {
      flex-direction: row !important;
    }

    &:focus {
      opacity: 1;
    }
  }

  &__column-settings {
    top: 0;
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    opacity: 0;

    & + .k-dropdown {
      flex-direction: row !important;
    }

    &:focus {
      opacity: 1;
    }
  }

  .k-datatable {
    border: var(
      --kvass-table-builder-border,
      var(--__kvass-table-builder-border)
    );

    &__cell-sort-icon {
      display: none;
    }
    &__cell {
      padding: 0.5rem;

      position: relative;

      &:hover {
        .table-builder__row-settings,
        .table-builder__column-settings {
          opacity: 1;
        }
      }
    }
  }

  .k-input {
    width: 100%;
    max-width: calc(
      (
          var(
              --kvass-table-builder-max-width,
              var(--__kvass-table-builder-wrapper-width)
            ) / var(--kvass-table-builder--columns-count)
        ) - 1rem
    );
  }

  .k-dropdown {
    padding: 0;
    background-color: hsl(var(--secondary-h), var(--secondary-s), 92%);
    min-width: unset;
  }
}
</style>
