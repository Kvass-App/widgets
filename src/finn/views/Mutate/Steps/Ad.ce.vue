<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  inject,
  type WatchHandle,
} from 'vue'
import {
  Input,
  FormControl,
  Flex,
  Grid,
  Card,
  Alert,
  Expandable,
  Media,
  Button,
  Icon,
  Checkbox,
  Spinner,
  File,
  Dropdown,
  RichText,
  Switch,
  Dialog,
  Image,
} from '@kvass/ui'

import 'floating-vue/dist/style.css'
import { vTooltip } from 'floating-vue'

import UnitTable from '../../../components/units/UnitTable.ce.vue'
import ExpandableList from '../../../components/ExpandableList.ce.vue'
import RichTextMultiple from '../../../components/RichTextMultiple.ce.vue'

import { Clone, uploadFunction, hasDiff } from '../../../../utils/index.js'

import Validator from '../../../composeable/Validator'

import ProjectFacilities from '../../../enums/ProjectFacilities.ts'
import Facilities from '../../../enums/Facilities.ts'
import Properties from '../../../enums/PropertyType.ts'
import OwnershipTypes from '../../../enums/OwnershipTypes.ts'
import LeisureSituation from '../../../enums/LeisureSituation.ts'
import { energyLabel, energyLabelColor } from '../../../enums/EnergyLabels.ts'

import { type Ad } from '../../../types/ad'
import { type Webcomponent } from '../../../types/webcomponent'

import { PropsInjectionKey } from '../../../keys'
import { useAPI, type Fields } from '../../../api'

import { useCurrentElement } from '@vueuse/core'
const element = useCurrentElement()

const API = useAPI(element)

const webcomponentProps = inject<Webcomponent>(
  PropsInjectionKey,
) as Webcomponent

const props = defineProps<{
  onNext: any
  onPrev: any
}>()

const modelValue = defineModel<Ad>({ default: {} })

const reset = () => {
  modelValue.value.fields = {}
  modelValue.value.units.forEach((u) => (u.fields = {}))

  getData()
}

const displayProperties = computed(() => {
  return Properties.filter(
    (v) =>
      v.categories.includes(modelValue.value.type as any) &&
      (v.condition ? v.condition(modelValue.value) : true),
  )
})

const data = ref<Ad['fields']>({})
const initialFields = ref<Ad['fields']>({})

const units = ref<Fields['units']>([])
const initialUnitFields = ref<Fields['fields'][]>([])

const fetching = ref(true)
const watcherCleanups = ref<WatchHandle[]>([])

const rules = ref<Record<string, string>>({})
const labels = ref<Record<string, string>>({})

const validatorData = computed(() => {
  return {
    ...data.value,
    units: units.value.map((v) => v.fields),
  }
})

const customMessages = computed(() => {
  return {
    required_if: 'Feltet ":attribute" er påkrevd når ":other" er avhuket',
  }
})

const validator = Validator({
  rules: rules,
  labels: labels,
  data: validatorData,
  customMessages: customMessages,
})

const { bind: validate } = validator

const brokerError = computed(() => {
  const totalBrokers = (data.value.BROKER || []).length
  if (!totalBrokers) return 'Kundebehandler er påkrevd'

  return Array.from({ length: totalBrokers }, (_, index) => {
    return validator.errors.value.errors[`BROKER.${index}.PHONE`]
  })
    .filter(Boolean)
    .flat()
    .join('')
})

const addressError = computed(() => {
  const addressErrors = [
    'MAP_COORDINATE.EASTING',
    'MAP_COORDINATE.NORTHING',
    'STREETADDRESS',
    'ZIPCODE',
  ].some((v) => {
    return validator.errors.value.errors[v]
  })

  return addressErrors ? 'Adresse og koordinater er påkrevd' : ''
})

const hasField = (field) => Boolean(data.value.hasOwnProperty(field))

const hasFields = (...args) => args.some(hasField)

const isEdited = (field) => modelValue.value.fields.hasOwnProperty(field)

const getIsEditedIcon = (field) => {
  return isEdited(field)
    ? 'fa-pro-regular:cloud-xmark'
    : 'fa-pro-regular:cloud-check'
}

