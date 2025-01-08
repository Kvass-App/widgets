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
  Card,
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

<template>
  <Card
    title="Dine Finn-annonser"
    subtitle="Her får du en oversikt over dine Finn-annonser."
    variant="default"
    appearance="shadow"
  >
    <template #default>
      <div>test</div>
      <!-- <Card title="test 2" appearance="shadow">
        <template #default>
          <div>Body</div>
        </template>
      </Card> -->
    </template>
    <template #actions>
      <Button>actions</Button>
    </template>
  </Card>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');
</style>
