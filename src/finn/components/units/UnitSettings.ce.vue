<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dropdown } from '@kvass/ui'

import UnitLinks from './UnitLinks.ce.vue'
import UnitDescription from './UnitDescription.ce.vue'
import UnitFacilities from './UnitFacilities.ce.vue'

const description = ref()
const links = ref()
const facilities = ref()
</script>

<template>
  <!-- @vue-expect-error -->
  <UnitDescription ref="description" v-bind="$attrs" />
  <!-- @vue-expect-error -->
  <UnitLinks ref="links" v-bind="$attrs" />
  <!-- @vue-expect-error -->
  <UnitFacilities ref="facilities" v-bind="$attrs" />

  <Dropdown
    class="unit-table__actions"
    label=""
    theme="shadow"
    variant="secondary"
    :keepOpen="true"
    :teleport="false"
  >
    <template #default="{ close }">
      <Button
        variant="tertiary"
        label="Rediger enhet"
        iconRight="fa-pro-solid:caret-right"
        @click="() => description.open()"
      ></Button>
      <Button
        variant="tertiary"
        label="Rediger lenker"
        iconRight="fa-pro-solid:caret-right"
        @click="() => links.open()"
      ></Button>
      <Button
        variant="tertiary"
        label="Rediger fasiliteter"
        iconRight="fa-pro-solid:caret-right"
        @click="() => facilities.open()"
      ></Button>
    </template>
  </Dropdown>
</template>

<style lang="scss"></style>