const getData = () => {
  fetching.value = true

  return API.fields(modelValue.value)
    .then((value) => {
      initialFields.value = Clone(value.fields)

      // TODO, Partial update ?
      // Hva om man går fram og tilbake ?
      data.value = Clone({ ...value.fields, ...modelValue.value.fields })

      watcherCleanups.value.forEach((watcherCleanup) => watcherCleanup())
      watcherCleanups.value = []

      Object.keys(value.fields).forEach((key) => {
        const watcherCleanup = watch(
          () => data.value[key],
          (newValue, oldValue) => {
            modelValue.value.fields[key] = newValue

            if (
              !hasDiff({ value: newValue }, { value: initialFields.value[key] })
            ) {
              delete modelValue.value.fields[key]
            }
          },
          { deep: true },
        )
        watcherCleanups.value.push(watcherCleanup)
      })

      initialUnitFields.value = Clone(value.units.map((v) => v.fields))

      units.value = Clone(
        value.units.map((v, index) => {
          return {
            ...v,
            fields: {
              ...v.fields,
              // Todo, er index alltid riktig ? eller må man bruke find ? fallback ?
              ...modelValue.value.units[index].fields,
            },
          }
        }),
      )

      const unitRules = value.units
        .map((v) => v.rules)
        .map((r) => {
          return Object.fromEntries(
            Object.entries(r).map(([k, v]) => {
              return [`units.*.${k}`, v]
            }),
          )
        })

      const unitLabels = value.units.map(
        (
          { fields: unitFields, labels: unitLabels, rules: unitRules },
          index,
        ) => {
          const unitName = `Enhet ${unitFields.HOUSING_UNIT_REF || index + 1}`

          return Object.fromEntries(
            Object.entries(unitLabels).map(([k, v]) => {
              return [`units.${index}.${k}`, `${unitName} ${v}`]
            }),
          )
        },
      )

      rules.value = Object.assign({}, value.rules, ...unitRules)

      labels.value = Object.assign({}, value.labels, ...unitLabels)
    })
    .catch((err) => {
      console.error(err)
      props.onPrev()
    })
    .finally(() => (fetching.value = false))
}

const getNextLabel = () => {
  if (
    !modelValue.value.id ||
    modelValue.value.preview ||
    !modelValue.value.code
  )
    return 'Generer forhåndsvisning'

  return 'Neste'
}

const getProjectStepUrl = (step: string) => {
  const url = new URL(
    `${webcomponentProps.tenant}/projects/${webcomponentProps.project}/edit/${step}`,
  )

  return url.toString()
}

function onTabChange() {
  if (document.visibilityState === 'visible') {
    getData() // Refetch when user comes back
  }
}

const formContainer = ref()

const editDialogAccepted = ref(
  Object.keys(modelValue.value.fields).length ? true : false,
)
const editDialog = ref()

function onFocus(e) {
  if (e.target.classList.contains('k-expandable__header')) return
  editDialog.value.open()
}

const setExpandableElements = (state: boolean) => {
  //@ts-ignore
  const items = element.value.querySelectorAll('.k-expandable--expandable')

  items.forEach((el) => {
    state
      ? el.addEventListener('focusin', onFocus)
      : el.removeEventListener('focusin', onFocus)
  })
}
const deleteFocusEvents = () => {
  setExpandableElements(false)
}

const acceptEditDialog = () => {
  editDialogAccepted.value = true

  deleteFocusEvents()
}

onMounted(() => {
  window.addEventListener('visibilitychange', onTabChange)
  getData().then(() => {
    if (editDialogAccepted.value) return

    setExpandableElements(true)
  })
})

onUnmounted(() => {
  window.removeEventListener('visibilitychange', onTabChange)
  deleteFocusEvents()
})

const savingDraftPromise = ref()
const loading = ref()

const saveDraft = () => {
  savingDraftPromise.value = new Promise((resolve, reject) => {
    loading.value = true

    API.publish(modelValue.value, { publish: false }).then((response) => {
      response.on('message', (data) => {
        if (data.id) {
          modelValue.value.id = data.id
        }

        response.on('error', (data) => {
          reject(data)
        })

        response.on('finished', () => {
          response.cancel()
          resolve(modelValue.value.id)
          loading.value = false
        })
      })
    })
  })
}
</script>

