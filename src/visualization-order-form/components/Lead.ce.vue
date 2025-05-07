<script setup lang="ts">
import { inject, computed, onMounted } from 'vue'
import { FormControl, Input, Flex } from '@kvass/ui'

import {
  GetLabelInjectionKey,
  RootNodeInjectionKey,
  PropsInjectionKey,
} from '../keys'

import { type Order } from '../types'

import Validator from '../composeable/Validator'

const getLabel = inject(GetLabelInjectionKey)!
const root = inject(RootNodeInjectionKey)!
const rootProps = inject(PropsInjectionKey)!

const modelValue = defineModel<Order['lead']>({ default: {} })

const rules = computed(() => {
  const base = {
    name: 'required',
    phone: 'required',
    email: 'required|email',
    'company.name': 'required',
    'company.organizationNumber': 'required',
  }
  return base
})

const labels = computed(() => {
  return {
    name: getLabel('name'),
    phone: getLabel('phone'),
    email: getLabel('email'),
    'company.name': getLabel('companyName'),
    'company.organizationNumber': getLabel('organizationNumber'),
  }
})

const customMessages = computed(() => {
  return {
    required: ':attribute',
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: modelValue,
  customMessages: customMessages,
})

const { bind: validate } = validator

defineExpose({
  validator,
})

const parsedLead = computed(() => {
  try {
    return JSON.parse(rootProps.lead)
  } catch (err) {
    return {}
  }
})

function setIfEmpty(target, key, value) {
  if (!target[key] && value) {
    target[key] = value
  }
}

onMounted(() => {
  const { name, phone, email, company = {} } = parsedLead.value
  const { name: companyName, organizationNumber } = company || {}

  setIfEmpty(modelValue.value, 'name', name)
  setIfEmpty(modelValue.value, 'phone', phone)
  setIfEmpty(modelValue.value, 'email', email)
  setIfEmpty(modelValue.value.company, 'name', companyName)
  setIfEmpty(modelValue.value.company, 'organizationNumber', organizationNumber)
})
</script>

<template>
  <Flex direction="column">
    <h3>{{ getLabel('leadContactForm') }}</h3>
    <FormControl
      :label="getLabel('name')"
      v-bind="validate('name')"
      :disabled="parsedLead.name"
    >
      <Input v-model="modelValue.name" />
    </FormControl>
    <FormControl
      :label="getLabel('phone')"
      v-bind="validate('phone')"
      :disabled="parsedLead.phone"
    >
      <Input v-model="modelValue.phone" />
    </FormControl>
    <FormControl
      :label="getLabel('email')"
      v-bind="validate('email')"
      :disabled="parsedLead.email"
    >
      <Input v-model="modelValue.email" />
    </FormControl>
    <FormControl
      :label="getLabel('companyName')"
      v-bind="validate('company.name')"
      :disabled="parsedLead?.company?.name"
    >
      <Input v-model="modelValue.company.name" />
    </FormControl>
    <FormControl
      :label="getLabel('organizationNumber')"
      v-bind="validate('company.organizationNumber')"
      :disabled="parsedLead?.company?.organizationNumber"
    >
      <Input v-model="modelValue.company.organizationNumber" />
    </FormControl>

    <div v-html="getLabel('acceptPrivacyStatement')"></div>
  </Flex>
</template>

<style lang="scss"></style>
