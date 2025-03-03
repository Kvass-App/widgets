<script setup lang="ts">
import { ref, onMounted, useId, watch } from 'vue'
import { Clone } from '../../utils'
import { Button, Flex, Expandable } from '@kvass/ui'

import 'floating-vue/dist/style.css'
import { vTooltip } from 'floating-vue'

const props = withDefaults(
  defineProps<{
    modelValue: any[]
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

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void
}>()

const internalValue = ref<any>(Clone(props.modelValue))

watch(
  () => [...internalValue.value],
  (newValue, oldValue) => {
    if (!newValue.length) return internalValue.value.push(Clone(props.template))
    if (newValue.length !== oldValue.length) return

    emit('update:modelValue', newValue)
  },
  { deep: true },
)

const ids = ref<any>([])

const getId = (index) => {
  if (!ids.value[index]) ids.value[index] = useId()
  return ids.value[index]
}

const add = () => {
  const newInternalValue = [...internalValue.value, Clone(props.template)]

  internalValue.value = newInternalValue
  emit('update:modelValue', [...newInternalValue])
}

const remove = (index: number) => {
  ids.value.splice(index, 1)

  const newInternalValue = [...internalValue.value]
  newInternalValue.splice(index, 1)
  internalValue.value = newInternalValue
  emit('update:modelValue', [...newInternalValue])
}

const move = (index: number, delta: number) => {
  const id = ids.value.splice(index, 1)[0]
  ids.value.splice(index + delta, 0, id)

  const newinternalValue = [...internalValue.value]
  const item = newinternalValue.splice(index, 1)[0]
  newinternalValue.splice(index + delta, 0, item)
  internalValue.value = newinternalValue
  emit('update:modelValue', [...newinternalValue])
}

onMounted(() => {
  if (!internalValue.value.length)
    internalValue.value.push(Clone(props.template))
})
</script>

<template>
  <Expandable class="expandable-list" :title="title" :subtitle="subtitle">
    <template #actions>
      <slot name="actions">
        <span style="margin-left: auto">
          {{ internalValue.length }}{{ limit ? ` / ${limit}` : '' }}
          {{ internalValue.length >= 2 || limit ? 'felter' : 'felt' }}
        </span>
      </slot>
    </template>
    <template #default>
      <template v-for="(item, index) in internalValue" :key="getId(index)">
        <Flex justify="end" gap="4px" class="expandable-list__actions">
          <Button
            v-tooltip="{ content: 'Fjern' }"
            size="small"
            icon="fa-pro-light:trash"
            @click="remove(index)"
            class="expandable-list__remove"
          />
          <Button
            v-tooltip="{ content: 'Flytt opp' }"
            size="small"
            icon="fa-pro-light:arrow-up"
            :disabled="index === 0"
            @click="move(index, -1)"
            class="expandable-list__move-up"
          />
          <Button
            v-tooltip="{
              content: 'Flytt ned',
            }"
            size="small"
            icon="fa-pro-light:arrow-down"
            :disabled="index === internalValue.length - 1"
            @click="move(index, 1)"
            class="expandable-list__move-down"
          />
        </Flex>

        <Flex direction="column" class="expandable-list__content">
          <slot :item="item" :index="index"></slot>
        </Flex>
      </template>
    </template>
    <template #footer>
      <Button
        v-tooltip="{
          content: 'Maks antall felter lagt til',
          disabled: !(limit && internalValue.length >= limit),
        }"
        variant="tertiary"
        :disabled="limit && internalValue.length >= limit"
        @click="add"
        icon="fa-pro-solid:plus"
        label="Opprett nytt felt"
        class="expandable-list__add"
      >
      </Button>
    </template>
  </Expandable>
</template>

<style lang="scss">
.expandable-list {
  &__actions {
    &:hover {
      & + .expandable-list__content {
        border-radius: var(--k-ui-rounding-sm);
        outline: 2px dashed var(--k-ui-color-neutral-dark);
        outline-offset: 6px;
      }
    }
  }

  .k-expandable__footer {
    --k-expandable-spacing: 0rem;

    .k-button {
      width: 100%;
      --k-button-tertiary-background: #eaeaea;
      padding: 1rem;

      border-top-right-radius: 0;
      border-top-left-radius: 0;
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
