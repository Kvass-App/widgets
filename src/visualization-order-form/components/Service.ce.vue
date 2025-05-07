<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import {
  Image,
  FormControl,
  Input,
  Switch,
  Alert,
  Flex,
  Button,
  Card,
  Dialog,
  RadioGroup,
  TextArea,
} from '@kvass/ui'

import Vimeo from '../../vimeo/components/Vimeo.ce.vue'

import { Clone } from '../../utils'

import { GetLabelInjectionKey } from '../keys'
import { Services } from '../enums'

const getLabel = inject(GetLabelInjectionKey)!

import type { Service } from '../types'

const props = defineProps<{
  modelValue: Service
  item: (typeof Services)[number]
}>()

const service = ref<Service>(Clone(props.modelValue))

const emit = defineEmits<{
  (e: 'update:modelValue', value: Service): void
}>()

const update = (v: Service) => {
  emit('update:modelValue', v)
}

const reset = () => {
  service.value = Clone(props.modelValue)
}
</script>

<template>
  <Card
    appearance="border"
    variant="widget"
    :title="getLabel(item.label)"
    :subtitle="getLabel(item.description)"
    class="k-service"
  >
    <template #thumbnail>
      <Image
        v-if="item.image"
        v-bind="{ aspectRatio: '16/9', size: 'cover', ...item.image }"
      ></Image>

      <Vimeo
        v-if="item.vimeo"
        v-bind="{
          aspectRatio: '16/9',
          videoState: 'play',
          loop: true,
          autoplay: true,
          controls: false,
          mute: true,
          ignoreConsent: true,
          ...item.vimeo,
        }"
      ></Vimeo>
    </template>

    <template #actions>
      <Dialog
        :teleport="false"
        alignment="center"
        @open="reset()"
        @close="reset()"
        :title="getLabel(item.label)"
        :subtitle="getLabel(item.description)"
      >
        <template #trigger="{ triggerProps }">
          <Button
            v-bind="triggerProps"
            :variant="modelValue.selected ? 'primary' : 'secondary'"
            :label="
              modelValue.selected ? getLabel('selected') : getLabel('select')
            "
          />
        </template>
        <template #default>
          <FormControl :label="getLabel('comment')">
            <TextArea v-model="service.comment" :rows="6" />
          </FormControl>

          <div class="k-mt-lg">{{ getLabel('priceNotIncluded') }}</div>
        </template>
        <template #actions="{ close }">
          <Button
            v-if="service.selected"
            :label="getLabel('removeSelected')"
            @click="
              () => {
                update({
                  ...service,
                  comment: '',
                  selected: false,
                })
                close()
              }
            "
          />

          <Button
            :label="getLabel('cancel')"
            @click="
              () => {
                close()
              }
            "
          />
          <Button
            variant="primary"
            :label="getLabel('confirm')"
            @click="
              () => {
                update({
                  ...service,
                  selected: true,
                })
                close()
              }
            "
          />
        </template>
      </Dialog>
    </template>
  </Card>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.k-service {
  // @media (width < 800px) {
  //   &.k-card--variant-horizontal.k-card--has-thumbnail {
  //     grid-template-columns: 1fr !important;
  //     grid-template-areas:
  //       'thumbnail'
  //       'header'
  //       'content'
  //       'actions';
  //   }
  // }

  // &.k-card--variant-horizontal .k-card__actions {
  //   justify-content: end;
  //   // background: linear-gradient(to left, #f8f8f8, #e0e0e0);
  // }
  // &.k-card--variant-horizontal {
  //   grid-template-columns: 400px 1fr !important;
  //   // grid-template-areas:
  //   //     "thumbnail header"
  //   //     "thumbnail content"
  //   //     "thumbnail actions";
  // }
  // &.k-card > .k-card__thumbnail {
  //   // background: linear-gradient(to right, #f8f8f8, #e0e0e0);

  //   background: linear-gradient(
  //     to right,
  //     #f8f8f8 0%,
  //     #e0e0e0 50%,
  //     #f8f8f8 100%
  //   );
  // }
}
</style>
