<script setup lang="ts">
import { ref, onMounted, useId } from 'vue'
import { Clone } from '../../utils'
import { Button, Flex, Expandable } from '@kvass/ui'

import 'floating-vue/dist/style.css'
import { vTooltip } from 'floating-vue'

const modelValue = defineModel<any>({})

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    limit?: number
    template: any
  }>(),
  {
    title: '',
    subtitle: '',
  },
)

const ids = ref<any>([])

const getId = (index) => {
  if (!ids.value[index]) ids.value[index] = useId()
  return ids.value[index]
}

const add = () => {
  modelValue.value = [...modelValue.value, Clone(props.template)]
}

const remove = (index: number) => {
  ids.value.splice(index, 1)

  modelValue.value = [...modelValue.value.splice(index, 1)]
}

const move = (index: number, delta: number) => {
  const id = ids.value.splice(index, 1)[0]
  ids.value.splice(index + delta, 0, id)

  const newModelValue = [...modelValue.value]
  const item = newModelValue.splice(index, 1)[0]
  newModelValue.splice(index + delta, 0, item)
  modelValue.value = newModelValue
}

onMounted(() => {
  // add item if list is empty
  if (!modelValue.value.length) add()
})
</script>

<template>
  <Expandable class="expandable-list" :title="title" :subtitle="subtitle">
    <template #actions>
      <slot name="actions">
        <span style="margin-left: auto">
          {{ modelValue.length }}{{ limit ? ` / ${limit}` : '' }}
          {{ modelValue.length >= 2 || limit ? 'felter' : 'felt' }}
        </span>
      </slot>
    </template>
    <template #default>
      <template v-for="(item, index) in modelValue" :key="getId(index)">
        <Flex justify="end" gap="4px">
          <Button
            v-tooltip="{ content: 'Fjern' }"
            size="small"
            icon="fa-pro-light:trash"
            :disabled="modelValue.length <= 1"
            @click="remove(index)"
          />
          <Button
            v-tooltip="{ content: 'Flytt opp' }"
            size="small"
            icon="fa-pro-light:arrow-up"
            :disabled="index === 0"
            @click="move(index, -1)"
          />
          <Button
            v-tooltip="{
              content: 'Flytt ned',
            }"
            size="small"
            icon="fa-pro-light:arrow-down"
            :disabled="index === modelValue.length - 1"
            @click="move(index, 1)"
          />
        </Flex>

        <slot :item="item" :index="index"></slot>
      </template>
    </template>
    <template #footer>
      <Button
        v-tooltip="{
          content: 'Maks antall felter lagt til',
          disabled: !(limit && modelValue.length >= limit),
        }"
        variant="tertiary"
        :disabled="limit && modelValue.length >= limit"
        @click="add"
        icon="fa-pro-solid:plus"
        label="Opprett nytt felt"
      >
      </Button>
    </template>
  </Expandable>
</template>

<style lang="scss">
.expandable-list {
  .k-expandable__footer {
    --k-expandable-spacing: 0rem;

    .k-button {
      width: 100%;
      --k-button-tertiary-background: #eaeaea;
      padding: 1rem;

      &__content {
        flex-direction: column;
      }

      &__icon {
        padding: 0.5rem;
        color: white;
        background-color: var(--k-ui-color-primary);
        border-radius: var(--k-ui-rounding-full);

        svg {
          height: 1em;
          width: 1em;
        }
      }
    }
  }
}
</style>
