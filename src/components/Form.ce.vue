<script setup>
import { reactive, ref } from 'vue'
import { createLead } from '../api'
import Field from './Field.ce.vue'
import Checkbox from './Checkbox.ce.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Meld interesse',
  },
  subtitle: String,
  submitLabel: {
    type: String,
    default: 'Meld interesse',
  },
  privacyUrl: {
    type: String,
    default: 'https://legal.kvass.no/privacy',
  },
  accountUrl: {
    type: String,
    required: true,
  },
})

const form = reactive({
  contact: {
    name: null,
    email: null,
    phone: null,
    upsell: false,
  },
  comment: null,
})

const submitted = ref(false)

async function submit() {
  await createLead(accountUrl, form)
  submitted.value = true
}
</script>

<template>
  <form class="kvass-lead-form" @submit.prevent="submit">
    <div class="kvass-lead-form__header">
      <h2 class="kvass-lead-form__title">{{ title }}</h2>
      <p class="kvass-lead-form__subtitle" v-if="subtitle">{{ subtitle }}</p>
    </div>

    <div class="kvass-lead-form__fields">
      <Field
        label="Navn"
        type="text"
        id="name"
        required
        v-model="form.contact.name"
      />
      <Field
        label="Epost"
        type="email"
        id="email"
        required
        v-model="form.contact.email"
      />
      <Field
        label="Telefon"
        type="tel"
        id="phone"
        v-model="form.contact.phone"
      />
      <Field
        label="Melding"
        type="textarea"
        rows="5"
        id="message"
        v-model="form.comment"
      />
      <Checkbox
        label="Jeg ønsker informasjon om lignende prosjekter"
        id="contact-me"
        v-model="form.contact.upsell"
      />
      <Checkbox
        :label="`Jeg ønsker å bli kontaktet i samtykke med <a href='${privacyUrl}' target='_blank'>personvernerklæringen</a>`"
        id="tos"
        required
      />
    </div>

    <button class="kvass-lead-form__submit" type="submit">
      {{ submitLabel }}
    </button>
  </form>
</template>

<style lang="scss">
.kvass-lead-form {
  // default variables
  --default-background: #ffffff;
  --default-spacing: 2rem;
  --default-border-radius: 4px;
  --default-border-color: #eaeaea;
  --default-color: #222222;
  --default-color-inverted: #222222;
  --default-max-width: 720px;
  --default-primary: #1d56d8;

  background-color: var(
    --kvass-lead-form-background,
    var(--default-background)
  );
  padding: var(--kvass-lead-form-spacing, var(--default-spacing));
  border-radius: var(
    --kvass-lead-form-border-radius,
    var(--default-border-radius)
  );
  color: var(--kvass-lead-form-color, var(--default-color));
  max-width: var(--kvass-lead-form-max-width, var(--default-max-width));
  font: inherit;

  display: flex;
  flex-direction: column;
  gap: var(--kvass-lead-form-spacing, var(--default-spacing));

  @media (max-width: 600px) {
    padding: calc(var(--kvass-lead-form-spacing, var(--default-spacing)) / 2);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: calc(var(--kvass-lead-form-spacing, var(--default-spacing)) / 2);
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
    padding: calc(var(--kvass-lead-form-spacing, var(--default-spacing)) / 2);
    border-radius: var(
      --kvass-lead-form-border-radius,
      var(--default-border-radius)
    );
    background-color: var(--kvass-lead-form-primary, var(--default-primary));
    color: var(--kvass-lead-form-color-inverted, var(--default-color-inverted));
    border: none;
    font: inherit;
    width: 100%;

    &:focus-visible {
      outline: 2px solid var(--kvass-lead-form-color, var(--default-color));
      outline-offset: 2px;
    }
  }

  &-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    &__element {
      padding: calc(var(--kvass-lead-form-spacing, var(--default-spacing)) / 2);
      border-radius: var(
        --kvass-lead-form-border-radius,
        var(--default-border-radius)
      );
      border: 1px solid
        var(--kvass-lead-form-border-color, var(--default-border-color));
      resize: vertical;
      font: inherit;

      &:focus-visible {
        outline: 2px solid var(--kvass-lead-form-color, var(--default-color));
        outline-offset: 2px;
      }
    }

    &--required {
      .kvass-lead-form-field__label:after {
        content: '*';
        opacity: 0.3;
        margin-left: 0.3rem;
      }
    }
  }

  &-checkbox {
    display: flex;
    align-items: start;
    gap: 0.3rem;

    &--required {
      span:after {
        content: '*';
        opacity: 0.3;
        margin-left: 0.3rem;
      }
    }
  }
}
</style>