<template>
  <div class="ad" ref="formContainer">
    <Dialog
      :teleport="false"
      ref="editDialog"
      title="Du er i ferd med å tilpasse annonsen"
      variant="prompt"
    >
      <template #trigger="{ triggerProps }">
        <Button v-bind="triggerProps" style="display: none"></Button>
      </template>
      <template #default>
        <p>
          Du er nå i ferd med å tilpasse annonsen. Når dette gjøres vil du se at
          dette ikonet skifer til et annet, dette ikonet indikerer at dette
          feltet, ikke lengre henter informasjon fra prosjektsiden.
        </p>
        <Image
          src="https://assets.kvass.no/67aa2b433aee3cb55c8e7408"
          size="contain"
          width="100%"
          aspectRatio="16/9"
        ></Image>
      </template>
      <template #actions="{ close }">
        <Button label="Nei, ta meg tilbake" @click="close"></Button>
        <Button
          label="Ja, den er grei!"
          variant="primary"
          @click="
            () => {
              acceptEditDialog()
              close()
            }
          "
        ></Button>
      </template>
    </Dialog>
    <Alert
      title="Tilpasset annonse eller automatisert annonse"
      variant="info"
      class="ad__alert"
      icon="fa-pro-regular:exclamation-circle"
    >
      <template #default>
        <p style="margin-top: 0">
          Basert på informasjon du har fylt ut til prosjektsiden har vi
          opprettet en Finn-annonse basert på dette.
        </p>
        <p>
          Dersom du ønsker å tilpasse prosjektet med nye bilder og tekster, vær
          klar over at prosjektsiden og Finn-annonsen ikke lengre vil
          synkroniseres. Det betyr at dersom du endrer tekst under
          prosjektsiden, for eksempel under steget presentasjon, vil det ikke
          automatisk oppdateres på Finn.no.
        </p>
        <p>
          Om du ønsker å benytte den ferdigutfylte Finn-annonsen vi tilbyr
          trenger du ikke gjøre endringer på denne siden. Dersom du tidligere
          har gjort endringer og ønsker å tilbakestille til vår ferdig utfylte
          annonse kan du gjøre dette under knappen "Handlinger" og "Tilbakestill
          innhold"
        </p>
      </template>
    </Alert>

    <KeepAlive>
      <Flex
        v-if="fetching"
        justify="center"
        style="background-color: whitesmoke"
        class="k-py-3xl"
      >
        <Spinner size="large"></Spinner>
      </Flex>

      <Card variant="prompt" appearance="shadow" v-else>
        <template #header>
          <div class="k-card__title ad__title">
            <span>Innhold i Finn-annonsen</span>

            <Button
              class="ad__go-back"
              icon="fa-pro-light:chevron-left"
              label="Gå tilbake"
              variant="secondary"
              @click="onPrev"
            />

            <Button
              class="ad__reset"
              label="Tilbakestill innhold"
              variant="secondary"
              @click="reset"
            ></Button>
          </div>
          <div class="k-card__subtitle">
            <div>
              Her kan du få et overblikk over informasjonen som sendes til Finn,
              og hvor den finnes i løsningen.
            </div>
            <div>Her kan du også justere detaljer tilknyttet din annonse.</div>
          </div>
        </template>

        <template #default>
          <Flex direction="column" gap="2rem">
            <Expandable
              :expanded="true"
              :title="
                hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                  ? 'Hovedtittel og undertittel'
                  : 'Hovedtittel'
              "
              :subtitle="
                hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                  ? 'Teksten som formuleres her vil bli synlig som hovedtittel og undertittel på Finn-annonsen'
                  : 'Teksten som formuleres her vil bli synlig som hovedtittel på Finn-annonsen'
              "
              v-if="hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF', 'HEADING')"
            >
              <template #default>
                <FormControl
                  v-if="hasField('HOUSING_UNIT_REF')"
                  v-bind="validate('HOUSING_UNIT_REF')"
                  label="Hovedtittel for annonsen"
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('HOUSING_UNIT_REF') },
                  ]"
                >
                  <Input v-model="data.HOUSING_UNIT_REF">
                    <template #suffix>
                      <Icon :icon="getIsEditedIcon('HOUSING_UNIT_REF')"></Icon>
                    </template>
                  </Input>
                </FormControl>

                <FormControl
                  v-if="hasField('PROJECT_NAME')"
                  v-bind="validate('PROJECT_NAME')"
                  label="Hovedtittel for annonsen"
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('PROJECT_NAME') },
                  ]"
                >
                  <Input v-model="data.PROJECT_NAME">
                    <template #suffix>
                      <Icon :icon="getIsEditedIcon('PROJECT_NAME')"></Icon>
                    </template>
                  </Input>
                </FormControl>
                <!-- 
              <FormControl
                v-if="hasField('BOLIGNUMMER')"
                v-bind="validate('BOLIGNUMMER')"
                label="Hovedtittel for annonsen"
                :class="[
                  'ad__field',
                  { 'ad__field--edited': isEdited('BOLIGNUMMER') },
                ]"
              >
                <Input v-model="data.BOLIGNUMMER">
                  <template #suffix>
                    <Icon :icon="getIsEditedIcon('BOLIGNUMMER')"></Icon>
                  </template>
                </Input>
              </FormControl> -->

                <FormControl
                  v-if="hasField('HEADING')"
                  v-bind="validate('HEADING')"
                  :label="
                    hasFields('PROJECT_NAME', 'HOUSING_UNIT_REF')
                      ? 'Undertittel'
                      : 'Hovedtittel'
                  "
                  :class="[
                    'ad__field',
                    { 'ad__field--edited': isEdited('HEADING') },
                  ]"
                >
                  <Input v-model="data.HEADING">
                    <template #suffix>
                      <Icon :icon="getIsEditedIcon('HEADING')"></Icon>
                    </template>
                  </Input>
                </FormControl>
              </template>
            </Expandable>

            <Expandable :expanded="true" title="Nøkkelinformasjon" subtitle="">
              <template #default>
                <Grid columns="2">
                  <FormControl
                    v-if="
                      hasFields('PROPERTY_TYPE') &&
                      !Array.isArray(data.PROPERTY_TYPE)
                    "
                    v-bind="validate('PROPERTY_TYPE')"
                    label="Boligtype"
                    :class="[
                      'ad__dropdown',
                      {
                        'ad__dropdown--edited': isEdited('PROPERTY_TYPE'),
                      },
                    ]"
                  >
                    <Dropdown
                      :label="
                        displayProperties.find(
                          (v) => v.value === data.PROPERTY_TYPE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        displayProperties.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.PROPERTY_TYPE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        />
                        <Icon :icon="getIsEditedIcon('PROPERTY_TYPE')" />
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="hasField('RENTAL_PRICE_PER_MONTH')"
                    v-bind="validate('RENTAL_PRICE_PER_MONTH')"
                    label="Månedsleie"
                    :class="[
                      'ad__field',
                      {
                        'ad__field--edited': isEdited('RENTAL_PRICE_PER_MONTH'),
                      },
                    ]"
                  >
                    <Input
                      :modelValue="data.RENTAL_PRICE_PER_MONTH"
                      @update:modelValue="
                        (v) =>
                          (data.RENTAL_PRICE_PER_MONTH = Number.isNaN(v)
                            ? null
                            : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedIcon('RENTAL_PRICE_PER_MONTH')"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('AREA_FROM')"
                    v-bind="validate('AREA_FROM')"
                    label="Areal fra"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('AREA_FROM') },
                    ]"
                  >
                    <Input
                      :modelValue="data.AREA_FROM"
                      @update:modelValue="
                        (v) => (data.AREA_FROM = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('AREA_FROM')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('AREA_TO')"
                    v-bind="validate('AREA_TO')"
                    label="Areal til"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('AREA_TO') },
                    ]"
                  >
                    <Input
                      :modelValue="data.AREA_TO"
                      @update:modelValue="
                        (v) => (data.AREA_TO = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('AREA_TO')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('NO_OF_PARKING_SPOTS')"
                    v-bind="validate('NO_OF_PARKING_SPOTS')"
                    label="Antall parkeringsplasser"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('NO_OF_PARKING_SPOTS') },
                    ]"
                  >
                    <Input
                      :modelValue="data.NO_OF_PARKING_SPOTS"
                      @update:modelValue="
                        (v) =>
                          (data.NO_OF_PARKING_SPOTS = Number.isNaN(v)
                            ? null
                            : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedIcon('NO_OF_PARKING_SPOTS')"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('FLOOR')"
                    v-bind="validate('FLOOR')"
                    label="Etasje"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('FLOOR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.FLOOR"
                      @update:modelValue="
                        (v) => (data.FLOOR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('FLOOR')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('CONSTRUCTION_YEAR')"
                    v-bind="validate('CONSTRUCTION_YEAR')"
                    label="Byggeår"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('CONSTRUCTION_YEAR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.CONSTRUCTION_YEAR"
                      @update:modelValue="
                        (v) =>
                          (data.CONSTRUCTION_YEAR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon
                          :icon="getIsEditedIcon('CONSTRUCTION_YEAR')"
                        ></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('RENOVATED_YEAR')"
                    v-bind="validate('RENOVATED_YEAR')"
                    label="Renoveringsår"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('RENOVATED_YEAR') },
                    ]"
                  >
                    <Input
                      :modelValue="data.RENOVATED_YEAR"
                      @update:modelValue="
                        (v) =>
                          (data.RENOVATED_YEAR = Number.isNaN(v) ? null : v)
                      "
                      :mask="{
                        mask: Number,
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('RENOVATED_YEAR')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    label="Energimerking"
                    v-if="hasField('ENERGY_LABEL')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('ENERGY_LABEL'),
                        },
                      ]"
                      :label="
                        energyLabel.find((v) => v.value === data.ENERGY_LABEL)
                          ?.label || 'Velg...'
                      "
                      :items="
                        energyLabel.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.ENERGY_LABEL = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        />
                        <Icon :icon="getIsEditedIcon('ENERGY_LABEL')" />
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    label="Energimerking (farge)"
                    v-if="hasField('ENERGY_LABEL_COLOR_CODE')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited(
                            'ENERGY_LABEL_COLOR_CODE',
                          ),
                        },
                      ]"
                      :label="
                        energyLabelColor.find(
                          (v) => v.value === data.ENERGY_LABEL_COLOR_CODE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        energyLabelColor.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.ENERGY_LABEL_COLOR_CODE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-xs"
                        />

                        <Icon
                          :icon="getIsEditedIcon('ENERGY_LABEL_COLOR_CODE')"
                        />
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    label="Eiertype"
                    v-if="hasField('OWNERSHIP_TYPE')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        { 'ad__dropdown--edited': isEdited('OWNERSHIP_TYPE') },
                      ]"
                      :suffix="'test'"
                      :prefix="'test'"
                      :keepOpen="true"
                      :label="
                        OwnershipTypes.find(
                          (v) => v.value === data.OWNERSHIP_TYPE,
                        )?.label || 'Velg...'
                      "
                      :items="
                        OwnershipTypes.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.OWNERSHIP_TYPE = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon :icon="getIsEditedIcon('OWNERSHIP_TYPE')"></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>

                  <FormControl
                    v-if="hasField('BEDROOMS_FROM')"
                    v-bind="validate('BEDROOMS_FROM')"
                    label="Soverom fra"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('BEDROOMS_FROM') },
                    ]"
                  >
                    <Input
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                      :modelValue="data.BEDROOMS_FROM"
                      @update:modelValue="
                        (v) => (data.BEDROOMS_FROM = Number.isNaN(v) ? null : v)
                      "
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('BEDROOMS_FROM')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    v-if="hasField('BEDROOMS_TO')"
                    v-bind="validate('BEDROOMS_TO')"
                    label="Soverom til"
                    :class="[
                      'ad__field',
                      { 'ad__field--edited': isEdited('BEDROOMS_TO') },
                    ]"
                  >
                    <Input
                      :mask="{
                        mask: Number,
                        thousandsSeparator: ' ',
                        unmask: true,
                        min: 0,
                        scale: 0,
                      }"
                      :modelValue="data.BEDROOMS_TO"
                      @update:modelValue="
                        (v) => (data.BEDROOMS_TO = Number.isNaN(v) ? null : v)
                      "
                    >
                      <template #suffix>
                        <Icon :icon="getIsEditedIcon('BEDROOMS_TO')"></Icon>
                      </template>
                    </Input>
                  </FormControl>

                  <FormControl
                    label="Er hytte"
                    v-if="hasField('IS_LEISURE')"
                    :getRootNode="() => formContainer.getRootNode()"
                  >
                    <Switch v-model="data.IS_LEISURE"></Switch>
                  </FormControl>

                  <FormControl
                    label="Beliggenhet"
                    v-if="
                      hasField('IS_LEISURE')
                        ? data.IS_LEISURE
                        : hasField('LEISURE_SITUATION')
                    "
                    v-bind="validate('LEISURE_SITUATION')"
                  >
                    <Dropdown
                      :class="[
                        'ad__dropdown',
                        {
                          'ad__dropdown--edited': isEdited('LEISURE_SITUATION'),
                        },
                      ]"
                      :label="
                        LeisureSituation.find(
                          (v) => v.value === data.LEISURE_SITUATION,
                        )?.label || 'Velg...'
                      "
                      :items="
                        LeisureSituation.map((v) => {
                          return {
                            ...v,
                            action: () => {
                              data.LEISURE_SITUATION = v.value
                            },
                          }
                        })
                      "
                    >
                      <template #icon-right>
                        <Icon
                          icon="fa-pro-regular:angle-down"
                          class="k-mr-sm"
                        ></Icon>

                        <Icon
                          :icon="getIsEditedIcon('LEISURE_SITUATION')"
                        ></Icon>
                      </template>
                    </Dropdown>
                  </FormControl>
                </Grid>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              title="Enhetstyper for annonsen"
              subtitle="Velg enhetstyper for annonsen"
              v-if="
                hasFields('PROPERTY_TYPE') && Array.isArray(data.PROPERTY_TYPE)
              "
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('PROPERTY_TYPE')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('PROPERTY_TYPE'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default>
                <FormControl
                  label="Tilgjengelige lokaler"
                  v-if="hasField('PROPERTY_TYPE')"
                >
                  <Checkbox
                    v-for="item in displayProperties"
                    v-model="data.PROPERTY_TYPE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              title="Bilder"
              subtitle="Disse hentes fra prosjektsiden. Det første bilde vil være forsidebildet på Finn-annonsen."
              v-if="hasFields('MEDIA')"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('MEDIA')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('MEDIA'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default>
                <Media
                  v-if="hasFields('MEDIA')"
                  v-model="data.MEDIA"
                  label="Bilder i Finn-annonsen"
                  dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
                  :accept="['image/jpeg', 'image/png', 'image/jpg']"
                  :upload="uploadFunction"
                  :types="['Image']"
                  :multiple="true"
                  :sortable="true"
                  :description="true"
                  placement="outside"
                  size="contain"
                  :labels="{
                    selectMessage:
                      'Trykk på knappen nedenfor for å laste opp andre filtyper',
                    select: 'Velg',
                    cancel: 'Avbryt',
                    save: 'Bekreft',
                    descriptionPlaceholder: '',
                    image: {
                      createLabel: 'Bilde',
                      preview: '',
                      inputLabel: '',
                      error: '',
                    },
                  }"
                >
                </Media>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              title="Plantegninger"
              subtitle="Disse hentes fra enhetssidene"
              v-if="hasFields('FLOORPLAN_MEDIA')"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('FLOORPLAN_MEDIA')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('FLOORPLAN_MEDIA'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default>
                <File
                  :rename="false"
                  v-if="hasFields('FLOORPLAN_MEDIA')"
                  v-model="data.FLOORPLAN_MEDIA"
                  label="Plantegninger i Finn-annonsen"
                  dropMessage="Dra en fil hit eller <b>velg</b> for å laste opp"
                  :accept="['image/jpeg', 'image/png', 'image/jpg']"
                  :upload="uploadFunction"
                  :multiple="true"
                  :sortable="true"
                  :labels="{
                    delete: 'Slett',
                    download: 'Last ned',
                  }"
                >
                </File>
              </template>
            </Expandable>

            <RichTextMultiple
              :expanded="true"
              title="Beskrivelse"
              subtitle="Teksten som formuleres her vil bli synlig under beskrivelse på Finn-annonsen."
              v-if="hasFields('GENERAL_DESCRIPTION')"
              v-model="data.GENERAL_DESCRIPTION"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('GENERAL_DESCRIPTION')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited': isEdited(
                        'GENERAL_DESCRIPTION',
                      ),
                    },
                  ]"
                ></Icon>
              </template>
            </RichTextMultiple>

            <ExpandableList
              :expanded="true"
              title="Beskrivelse"
              subtitle="Teksten som formuleres her vil bli synlig under beskrivelse på Finn-annonsen."
              :template="{ GENERAL_HEADING: '', GENERAL_TEXT: '' }"
              v-model="data.GENERAL_TEXT_REALESTATE"
              v-if="hasFields('GENERAL_TEXT_REALESTATE')"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('GENERAL_TEXT_REALESTATE')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited': isEdited(
                        'GENERAL_TEXT_REALESTATE',
                      ),
                    },
                  ]"
                ></Icon>
              </template>

              <template #default="{ item }">
                <FormControl label="Tittel">
                  <Input v-model="item.GENERAL_HEADING"></Input>
                </FormControl>
                <FormControl label="Tekst">
                  <RichText
                    :actions="['bold', 'italic', 'orderedList', 'bulletList']"
                    v-model="item.GENERAL_TEXT"
                  >
                  </RichText>
                </FormControl>
              </template>
            </ExpandableList>

            <Expandable
              :expanded="true"
              title="Fasiliteter for prosjektannonsen"
              subtitle="Velg fasiliteter for prosjektannonsen"
              v-if="hasFields('PROJECT_PREFERENCE')"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('PROJECT_PREFERENCE')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('PROJECT_PREFERENCE'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default>
                <FormControl
                  label="Tilgjengelige fasiliteter"
                  v-if="hasField('PROJECT_PREFERENCE')"
                >
                  <Checkbox
                    v-for="item in ProjectFacilities"
                    v-model="data.PROJECT_PREFERENCE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              title="Fasiliteter for annonsen"
              subtitle="Velg fasiliteter for annonsen"
              v-if="hasFields('ESTATE_PREFERENCE')"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('ESTATE_PREFERENCE')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('ESTATE_PREFERENCE'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default>
                <FormControl
                  label="Tilgjengelige fasiliteter"
                  v-if="hasField('ESTATE_PREFERENCE')"
                >
                  <Checkbox
                    v-for="item in Facilities"
                    v-model="data.ESTATE_PREFERENCE"
                    :value="item.value"
                    :label="item.label"
                  ></Checkbox>
                </FormControl>
              </template>
            </Expandable>

            <Expandable
              :expanded="true"
              title="Valgte enheter til Finn-annonsen"
              subtitle="Fremhev enheten på prosjektannonsen, eller gjør andre tilpasninger."
              v-if="units.length"
            >
              <template #default>
                <UnitTable
                  ref="unitTable"
                  :initialUnitFields="initialUnitFields"
                  :units="units"
                  v-model="modelValue"
                ></UnitTable>
              </template>
            </Expandable>

            <template v-if="addressError">
              <Expandable
                title="Adresse"
                subtitle="Adresse påvirker hele prosjektet. Derfor er det ikke mulig å tilpasse denne her."
                :expandable="false"
                :expanded="false"
              >
                <template #actions>
                  <Button
                    class="ad__navigate-button"
                    variant="primary"
                    label="Gå til Grunnlag"
                    is="a"
                    target="_blank"
                    :href="getProjectStepUrl('basis')"
                    iconRight="fa-pro-light:arrow-up-right-from-square"
                  >
                  </Button>
                </template>
              </Expandable>
              <Alert
                variant="danger"
                :content="addressError"
                icon="fa-pro-light:exclamation-triangle"
              >
              </Alert>
            </template>

            <Expandable
              title="Prosjektstatus"
              subtitle="Prosjektstatus påvirker hele prosjektet. Derfor er det ikke mulig å tilpasse denne her."
              :expandable="false"
              :expanded="false"
            >
              <template #actions>
                <Button
                  class="ad__navigate-button"
                  variant="primary"
                  label="Gå til Presentasjon"
                  is="a"
                  target="_blank"
                  :href="getProjectStepUrl('presentation')"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                >
                </Button>
              </template>
            </Expandable>

            <Expandable
              title="Kontaktperson"
              subtitle="Kontaktperson påvirker hele prosjektet. Derfor er det ikke mulig å tilpasse denne her."
              :expandable="false"
              :expanded="false"
            >
              <template #actions>
                <Button
                  class="ad__navigate-button"
                  variant="primary"
                  label="Gå til Roller"
                  is="a"
                  target="_blank"
                  :href="getProjectStepUrl('roles')"
                  iconRight="fa-pro-light:arrow-up-right-from-square"
                >
                </Button>
              </template>
            </Expandable>
            <Alert
              v-if="brokerError"
              variant="danger"
              :content="brokerError"
              icon="fa-pro-light:exclamation-triangle"
            >
            </Alert>

            <ExpandableList
              :expanded="true"
              title="Nyttige lenker i Finn-annonsen"
              v-if="hasFields('MOREINFO')"
              :limit="4"
              :template="{ URL: '', URLTEXT: '' }"
              v-model="data.MOREINFO"
            >
              <template #actions>
                <Icon
                  :icon="getIsEditedIcon('MOREINFO')"
                  :class="[
                    'ad__expandable-list-field-icon',
                    {
                      'ad__expandable-list-field-icon--edited':
                        isEdited('MOREINFO'),
                    },
                  ]"
                ></Icon>
              </template>
              <template #default="{ item: data }">
                <Grid columns="2">
                  <FormControl label="URL til nyttig lenke">
                    <Input v-model="data.URL" suffix="URL"></Input>
                  </FormControl>
                  <FormControl label="Visningsnavn på lenken på Finn-annonsen">
                    <Input v-model="data.URLTEXT"></Input>
                  </FormControl>
                </Grid>
              </template>
            </ExpandableList>
          </Flex>
        </template>
        <template #actions>
          <Button label="Tilbake" variant="secondary" @click="onPrev" />

          <Button
            label="Lagre utkast"
            variant="secondary"
            @click="saveDraft"
            :promise="savingDraftPromise"
          >
          </Button>

          <Button
            :loading="loading"
            v-tooltip="{
              content: Object.entries(validator.errors.value.errors)
                .map(([key, value]) => value)
                .flat()
                .join('\n'),
              disabled: validator.passes.value,
            }"
            :label="getNextLabel()"
            variant="primary"
            icon-right="fa-pro-solid:arrow-right"
            @click="
              () => {
                if (!validator.passes || loading) return
                onNext()
              }
            "
            :disabled="!validator.passes.value"
          />
        </template>
      </Card>
    </KeepAlive>
  </div>
