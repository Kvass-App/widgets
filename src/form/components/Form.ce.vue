<script setup>
import { Slugify, Translate } from '../../utils'
import { onMounted, ref, watch, computed } from 'vue'
import { createFormSubmit } from '../api'
import useValidator from '../../composables/useValidator.js'
import {
  Card,
  Grid,
  Button,
  Image,
  Icon,
  Flex,
  FormControl,
  Input,
  RadioGroup,
  TextArea,
  Dropdown,
  Checkbox,
  File,
} from '@kvass/ui'
import Number from './Fields/Number'
import Date from './Fields/Date'
import { Query } from 'mingo'

import Privacy from './Fields/Privacy'

const componentMap = {
  privacy: Privacy,
  radio: RadioGroup,
  'short-text': Input,
  number: Number,
  'long-text': TextArea,
  dropdown: Dropdown,
  checkbox: Checkbox,
  checklist: Checkbox,
  file: File,
  date: Date,
}

const props = defineProps({
  title: {
    type: String,
    default: 'Contact',
  },
  formId: {
    type: String,
    required: true,
  },
  accountUrl: {
    type: String,
    required: true,
  },

  actionLabel: {
    type: String,
    default: 'Send inn',
  },
  fields: {
    type: Object,
    default: () => ({}),
  },
})

const template = ref({})
const data = ref({})
const promise = ref(null)
const submitted = ref(false)
const visited = ref([])
const t = (i) => Translate(i)
const { validator, onChange, getFieldError, isFieldValid } = useValidator(
  t,
  'nb',
)

//computed
const formIsValid = computed(() => {
  // data.value?.privacyAccepted &&
  return validator.value.passes
})

const privacyUrlComp = computed(() => {
  // if (props.privacyUrl) return props.privacyUrl
  return `/legal/privacy`
})

//functions
const formFields = computed(() => {
  const fields = JSON.parse(props.fields)
    .map((i) => {
      const key = i.key || Slugify(i.label)
      if (['lead'].includes(i.component)) {
        const placeholder = i['lead-placeholder']
        return [
          {
            key: 'contact.name',
            component: 'short-text',
            label: t('name'),
            options: {
              validation: 'required',
              props: {
                placeholder: placeholder?.name,
              },
            },
          },
          {
            key: 'contact.email',
            component: 'short-text',
            label: t('email'),
            options: {
              validation: 'required|email',
              props: {
                placeholder: placeholder?.email,
              },
            },
          },
          {
            key: 'contact.phone',
            component: 'short-text',
            label: t('phone'),
            options: {
              validation: 'required|phone',
              props: {
                placeholder: placeholder?.phone,
              },
            },
          },
          {
            key: 'comment',
            component: 'long-text',
            label: t('leadMessage'),
            options: {
              props: {
                rows: '6',
                placeholder: placeholder?.comment,
              },
            },
          },
        ]
      } else {
        return {
          ...i,
          key,
          options: {
            validation: i.required === 'yes' ? 'required' : '',
            props: {
              placeholder: i.placeholder,
              items: i.options?.length
                ? i.options.map((o) => {
                    const id = o.key || Slugify(o.option)
                    return {
                      id,
                      label: o.option,
                      action: () => {
                        updateValue(key, id)
                      },
                    }
                  })
                : null,
            },
          },
        }
      }
    })
    .flat()

  const filteredFields = fields.filter((i) => isFieldVisible(i))
  return {
    filteredFields,
    fields: fields,
    labels: Object.fromEntries(filteredFields.map((i) => [i.key, t(i.label)])),
    rules: Object.fromEntries(
      filteredFields
        .filter((item) => item.options?.validation)
        .map((i) => [i.key, i.options?.validation ?? '']),
    ),
  }
})

watch(
  () => data.value,
  (newValue) => {
    onChange(newValue, {
      labels: formFields.value.labels,
      rules: formFields.value.rules,
      data: data.value,
    })
  },
  {
    immediate: true,
    deep: true,
  },
)

function resetForm() {
  template.value = Object.fromEntries(
    (formFields.value.fields || []).map((i) => {
      const defaultValue = ['radio'].includes(i.component)
        ? i?.options?.props?.items?.[0]?.id
        : null
      return [i.key, defaultValue]
    }),
  )

  console.log(template.value)
  // set default data
  data.value = template.value
}

