<script setup>
import {
  onMounted,
  reactive,
  ref,
  watch,
  computed,
  useAttrs,
  isReactive,
} from 'vue'
import { createLead, getProjects, createContact } from '../api'
import Field from './Field.ce.vue'
import Fieldset from './Fieldset.ce.vue'
import Checkbox from './Checkbox.ce.vue'

const Labels = {
  nb: {
    title: 'Meld interesse',
    submit: 'Meld interesse',
    name: 'Navn',
    email: 'E-post',
    phone: 'Telefonnummer',
    message: 'Melding',
    projects: 'Hvilke prosjekter er du interessert i?',
    upsell: 'Jeg ønsker informasjon om lignende prosjekter',
    privacy:
      'Jeg ønsker å bli kontaktet i samtykke med [personvernerklæringen]',
    success: 'Takk for interessen!',
  },
  en: {
    title: 'Contact agent',
    submit: 'Submit',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    projects: 'Which projects are you interested in?',
    upsell: 'I want to know about other similar projects',
    privacy: 'I agree to the [privacy policy]',
    success: 'Thank you for your interest',
  },
}

const attrs = useAttrs()

const props = defineProps({
  lang: {
    type: String,
    default: () => {
      return document.documentElement.getAttribute('lang') || 'nb'
    },
  },
  privacyUrl: {
    type: String,
  },
  upsell: {
    type: Boolean,
    default: false,
  },
  accountUrl: {
    type: String,
    required: true,
  },
  projects: {
    type: String,
    default: '',
  },
  references: {
    type: String,
    default: '',
  },
  tags: {
    type: String,
    default: '',
  },
})

const privacyUrlComp = computed(() =>
  props.privacyUrl
    ? props.privacyUrl
    : `${props.accountUrl}/api/legal/privacy/tenant`,
)

const initialForm = {
  contact: {
    name: null,
    email: null,
    phone: null,
    upsell: false,
    tags: props.tags.split(','),
  },
  comment: null,
}
const form = reactive(structuredClone(initialForm))

const submitted = ref(false)
const fetchedProjects = ref([])
const selectedProjects = ref([])
const references = ref([])

const Capitalize = (v) => v.charAt(0).toUpperCase() + v.substring(1)

function getLabel(key) {
  let label = attrs['label' + Capitalize(key)] || Labels[props.lang][key]
  if (key === 'privacy')
    return label.replace(/\[(.+)\]/, `<a href="${privacyUrlComp.value}">$1</a>`)
  return label
}

function resetForm() {
  Object.assign(form, structuredClone(initialForm))
  selectedProjects.value = []
}

function submit() {
  createLead(
    props.accountUrl,
    {
      ...form,
      references: references.value,
    },
    selectedProjects.value,
  ).then(() => {
    submitted.value = true
    resetForm()
  })
}

function setReferences() {
  const refs = props.references
    .split(',')
    .filter(Boolean)
    .map((r) => {
      const [onModel, ref] = r.split(':')
      return {
        onModel,
        ref,
      }
    })
  references.value = refs
}

onMounted(() => {
  if (!props.projects) {
    getProjects(props.accountUrl).then(
      (projects) => (fetchedProjects.value = projects),
    )
  } else {
    props.projects.split(',').forEach((p) => selectedProjects.value.push(p))
  }
  setReferences()
})
</script>