</template>

<style lang="scss">
.ad {
  &__title {
    display: flex;
    flex-direction: row;
    gap: var(--k-ui-spacing-xs);
    span {
      margin-right: auto;
    }
  }

  &__go-back.k-button,
  &__reset.k-button {
    font-weight: normal;
    font-size: 1rem;
  }

  &__alert {
    margin-bottom: 2rem;

    .k-alert__icon {
      padding: var(--k-ui-spacing-lg);
    }
  }

  .ad__field {
    --k-input-prefix-background: white;
    --k-input-prefix-text: var(--k-ui-color-neutral-dark);

    svg {
      color: var(--synced-icon);
    }

    .k-input__input {
      color: var(--k-ui-color-neutral-dark);
    }

    &--edited {
      --k-input-prefix-text: var(--k-ui-color-neutral-darkest);

      svg {
        color: var(--edited-icon);
      }

      .k-input__input {
        color: var(--k-ui-color-neutral-darkest);
      }
    }
  }

  &__dropdown {
    --k-button-secondary-background: white;
    --k-button-secondary-text: var(--k-ui-color-neutral-dark);

    --k-button-secondary-background-hover: var(--k-ui-color-neutral-lightest);
    --k-button-secondary-background-active: var(--k-ui-color-neutral-light);

    --k-button-medium-padding-inline: var(--k-ui-spacing-sm);
    --k-button-medium-padding-block: var(--k-ui-spacing-sm);

    svg:last-of-type {
      color: var(--synced-icon);
    }

    &--edited {
      --k-button-secondary-text: var(--k-ui-color-neutral-darkest);

      svg:last-of-type {
        color: var(--edited-icon);
      }
    }
  }

  &__expandable-list-field-icon {
    background: white;
    border-radius: var(--k-ui-rounding-full);
    overflow: visible;
    padding: var(--k-ui-spacing-xs);
    line-height: 1;

    color: var(--synced-icon);

    &--edited {
      color: var(--edited-icon);
    }
  }

  &__navigate-button {
    --k-button-medium-font-size: 1rem;
  }

  // &__highlight {
  //   font-size: 2rem;
  //   color: var(--k-ui-color-neutral-dark);

  //   &--selected {
  //     color: var(--primary, var(--k-ui-color-primary));
  //   }
  // }
}
</style>
