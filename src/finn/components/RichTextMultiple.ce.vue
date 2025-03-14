<script setup lang="ts">
import { computed } from 'vue'
import { Input, FormControl, RichText } from '@kvass/ui'

import ExpandableList from './ExpandableList.ce.vue'

const props = defineProps<{
  expanded: boolean
  title?: string
  subtitle?: string
}>()

const modelValue = defineModel<string>({ default: '' })

function extractH3Sections(htmlString: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  type Section = { title: string; content: string }

  const sections: Section[] = []
  const h3Elements = doc.querySelectorAll('h3')

  let prevElement = doc.body.firstElementChild
  let preH3Content = ''

  // Capture content before the first <h3>
  while (prevElement && prevElement !== h3Elements[0]) {
    preH3Content += prevElement.outerHTML
    prevElement = prevElement.nextElementSibling
    if (!prevElement || !doc.body.contains(prevElement)) {
      break
    }
  }

  if (preH3Content.trim()) {
    sections.push({ title: '', content: preH3Content })
  }

  h3Elements.forEach((h3, index) => {
    const title = h3.textContent || ''
    let content = ''
    let nextElement = h3.nextElementSibling

    while (nextElement && nextElement.tagName !== 'H3') {
      content += nextElement.outerHTML
      nextElement = nextElement.nextElementSibling
    }

    sections.push({ title, content: content })
  })

  return sections
}

const richText = computed({
  get: () => {
    const sections = extractH3Sections(modelValue.value)

    return sections
  },
  set: (val: any) => {
    modelValue.value = val
      .map((v) => {
        return `<h3>${v.title}</h3>${v.content}`
      })
      .join('')
  },
})

const setRichTextValue = (
  value: string,
  index: number,
  type: 'title' | 'content',
) => {
  const updatedSections = richText.value

  if (!updatedSections.length) updatedSections.push({ title: '', content: '' })

  if (updatedSections[index]) {
    updatedSections[index] = {
      ...(updatedSections[index] || {}),
      [type]: value,
    }
  }

  modelValue.value = updatedSections
    .map(({ title, content }) => {
      return `<h3>${title}</h3>${content}`
    })
    .join('')
}
</script>

<template>
  <ExpandableList
    :expanded="expanded"
    :title="title"
    :subtitle="subtitle"
    :template="{ title: '', content: '' }"
    v-model="richText"
  >
    <template #title v-if="$slots.title">
      <slot name="title"></slot>
    </template>
    <template #actions v-if="$slots.actions">
      <slot name="actions"></slot>
    </template>
    <template #default="{ item: data, index }">
      <FormControl label="Tittel">
        <Input
          :modelValue="data.title"
          @update:modelValue="
            (v) => setRichTextValue(v as string, index, 'title')
          "
        ></Input>
      </FormControl>
      <FormControl label="Tekst">
        <RichText
          :actions="['bold', 'italic', 'orderedList', 'bulletList']"
          :modelValue="data.content"
          @update:modelValue="(v) => setRichTextValue(v, index, 'content')"
          placeholder="Skriv her..."
        >
        </RichText>
      </FormControl>
    </template>
  </ExpandableList>
</template>

<style lang="scss"></style>