function submit() {
  if (!formIsValid.value) return

  console.log(data.value)
  const dataToSubmit = data.value

  createFormSubmit(props.accountUrl, props.formId, {
    ...dataToSubmit,
  }).then(() => {
    submitted.value = true
    resetForm()
    // setTimeout(() => (submitted.value = false), props.submitTimeout)
  })
}

// function submit() {
//   if (!formIsValid.value) return

//   for (const property in data.value) {
//     updateValue(property, data.value[property])
//   }

//   // only submit fields defined in template
//   const dataToSubmit = convertData(template, Clone(data.value))

//   // set tags from prop
//   if (props.tags.length) dataToSubmit.tags = props.tags

//   promise.value = GqlCreateLead({
//     data: {
//       ...dataToSubmit,
//       reference: reference.value,
//       scopes: scopes.value,
//     },
//     sendBrochure: props.sendBrochure,
//   }).then((leadData) => {
//     if (kvassApi.value) {
//       kvassApi.value.emit('track', {
//         event: 'lead',
//         data: {
//           ...data.value,
//           ...dataToSubmit,
//           [typeLowerCase]: reference.value.ref,
//           reference: reference.value,
//           scopes: scopes.value,
//           id: leadData.LeadCreate.id,
//         },
//       })
//     }

//     submitted.value = true
//     emit('onSubmit')

//     const { comment, ...rest } = data.value
//     sessionStorage.setItem('lead', JSON.stringify(rest))
//     reset()
//   })
// }

function updateValue(key, value) {
  const current = key.replace('contact.', '')
  // if (key.includes('contact')) {
  //   return (data.value.contact = {
  //     ...data.value.contact,
  //     [current]: value,
  //   })
  // }
  data.value[key] = value
}
function isFieldVisible(field) {
  let condition = field.condition
  if (!condition) return true

  return new Query(JSON.parse(condition)).test(data.value)
}

function getLabel(key, component) {
  if (component === 'dropdown') {
    const current = formFields.value.fields.find((i) => i.key === key)?.options
      ?.props.items

    return (
      (current || []).find((i) => i.id === data.value[key])?.label || 'Velg'
    )
  }
  return
}
function onBlur(key) {
  if (visited.value.includes(key)) return
  visited.value.push(key)
}

onMounted(resetForm)
</script>

<template>
  <div v-if="formFields.fields?.length" class="kvass-form">
    <h2>{{ props.title }}</h2>
    {{ validator.errors }}
    <form class="kvass-form__form" @submit.prevent="submit">
      <Grid columns="2">
        <template v-for="field in formFields.filteredFields">
          <FormControl
            :class="[
              'kvass-form__field',
              { 'kvass-form__field--size-half': field.size === 'half' },
              {
                'kvass-form__field--required': (
                  field.options?.validation || ''
                ).includes('required'),
              },
            ]"
            :label="field.label"
            :error="
              !isFieldValid(field.key) && visited.includes(field.key)
                ? getFieldError(field.key)
                : ''
            "
          >
            <component
              :is="componentMap[field.component]"
              v-bind="field.options?.props"
              :model-value="data[field.key]"
              @input="($ev) => updateValue(field.key, $ev.target.value)"
              @blur="onBlur(field.key)"
              :label="getLabel(field.key, field.component)"
            ></component>
          </FormControl>
        </template>

        <Button
          :label="props.actionLabel"
          :success-label="t('completed')"
          type="submit"
          icon-right="fa-pro-solid:arrow-right"
          :promise="promise"
          :variant="'primary'"
          :disabled="!formIsValid"
        />
      </Grid>
    </form>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-form {
  padding: 3rem;
  background-color: rgb(226, 224, 224);
  max-width: 500px;
  margin: 0 auto;

  &__field {
    grid-column-end: span 2;
    &--size-half {
      grid-column-end: span 1;
    }
    &--required .k-formcontrol__label {
      &::after {
        content: '*';
        color: var(--k-ui-color-danger);
        margin-left: 0.3rem;
      }
    }
  }

  .k-radiogroup--variant-radio {
    --k-radiogroup-size: 1rem;
    [data-part='item-control'][data-state='checked'] {
      border-width: 2px;
    }
  }
}
</style>