<template>
  <form class="kvass-contact" @submit.prevent="submit">
    <div class="kvass-contact__header">
      <h2 class="kvass-contact__title">{{ getLabel('title') }}</h2>
      <p class="kvass-contact__subtitle" v-if="getLabel('subtitle')">
        {{ getLabel('subtitle') }}
      </p>
    </div>

    <div class="kvass-contact__fields">
      <Field
        :label="getLabel('name')"
        type="text"
        required
        v-model="form.contact.name"
      />
      <Field
        :label="getLabel('email')"
        type="email"
        pattern="\b[\w\.-]+@[\w\.-]+\.\w{2,4}"
        required
        v-model="form.contact.email"
      />
      <Field
        :label="getLabel('phone')"
        type="tel"
        v-model="form.contact.phone"
      />
      <Fieldset :label="getLabel('projects')" v-if="!projects">
        <Checkbox
          v-for="project in fetchedProjects"
          :key="project.id"
          :state="project.id"
          :label="project.name"
          v-model="selectedProjects"
        />
      </Fieldset>
      <Field
        :label="getLabel('message')"
        type="textarea"
        rows="5"
        class="kvass-contact-field--full-width"
        v-model="form.comment"
      />
      <Checkbox
        v-if="upsell"
        :label="getLabel('upsell')"
        class="kvass-contact-field--full-width"
        v-model="form.contact.upsell"
      />
      <Checkbox
        :label="getLabel('privacy')"
        class="kvass-contact-field--full-width"
        required
      />
    </div>
    <button class="kvass-contact__submit" type="submit" :disabled="submitted">
      {{ submitted ? getLabel('success') : getLabel('submit') }}
    </button>
  </form>
</template>

<style lang="scss">
.kvass-contact {
  // default variables
  --kvass-contact-default-background: #ffffff;
  --kvass-contact-default-spacing: 2rem;
  --kvass-contact-default-border-radius: 4px;
  --kvass-contact-default-border-color: #eaeaea;
  --kvass-contact-default-color: #222222;
  --kvass-contact-default-color-inverted: #ffffff;
  --kvass-contact-default-max-width: 720px;
  --kvass-contact-default-primary: #1d56d8;
  --kvass-contact-default-error: #d81d1d;
  --kvass-contact-default-grid-columns: 1;
  --kvass-contact-default-disabled: #eaeaea;

  background-color: var(
    --kvass-contact-background,
    var(--kvass-contact-default-background)
  );
  padding: var(--kvass-contact-spacing, var(--kvass-contact-default-spacing));
  border-radius: var(
    --kvass-contact-border-radius,
    var(--kvass-contact-default-border-radius)
  );
  color: var(--kvass-contact-color, var(--kvass-contact-default-color));
  max-width: var(
    --kvass-contact-max-width,
    var(--kvass-contact-default-max-width)
  );
  font: inherit;
  accent-color: var(
    --kvass-contact-primary,
    var(--kvass-contact-default-primary)
  );

  display: flex;
  flex-direction: column;
  gap: var(--kvass-contact-spacing, var(--kvass-contact-default-spacing));

  @media (max-width: 600px) {
    --kvass-contact-grid-columns: 1;
    padding: calc(
      var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 2
    );
  }

  * {
    &:focus-visible {
      outline: 2px solid
        var(--kvass-contact-color, var(--kvass-contact-default-color));
      outline-offset: 2px;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(
      var(
        --kvass-contact-grid-columns,
        var(--kvass-contact-default-grid-columns)
      ),
      1fr
    );
    gap: calc(
      var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 2
    );
  }

  &__title {
    font-size: 2rem;
    margin: 0;
  }

  &__subtitle {
    opacity: 0.7;
    margin: 0;
  }

  &__submit {
    padding: calc(
      var(--kvass-contact-spacing, var(--kvass-contact-default-spacing)) / 2
    );
    border-radius: var(
      --kvass-contact-border-radius,
      var(--kvass-contact-default-border-radius)
    );
    background-color: var(
      --kvass-contact-primary,
      var(--kvass-contact-default-primary)
    );
    color: var(
      --kvass-contact-color-inverted,
      var(--kvass-contact-default-color-inverted)
    );
    border: none;
    font: inherit;
    width: 100%;

    &:disabled {
      background-color: var(
        --kvass-contact-disabled,
        var(--kvass-contact-default-disabled)
      );
      color: var(--kvass-contact-color, var(--kvass-contact-default-color));
      cursor: not-allowed;
    }
  }
}
</style>
