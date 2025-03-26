<script setup>
import { Input } from '@kvass/ui'
</script>

<template>
  <Input
    v-bind="$attrs"
    v-on="$listeners"
    :mask="{ mask: Number, unmask: true, thousandsSeparator: ' ' }"
  />
</template>

<style lang="scss"></style>
