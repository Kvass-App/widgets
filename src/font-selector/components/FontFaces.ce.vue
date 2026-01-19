<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { FormControl, File, Flex, Button, Input, Dropdown } from '@kvass/ui'
import { VueComponentUpload as upload } from '@kvass/storage'
import { Translate } from '../../utils/index.js'

type FontFace = {
  value: undefined | { url?: string }
  fontWeight?: string
}

const template: FontFace = { value: undefined, fontWeight: '' }

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: Array as () => FontFace[],
})

// Initialize items from props.modelValue
const items = ref<FontFace[]>(
  props.modelValue && props.modelValue.length
    ? props.modelValue.map((item) => ({ ...item }))
    : [{ ...template }],
)

const fontWeightItems = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
]

function add() {
  items.value.push({ ...template })
}

function remove(index: number) {
  items.value.splice(index, 1)
}

// Emit changes to parent
watch(
  () => items.value,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true },
)
</script>

<template>
  <Flex direction="column" class="font-selector-font-faces">
    <Flex
      direction="column"
      class="font-selector-font-faces__item"
      v-for="(item, index) in items"
    >
      <FormControl :label="'Font weight'">
        <Dropdown
          :label="item.fontWeight || '...'"
          :items="
            fontWeightItems.map((v) => {
              return {
                label: v,
                action: () => (item.fontWeight = v),
              }
            })
          "
          class="brochure brochure__multiple dropdown-trigger"
        />
        <!-- <Input type="number" v-model="item.fontWeight" placeholder="400">
        </Input> -->
      </FormControl>

      <FormControl :label="Translate('uploadFont')">
        <File
          v-model="item.value"
          :uploadOptions="{}"
          :upload="upload"
          accept=".ttf"
          :rename="false"
          :multiple="false"
          :download="false"
          :dropMessage="Translate('fileDropAreaMessage')"
          :labels="{
            delete: Translate('delete'),
            copy: Translate('copy'),
          }"
        ></File>
      </FormControl>

      <Flex gap="0.5rem" class="font-selector-font-faces__item-actions">
        <Button
          v-if="index > 0"
          class="font-selector-font-faces__item-remove"
          icon-right="fa-pro-regular:trash"
          @click="remove(index)"
        ></Button>
        <Button icon-right="fa-pro-regular:plus" @click="add"></Button>
      </Flex>
    </Flex>
  </Flex>
</template>

<style lang="scss">
.font-selector-font-faces {
  align-items: start;
  .k-file {
    --k-file-thumbnail-size: 2.5rem;
    font-size: 0.9em;
    &-thumbnail__download {
      display: none;
    }
    .k-dropdown-trigger {
      border-left: none !important;
      padding: 0.5em;
    }
  }
  &__item {
    --k-button-border-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    padding: 1rem;
    border: 1px solid var(--k-ui-color-neutral);
    border-radius: var(
      --kvass-font-selector-border-radius,
      var(--__kvass-font-selector-border-radius)
    );
    &-actions {
      align-self: flex-end;
      justify-content: space-between;
      .k-button {
        background: var(--k-ui-color-neutral-lightest);
      }
    }
  }
}
</style>
