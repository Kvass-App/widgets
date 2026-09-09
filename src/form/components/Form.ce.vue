<script setup>
import { Slugify, Translate } from '../../utils'
import { onMounted, ref, watch, computed } from 'vue'
import { createFormSubmit } from '../api'
import useValidator from '../../composables/useValidator.js'
import {
  Grid,
  Button,
  FormControl,
  Input,
  RadioGroup,
  TextArea,
  Dropdown,
  Checkbox,
  File,
  Alert,
} from '@kvass/ui'
import Number from './Fields/Number'
import Date from './Fields/Date'
import Header from './Fields/Header'
import Position from './Fields/Position.vue'
import Postcode from './Fields/Postcode.vue'
import Postplace from './Fields/Postplace.vue'

import CheckList from './Fields/CheckList'
import { Query } from 'mingo'

function flattenToSingleLevel(
  obj,
  result = {},
  options = { fields: [], exclude: [] },
) {
  const { fields = [], exclude = [] } = options

  for (let key in obj) {
    const currentField = fields.find((i) => i.key === key)
    if (exclude.includes(currentField?.component)) result[key] = obj[key]
    else if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        flattenToSingleLevel(value, result)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

const componentMap = {
  radio: RadioGroup,
  email: Input,
  phone: Input,
  'short-text': Input,
  number: Number,
  'long-text': TextArea,
  dropdown: Dropdown,
  checkbox: Checkbox,
  checklist: CheckList,
  file: File,
  date: Date,
  privacy: 'span',
  header: Header,
  position: Position,
  postcode: Postcode,
  postplace: Postplace,
}

const props = defineProps({
  pageId: {
    type: String,
  },
  pageTitle: {
    type: String,
  },
  title: {
    type: String,
    default: 'Contact',
  },
  description: {
    type: String,
  },
  formId: {
    type: String,
    required: true,
  },
  accountUrl: {
    type: String,
    required: true,
  },

  submitButtonTheme: {
    type: String,
    default: 'secondary',
  },
  privacyPrefix: {
    type: String,
    default: '',
  },
  fields: {
    type: Object,
    default: () => ({}),
  },

  submitTimeout: {
    type: Number,
    default: 5000,
  },
  scopes: {
    type: Array,
    default: () => [],
  },
  mapboxApiToken: {
    type: String,
  },
  mapboxTheme: {
    type: String,
  },
  settings: {
    type: String,
  },
})

const template = ref({})
const data = ref({})
const submitError = ref(false)
const promise = ref(null)
const submitted = ref(false)
const visited = ref([])
const t = (i, options) => Translate(i, 1, options)
const { validator, onChange, getFieldError, isFieldValid } = useValidator(
  t,
  'nb',
)

const hideFormFieldLabelOn = ['checkbox', 'privacy']

function transformKey(key) {
  if (!key) return
  const normalized = key.replaceAll('.', '-')
  // grid-area names are CSS <custom-ident>s and cannot start with a digit.

  return /^[a-z_]/i.test(normalized) ? normalized : `f-${normalized}`
}
//computed
const formIsValid = computed(() => {
  return validator.value.passes
})

const style = computed(() => {
  let layout = formSettings.value?.layout
    ? JSON.parse(formSettings.value?.layout)
    : formFields?.value?.filteredFields.reduce((acc, current, index, array) => {
        const currentArray = acc.split('|').filter(Boolean)
        const prev = currentArray[currentArray?.length - 1]
        const nextValue = array[index + 1]

        let secound = ''
        let prevValues = prev ? prev.split(' ') : []

        const currentKey = transformKey(current.key)
        // scipt if used
        if (prevValues.find((i) => i === currentKey)) return acc

        if (prevValues.length === '2') {
          secound = currentKey
        }
        if (current?.size === 'half') {
          secound = '.'
        }

        if (nextValue?.size === 'half') {
          secound = transformKey(nextValue?.key)
        }

        return (acc = `${acc ? `${acc}|` : ''}${currentKey} ${
          secound || currentKey
        }`)
      }, '')

  let rows = layout.split('|')

  let cols = rows[0]
    .split(' ')
    .map((col) => col.trim())
    .filter(Boolean)
    .map((col) => {
      let [, cols = '1fr'] = col.split(':')
      return cols
    })
    .join(' ')
  let areas = rows
    .map((row) =>
      row
        .split(' ')
        .map((col) => col.trim())
        .filter(Boolean)
        .map((col, index, arr) => {
          let [key] = col.split(':')
          return key
        })
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .map((r) => `"${r}"`)
    .join('\n')

  return {
    '--grid-template-areas': areas,
    '--grid-template-columns': cols,
    '--kvass-form-margin-block': formSettings.value?.marginBlock
      ? `${formSettings.value?.marginBlock}px`
      : '1rem',
    '--kvass-form-margin-inline': formSettings.value?.marginInline
      ? `${formSettings.value?.marginInline}px`
      : '1rem',
    '--kvass-form-font-size': formSettings.value?.fontSize
      ? `${formSettings.value?.fontSize}px`
      : 'inherit',
  }
})

function kebabToCamel(str) {
  return str.replace(/-./g, (match) => match[1].toUpperCase())
}

const formSettings = computed(() => {
  const defaultLabels = {
    submitButtonLabel: 'Send inn',
    restartButtonLabel: t('goBack'),
    formWidth: '700',
    contentLayout: 'vertical',
    successBehavior: 'keepForm',
  }

  let customSettings = JSON.parse(props.settings)

  if (customSettings) {
    customSettings = Object.fromEntries(
      Object.entries(customSettings).map(([key, value]) => {
        return [kebabToCamel(key), value]
      }),
    )
  }

  return {
    ...defaultLabels,
    ...(customSettings || {}),
  }
})

const replacesForm = computed(
  () => formSettings.value?.successBehavior === 'replaceForm',
)

const privacyUrlComp = computed(() => {
  const base = `/legal/privacy`

  if (props.privacyPrefix) {
    return `${props.privacyPrefix}${base}`
  }

  return base
})

function updateValue(key, value) {
  data.value[key] = value
}

function getValidation(item) {
  switch (item.component) {
    case 'email':
      return item.required === 'yes' ? 'required|email' : 'email'
    case 'phone':
      return item.required === 'yes' ? 'required|phone' : 'phone'
    case 'number':
      return item.required === 'yes' ? 'numeric|required' : ''
    case 'checkbox':
      return item.required === 'yes' ? 'accepted' : ''
    case 'postcode':
      return item.required === 'yes' ? ['required', 'postcode'] : ['postcode']
    default:
      return item.required === 'yes' ? 'required' : ''
  }
}

function getFieldOptions(i, key) {
  let base = {
    ...i,
    key,
    options: {
      validation: getValidation(i),
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

  switch (i.component) {
    case 'file':
      base.options.props = {
        upload: async (rawFile) => {
          const url = `${window.location.origin}/api/form/upload`

          const file = await Promise.resolve(rawFile)

          const body = new FormData()
          body.append('file', file)

          return fetch(url, {
            method: 'POST',
            credentials: 'include',
            body,
          })
            .then((res) => {
              if (!res.ok) throw new Error('Upload failed')
              return res.json()
            })
            .catch((err) => {
              throw new Error('Upload failed')
            })
        },
        uploadOptions: { maxSize: '5MB' },
        fileSizeError: t('fileSizeError'),
        'drop-message': t('fileDropAreaMessage'),
        'disable-preview': true,
        rename: false,
        multiple: false,
        required: false,
        labels: {
          delete: t('delete'),
          maxSize: t('maxSize'),
        },
      }
      return base

    case 'checkbox':
      base.options.slot =
        base.required === 'yes'
          ? `<span
          >${base.label}
           <span class='kvass-form__checkbox--required'> * </span>
        </span>`
          : ''

      return base

    case 'position':
      base.options.props = {
        mapboxApiToken: props.mapboxApiToken,
        mapboxTheme: props.mapboxTheme,
      }

      return base
    case 'privacy':
      base.options.slot = `<span  class='kvass-form__privacy'
          >${base.label || t('leadPrivacyInfo', [''])}
          <a  href="${privacyUrlComp.value}" target="_blank">
            ${t('privacyPolicyTitle').toLowerCase()} 
          </a>
        </span>`
      return base

    default:
      return base
  }
}

//functions
const formFields = computed(() => {
  const fields = JSON.parse(props.fields)
    .map((i) => {
      const key = i.key
      if (['lead'].includes(i.component)) {
        const base = {
          size: i.size,
          'hide-label': i?.['hide-label'],
        }
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
            ...base,
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
            ...base,
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
            ...base,
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
            ...base,
          },
          {
            ...getFieldOptions({ component: 'privacy' }, 'privacy'),
          },
        ]
      }
      if (['header'].includes(i.component)) {
        return {
          ...getFieldOptions(i, key),
          options: {
            props: {
              ...(i?.[key] || {}),
            },
          },
        }
      }
      if (['postcode'].includes(i.component)) {
        return [
          {
            key: i.key,
            component: 'postcode',
            label: i.label,
            options: {
              props: {
                placeholder: i?.placeholder,
                type: 'number',
              },
            },
          },
          i.postplace?.include
            ? {
                key: i.postplace?.key || 'postplace',
                component: 'postplace',
                label: i.postplace?.label,
                options: {
                  props: {
                    placeholder: i.postplace?.placeholder,
                    parentKey: i.key,
                  },
                },
              }
            : null,
        ].filter(Boolean)
      } else {
        return getFieldOptions(i, key)
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

const hasLeadFields = computed(() => {
  const fields = JSON.parse(props.fields)
  return (fields || [])?.some((i) => i?.component === 'lead')
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

  visited.value = []
  // set default data
  data.value = template.value
}

function submit() {
  if (!formIsValid.value) return
  submitError.value = false
  const dataToSubmit = {
    ...flattenToSingleLevel(
      data.value,
      {},
      {
        exclude: ['file'],
        fields: formFields.value?.fields,
      },
    ),
    scopes: props.scopes?.length ? JSON.parse(props.scopes) : null,
    referrer: window.location.href,
  }

  promise.value = createFormSubmit(
    props.accountUrl || window.location.origin,
    props.formId,
    {
      ...dataToSubmit,
    },
  )
    .then(() => {
      submitted.value = true

      //emit track events to KvassApi if defined
      if (typeof Kvass !== 'undefined') {
        if (hasLeadFields?.value) {
          Kvass.emit('track', {
            event: 'lead',
            data: dataToSubmit,
          })
        }
        Kvass.emit('track', {
          event: 'form',
          data: dataToSubmit,
        })
        Kvass.emit('track', {
          event: `form:${window?.location?.pathname?.replace('/', '')}`,
          data: dataToSubmit,
        })
      }

      if (!replacesForm.value) {
        setTimeout(() => {
          submitted.value = false
          resetForm()
        }, props.submitTimeout)
      }
    })
    .catch((err) => {
      console.log(err)
      submitError.value = true
      return setTimeout(() => (submitError.value = false), props.submitTimeout)
    })
}

function restart() {
  submitted.value = false
  submitError.value = false
  resetForm()
}

function isFieldVisible(field) {
  let condition = field.condition
  if (!condition) return true

  return new Query(JSON.parse(condition)).test(data.value)
}

function getLabel(key, component) {
  switch (component) {
    case 'dropdown': {
      const current = formFields.value.fields.find((i) => i.key === key)
        ?.options?.props.items

      return (
        (current || []).find((i) => i.id === data.value[key])?.label || 'Velg'
      )
    }
    case 'checkbox': {
      const current = formFields.value.fields.find((i) => i.key === key)
      return current?.label
    }

    default:
      return ''
  }
}
function onBlur(key) {
  if (visited.value.includes(key)) return
  visited.value.push(key)
}

onMounted(() => {
  resetForm()
})
</script>

<template>
  <div
    v-if="formFields.fields?.length"
    class="kvass-form"
    :style="`--kvass-form-max-width: ${formSettings?.formWidth}px;`"
  >
    <div
      :class="[
        'kvass-form__wrapper',
        `kvass-form__wrapper--layout-${formSettings?.contentLayout}`,
      ]"
    >
      <Header
        :title="!formSettings?.hideTitle ? props.title : ''"
        :description="props.description"
        title-tag="h2"
        :center="formSettings?.centerHeading"
      />
      <Grid
        v-if="submitted && replacesForm"
        gap="2rem"
        class="kvass-form__success"
      >
        <Alert variant="info">
          <div
            v-html="
              formSettings?.successMessage || `<p>${t('leadMessageSent')}</p>`
            "
          ></div>
        </Alert>
        <Button
          class="kvass-form__restart-button"
          :label="formSettings?.restartButtonLabel"
          icon-left="fa-pro-solid:arrow-left"
          :variant="submitButtonTheme"
          @click="restart"
        />
      </Grid>
      <form v-else class="kvass-form__form" @submit.prevent="submit">
        <div class="kvass-form__content" :style="style">
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
              :style="{ '--grid-area': transformKey(field?.key) }"
              :label="
                field?.['hide-label'] ||
                hideFormFieldLabelOn.includes(field.component)
                  ? ''
                  : field.label
              "
              :error="
                !isFieldValid(field.key) && visited.includes(field.key)
                  ? getFieldError(field.key)
                  : ''
              "
            >
              <component
                :is="componentMap[field.component]"
                v-bind="field.options?.props"
                v-model="data[field.key]"
                @blur="onBlur(field.key)"
                :label="getLabel(field.key, field.component)"
                :field-key="field.key"
                :data="data"
              >
                <template v-if="field?.options?.slot" #default>
                  <span v-html="field?.options?.slot"></span>
                </template>
              </component>
            </FormControl>
          </template>
        </div>
        <Grid gap="2rem" class="kvass-form__bottom">
          <Alert
            v-if="submitted || submitError"
            :variant="!submitError ? 'info' : 'danger'"
          >
            <div
              v-html="
                !submitError
                  ? formSettings?.successMessage ||
                    `<p>${t('leadMessageSent')}</p>`
                  : `<p>${t('somethingWentWrong')}</p>`
              "
            ></div>
          </Alert>

          <Button
            class="kvass-form__submit-button"
            :label="formSettings?.submitButtonLabel"
            :success-label="t('completed')"
            type="submit"
            icon-right="fa-pro-solid:arrow-right"
            :promise="promise"
            :variant="submitButtonTheme"
            :disabled="!formIsValid || props.formError"
          />
        </Grid>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
@import url('@kvass/ui/style.css');

.kvass-form {
  font-size: var(--kvass-form-font-size);
  background-color: var(--kvass-form-background, transparent);
  padding: var(--kvass-form-padding, 1rem);
  color: var(--kvass-form-text-color, currentColor);
  --_kvass-form-ui-color: var(--kvass-form-ui-color, var(--secondary));

  --_kvass-form-ui-contrast-color: var(
    --kvass-form-ui-contrast-color,
    var(--secondary-contrast)
  );

  --_kvass-form-max-width: var(--kvass-form-max-width, 700px);

  @media (max-width: 767px) {
    padding: 1rem;
  }

  &__checkbox--required {
    color: var(--k-ui-color-danger);
  }
  &__wrapper {
    max-width: var(--_kvass-form-max-width);
    margin-inline: auto;

    &--layout-horizontal {
      display: grid;
      grid-template-columns: var(--kvass-form-layout-columns, 1fr 1fr);
      column-gap: var(--kvass-form-layout-gap, 3rem);
      row-gap: 1rem;
      align-items: start;

      @media (max-width: 767px) {
        grid-template-columns: 1fr;
      }
    }
  }

  &__content {
    display: grid;
    gap: #{var(--kvass-form-margin-block, 1rem)
      var(--kvass-form-margin-inline, 1rem)};
    grid-template-areas: var(--grid-template-areas);
    grid-template-columns: var(--grid-template-columns);
    @media (max-width: 767px) {
      grid-template-areas: unset;
      grid-template-columns: 1fr;
    }
  }

  &__bottom {
    margin-top: 2rem;
  }
  &__restart-button {
    max-width: fit-content;
    margin-inline: auto;
  }
  &__submit-button {
    grid-column-end: span 2;
    max-width: fit-content;
    margin: 2rem auto 0 auto;

    &:disabled {
      background-color: var(
        --kvass-form-submit-button-disabled-background,
        var(--k-ui-color-neutral-light)
      );
      color: var(
        --kvass-form-submit-button-disabled-color,
        hsl(
          var(--k-ui-color-neutral-dark-h),
          var(--k-ui-color-neutral-dark-s),
          calc(var(--k-ui-color-neutral-dark-l) + 40%)
        )
      );
    }
    margin: 0 auto;
  }
  &__privacy {
    font-size: 0.95em;
  }

  &__field {
    display: flex;
    flex-direction: column;
    grid-area: var(--grid-area);
    @media (max-width: 767px) {
      grid-area: unset;
    }

    &--required .k-formcontrol__label {
      &::after {
        content: '*';
        color: var(--k-ui-color-danger);
        margin-left: 0.3rem;
      }
    }
  }
  .k-dropdown-trigger {
    &.k-button--variant-secondary {
      &,
      &:hover {
        border: 1px solid var(--k-input-border-color, var(--k-ui-color-neutral));
        background-color: white;
        color: black;
        border-radius: var(--k-ui-rounding);
      }
    }
  }
  .k-file-thumbnail {
    .k-file-thumbnail__copy,
    .k-file-thumbnail__download {
      display: none;
    }
  }

  .k-formcontrol__label {
    text-transform: var(--kvass-form-label-transform);
    font-weight: var(--kvass-form-label-weight, bold);
  }

  .k-input {
    --k-input-padding-x: var(--kvass-form-padding-inline, 0.75rem);
    --k-input-padding-y: var(--kvass-form-padding-block, 0);
    min-height: 44px;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
  .k-radiogroup--variant-radio {
    --k-radiogroup-accent: var(--_kvass-form-ui-color);
    --k-radiogroup-size: 10px;
    border-width: 5px;

    [data-part='item-control'][data-state='checked'] {
      border-width: 5px;
      outline-color: var(--k-radiogroup-accent);
    }
    [data-part='item-control'] {
      border-width: 5px;
      border-color: transparent;
      outline: 1px solid var(--_kvass-form-ui-color);
    }
  }
  .k-file-droparea {
    color: black;
  }
  b,
  a {
    color: currentColor;
  }
  .k-checkbox {
    display: grid !important;
    grid-template-columns: 1.3rem 1fr;
    --k-checkbox-border-color: var(--_kvass-form-ui-color);
    &[data-state='checked']:not([data-disabled]) [data-part='control'] {
      --k-checkbox-accent: var(--_kvass-form-ui-color);
      --k-checkbox-accent-contrast: var(--_kvass-form-ui-contrast-color);
      --k-checkbox-border-color: var(--_kvass-form-ui-contrast-color);
      border-color: var(--_kvass-form-ui-contrast-color);
    }
    &__label {
      line-height: normal;
    }
  }

  .k-button {
    &--variant-primary {
      border-color: var(--k-button-primary-border, transparent) !important;
    }
  }

  /* Buttons from richtext fields */
  a[data-cta] {
    font-size: var(--k-button-medium-font-size, 1rem);
    padding-block: var(
      --k-button-medium-padding-block,
      calc(var(--k-ui-spacing) * 0.7)
    );
    padding-inline: var(--k-button-medium-padding-inline, var(--k-ui-spacing));
    border-radius: var(--k-button-border-radius, var(--border-radius));
    text-decoration: none;
    display: inline-block;
    line-height: 1;
    border: 1px solid transparent;
  }

  a[data-cta='primary'] {
    color: var(--k-button-primary-text, white);
    border-color: var(--k-button-primary-border, transparent);
    background-color: var(--k-button-primary-background, #3a9acd);

    &:hover {
      background-color: var(--k-button-primary-background-hover);
    }
  }

  a[data-cta='secondary'] {
    color: var(--k-button-secondary-text, white);
    border-color: var(--k-button-secondary-border, transparent);
    background-color: var(--k-button-secondary-background, #3a9acd);

    &:hover {
      background-color: var(--k-button-secondary-background-hover);
    }
  }
  // Reset
  :where(a):not(.k-button) {
    text-decoration: underline;
    text-underline-offset: 3px;

    &:is(:hover, :focus-visible) {
      text-decoration-color: initial;
      text-decoration-thickness: 2px;
    }
  }

  :root {
    --kvass-table-default-table-padding: 0.5rem;
    --kvass-table-default-table-width: 100%
      --kvass-table-default-border-collapse: collapse;
    --kvass-table-default-border: 1px solid var(--kvass-table-default-color);
    --kvass-table-default-background-color-even: white;
    --kvass-table-default-background-color-odd: rgb(239, 239, 239);
    --kvass-table-default-color: black;

    --kvass-table-default-background-color-header: var(--primary-color);
    --kvass-table-default-color: var(--primary-contrast);
  }

  .rich-text-table {
    width: 100%;
    border-collapse: collapse;

    th {
      background-color: var(--primary);
      color: var(--kvass-table-default-color);
      padding: var(--kvass-table-default-table-padding);
      border: var(--kvass-table-default-border);
    }

    td {
      padding: var(--kvass-table-default-table-padding);
      border: var(--kvass-table-default-border);
      background-color: var(--kvass-table-default-background-color-even);
      color: black;
    }
  }
}
</style>
