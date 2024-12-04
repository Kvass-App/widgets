<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import {
  FormControl,
  Button,
  DataTable,
  Flex,
  Icon,
  Input,
  Checkbox,
  Switch,
  RadioGroup,
  Grid,
  Stepper,
} from '@kvass/ui'

const props = withDefaults(
  defineProps<{
    integrationId: string
    tenant: string
    token: string
    user: string
  }>(),
  {
    integrationId: '',
    tenant: '',
    token: '',
    user: '',
  },
)

// Mutate eller create og update, hvordan skiller jeg mellom?

type State = 'dashboard' | 'create' | 'update' | 'mutate' | ''

const state = ref('dashboard')
</script>

<template></template>

<style lang="scss">
@import url('@kvass/ui/style.css');
</style>
