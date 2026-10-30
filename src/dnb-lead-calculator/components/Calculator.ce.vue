<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import dnbLogo from '../assets/dnb-logo.svg'
import kvassLogo from '../assets/kvass-logo.png'
import { calculatePrice, validUnits, prices } from '../pricing.js'
import { submitRequest } from '../submit.js'
import { checkCode, hasAccess, rememberAccess } from '../access.js'

const props = defineProps({
  // Manager-endepunktet leadet sendes til
  endpoint: { type: String, default: '' },
})

const fresh = () => ({
  units: '',
  projectName: '',
  packageId: '',
  offerRecipient: '',
  company: '',
  org: '',
  name: '',
  email: '',
  phone: '',
  notes: '',
  brokerOffice: '',
  brokerName: '',
  brokerEmail: '',
  brokerPhone: '',
  website: '', // honeypot, fylles bare ut av roboter
})
const form = reactive(fresh())
const submitted = ref(false)
function setOrg(event) {
  const raw = event.target.value.replace(/\D/g, '').slice(0, 9)
  form.org = raw.replace(/(\d{3})(?=\d)/g, '$1 ')
  event.target.value = form.org
}
const packageDetails = {
  dnb: {
    title: 'Kvass sørger for følgende:',
    items: [
      'Oppkobling mot meglersystemet (synkronisering av bilder, plantegning, priser etc.)',
      'Finpuss prosjektside',
      'Domene-oppsett',
      'Lansering',
    ],
  },
  custom: {
    title: 'Kvass sørger for følgende (opptil 12t):',
    items: [
      'Oppstartsmøte med Kvass (dine egne farger, skrifttyper og logo & flere undersider ved behov)',
      'Oppkobling mot meglersystemet (synkronisering av bilder, plantegning, priser etc.)',
      'Domene-oppsett',
      'Lansering',
    ],
  },
  self: {
    title: 'Selvbetjent i Kvass CMS',
    items: [
      'I vårt brukervennlige Kvass CMS kan Utbygger sette opp prosjektet helt selvbetjent, Kvass-support bistår underveis ved evt. spørsmål. Oppsett av boligvelger er ikke inkludert.',
    ],
  },
  makr: {
    items: [
      'Vårt søsterselskap MAKR setter opp nettsider tilpasset prosjektet og leverer konsept, visuell profil, 3D-visualisering, digital salgsoppgave, annonsering og andre byråtjenester for eiendomsprosjekter.',
    ],
  },
}
const options = [
  {
    id: 'dnb',
    title: 'Kvass setter opp i DNB Design',
    price: '9 900 kr',
    subtitle: 'Ferdig mal i DNB sitt uttrykk',
    info: 'Oppkobling mot meglersystemet, finpuss av prosjektsiden, domene-oppsett og lansering.',
  },
  {
    id: 'custom',
    title: 'Kvass setter opp i utbyggers eget uttrykk',
    price: '19 900 kr',
    subtitle: 'Kvass implementerer utbyggers egne fonter, farger og logo',
    info: 'Oppstartsmøte og tilpasning, flere undersider ved behov, oppkobling mot meglersystemet, domene-oppsett og lansering. Opptil 12 timer.',
  },
  {
    id: 'self',
    title: 'Utbygger setter opp prosjektet selv',
    price: '0 kr',
    subtitle: 'Selvbetjent i Kvass CMS',
    info: 'Utbygger setter opp prosjektet i Kvass CMS. Kvass-support bistår ved spørsmål. Oppsett av boligvelger tas ut av prisen.',
  },
  {
    id: 'makr',
    title: 'Vi ønsker hjelp med helhetlig markedsføring',
    price: 'Etter forespørsel',
    subtitle:
      'Ønsker dere en nettside tilpasset merkevaren eller hjelp med markedsføringen av prosjektet?',
    info: 'MAKR bistår med helhetlig markedsføring og byråtjenester for eiendomsprosjekter.',
  },
]
const recipientOptions = [
  {
    id: 'broker-and-developer',
    title: 'Megler og utbygger mottar tilbudet',
    subtitle:
      'Tilbudet sendes til både deg og referansepersonen hos utbygger. Kvass / MAKR kan følge opp utbygger direkte.',
    people: 2,
  },
  {
    id: 'broker-only',
    title: 'Kun megler mottar tilbudet',
    subtitle:
      'Tilbudet sendes bare til deg. Du videreformidler det til utbygger – vi kontakter ikke utbygger direkte.',
    people: 1,
  },
]
const price = computed(() => calculatePrice(form.units, form.packageId))
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const required = (value) => (value.trim() ? '' : 'Påkrevd')
const fieldErrors = computed(() => ({
  units: validUnits(form.units) ? '' : 'Skriv et positivt heltall',
  projectName: required(form.projectName),
  packageId: form.packageId ? '' : 'Velg en pakke',
  company: required(form.company),
  org: /^\d{9}$/.test(form.org.replace(/\s/g, '')) ? '' : 'Skriv 9 siffer',
  name: required(form.name),
  email: emailPattern.test(form.email) ? '' : 'Ugyldig e-postadresse',
  phone: required(form.phone),
  brokerOffice: required(form.brokerOffice),
  brokerName: required(form.brokerName),
  brokerEmail: emailPattern.test(form.brokerEmail)
    ? ''
    : 'Ugyldig e-postadresse',
  brokerPhone: required(form.brokerPhone),
  offerRecipient: form.offerRecipient ? '' : 'Velg ett alternativ',
}))
const ready = computed(() => Object.values(fieldErrors.value).every((e) => !e))
const touched = reactive({})
const attempted = ref(false)
const errorFor = (key) =>
  attempted.value || touched[key] ? fieldErrors.value[key] : ''
const formEl = ref(null)
const money = (value) =>
  value == null
    ? '–'
    : new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(
        value,
      ) + ' kr'
const selectorNote = computed(() =>
  price.value
    ? '+ boligvelger ' + money(price.value.selector)
    : '+ boligvelger fra ' + money(prices.tiers[0].selector),
)
const licenseDetails = computed(() => {
  if (!price.value) return 'Angi antall enheter'
  return (
    'Lisens ' +
    money(price.value.license) +
    ' + grunnpakke ' +
    money(prices.base)
  )
})
const setupDetails = computed(() => {
  if (form.packageId === 'makr') return '20% DNB-rabatt'
  if (form.packageId === 'self') return 'Selvbetjent'
  if (!form.packageId) return 'Velg pakke i steg 2'
  return (
    'Boligvelger ' +
    money(price.value?.selector) +
    ' + pakke ' +
    money(prices.packages[form.packageId])
  )
})
const sending = ref(false)
const sendError = ref('')
async function send() {
  if (sending.value) return
  if (!ready.value) {
    attempted.value = true
    await nextTick()
    formEl.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  sending.value = true
  sendError.value = ''
  try {
    await submitRequest(props.endpoint, { ...form, price: price.value })
    submitted.value = true
  } catch (err) {
    sendError.value =
      err.status === 429
        ? 'For mange innsendinger. Prøv igjen om litt.'
        : 'Noe gikk galt. Prøv igjen.'
  } finally {
    sending.value = false
  }
}
function reset() {
  Object.assign(form, fresh())
  for (const key of Object.keys(touched)) delete touched[key]
  attempted.value = false
  sendError.value = ''
  submitted.value = false
}
const unlocked = ref(hasAccess())
const accessCode = ref('')
const accessError = ref('')
async function unlock() {
  if (await checkCode(accessCode.value)) {
    rememberAccess()
    unlocked.value = true
  } else {
    accessError.value = 'Feil kode'
    accessCode.value = ''
  }
}
</script>

<template>
  <div class="calculator">
    <header>
      <div class="header-inner">
        <div class="brand">
          <img :src="dnbLogo" alt="DNB" class="dnb-logo" /><span></span
          ><img :src="kvassLogo" alt="Kvass" class="kvass-logo" />
        </div>
        <p>Fordelspriser for DNB Eiendom-kunder</p>
      </div>
    </header>
    <main>
      <section v-if="!unlocked" class="access">
        <h1>Prosjektside med boligvelger</h1>
        <form @submit.prevent="unlock">
          <label>
            Tilgangskode
            <input
              v-model="accessCode"
              type="password"
              autocomplete="current-password"
              :aria-invalid="!!accessError"
              autofocus
            />
          </label>
          <p v-if="accessError" class="field-error">{{ accessError }}</p>
          <button type="submit">Åpne</button>
        </form>
      </section>
      <section v-else-if="submitted" class="success" aria-live="polite">
        <span class="check">✓</span>
        <h1>Takk for din henvendelse, vi tar kontakt innen 24 timer</h1>
        <button type="button" @click="reset">Tilbake til skjema</button>
      </section>
      <template v-else>
        <h1>Prosjektside med boligvelger</h1>
        <p class="intro">
          Inkl. integrasjon med DNB sitt fagsystem. Beregn pris og be om tilbud.
        </p>
        <form ref="formEl" novalidate @submit.prevent="send">
          <input
            v-model="form.website"
            class="hp"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <div class="fields">
            <section class="panel">
              <h2><span>01</span>Angi prosjektstørrelse og navn</h2>
              <div class="units-row">
                <div>
                  <label for="units">Antall enheter</label>
                  <input
                    id="units"
                    placeholder="0"
                    v-model="form.units"
                    type="number"
                    min="1"
                    step="1"
                    required
                    @input="touched.units = true"
                    @blur="touched.units = true"
                    :aria-invalid="!!errorFor('units')"
                    aria-describedby="units-error"
                    class="units"
                  />
                  <p
                    v-if="errorFor('units')"
                    id="units-error"
                    class="field-error"
                  >
                    {{ errorFor('units') }}
                  </p>
                </div>
                <div class="project-field">
                  <label for="project-name">Prosjektnavn</label
                  ><input
                    id="project-name"
                    placeholder="Navn på prosjekt"
                    v-model="form.projectName"
                    required
                    @blur="touched.projectName = true"
                    :aria-invalid="!!errorFor('projectName')"
                    aria-describedby="project-name-error"
                    class="project-name"
                  />
                  <p
                    v-if="errorFor('projectName')"
                    id="project-name-error"
                    class="field-error"
                  >
                    {{ errorFor('projectName') }}
                  </p>
                </div>
              </div>
            </section>
            <section class="panel">
              <h2><span>02</span>Velg oppsett-pakke for prosjektsiden</h2>
              <p>Hvem skal sette opp prosjektsiden?</p>
              <fieldset>
                <legend class="sr-only">Oppsett-pakke</legend>
                <div
                  v-for="option in options"
                  :key="option.id"
                  class="package-card"
                  :class="{ selected: form.packageId === option.id }"
                >
                  <label class="option">
                    <input
                      v-model="form.packageId"
                      type="radio"
                      name="package"
                      :value="option.id"
                      required
                      :aria-invalid="!!errorFor('packageId')"
                    />
                    <span
                      ><strong>{{ option.title }}</strong
                      ><small>{{ option.subtitle }}</small></span
                    >
                    <b v-if="option.id !== 'makr'" class="amount"
                      >{{ option.price
                      }}<small v-if="prices.packages[option.id]">{{
                        selectorNote
                      }}</small></b
                    >
                  </label>
                  <div
                    v-if="
                      form.packageId === option.id && packageDetails[option.id]
                    "
                    class="package-details"
                  >
                    <strong v-if="packageDetails[option.id].title">{{
                      packageDetails[option.id].title
                    }}</strong>
                    <ol v-if="packageDetails[option.id].items.length > 1">
                      <li
                        v-for="item in packageDetails[option.id].items"
                        :key="item"
                      >
                        {{ item }}
                      </li>
                    </ol>
                    <p v-else>{{ packageDetails[option.id].items[0] }}</p>
                  </div>
                </div>
              </fieldset>
              <p
                class="choice-note"
                :class="{ invalid: errorFor('packageId') }"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 11v6M12 7.5v.01" />
                </svg>
                <span>Du må velge en oppsett-pakke før du kan sende.</span>
              </p>
              <div v-if="form.packageId === 'makr'" class="makr-notes">
                <label for="notes">Skriv kort om ønsker og behov</label
                ><textarea
                  id="notes"
                  v-model="form.notes"
                  rows="4"
                  placeholder="F.eks. 3D-visualisering, visuell profil, annonsering eller digital salgsoppgave..."
                ></textarea>
              </div>
            </section>
            <section class="panel recipient-panel">
              <h2><span>03</span>Hvilken utbygger gjelder tilbudet?</h2>
              <div class="grid">
                <div>
                  <label for="company">Selskapsnavn</label
                  ><input
                    id="company"
                    placeholder="Utbygger AS"
                    v-model="form.company"
                    autocomplete="organization"
                    required
                    @blur="touched.company = true"
                    :aria-invalid="!!errorFor('company')"
                    aria-describedby="company-error"
                  />
                  <p
                    v-if="errorFor('company')"
                    id="company-error"
                    class="field-error"
                  >
                    {{ errorFor('company') }}
                  </p>
                </div>
                <div>
                  <label for="org">Organisasjonsnummer</label
                  ><input
                    id="org"
                    :value="form.org"
                    @input="setOrg"
                    inputmode="numeric"
                    pattern="[0-9 ]{9,11}"
                    required
                    @blur="touched.org = true"
                    :aria-invalid="!!errorFor('org')"
                    aria-describedby="org-error"
                    placeholder="000 000 000"
                  />
                  <p v-if="errorFor('org')" id="org-error" class="field-error">
                    {{ errorFor('org') }}
                  </p>
                </div>
              </div>
              <div class="reference-person">
                <div class="grid">
                  <div>
                    <label for="name">Referanseperson</label
                    ><input
                      id="name"
                      placeholder="Navn"
                      v-model="form.name"
                      autocomplete="name"
                      required
                      @blur="touched.name = true"
                      :aria-invalid="!!errorFor('name')"
                      aria-describedby="name-error"
                    />
                    <p
                      v-if="errorFor('name')"
                      id="name-error"
                      class="field-error"
                    >
                      {{ errorFor('name') }}
                    </p>
                  </div>
                  <div>
                    <label for="email">E-post</label
                    ><input
                      id="email"
                      placeholder="E-post"
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      required
                      @blur="touched.email = true"
                      :aria-invalid="!!errorFor('email')"
                      aria-describedby="email-error"
                    />
                    <p
                      v-if="errorFor('email')"
                      id="email-error"
                      class="field-error"
                    >
                      {{ errorFor('email') }}
                    </p>
                  </div>
                  <div>
                    <label for="phone">Telefon</label
                    ><input
                      id="phone"
                      placeholder="Telefon"
                      v-model="form.phone"
                      type="tel"
                      autocomplete="tel"
                      required
                      @blur="touched.phone = true"
                      :aria-invalid="!!errorFor('phone')"
                      aria-describedby="phone-error"
                    />
                    <p
                      v-if="errorFor('phone')"
                      id="phone-error"
                      class="field-error"
                    >
                      {{ errorFor('phone') }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section class="panel recipient-panel">
              <h2><span>04</span>Megler</h2>
              <p>Fyll ut informasjon om meglerkontor og megler</p>
              <div class="grid">
                <div>
                  <label for="broker-office">Meglerkontor</label
                  ><input
                    id="broker-office"
                    placeholder="Megler AS"
                    v-model="form.brokerOffice"
                    autocomplete="organization"
                    required
                    @blur="touched.brokerOffice = true"
                    :aria-invalid="!!errorFor('brokerOffice')"
                    aria-describedby="broker-office-error"
                  />
                  <p
                    v-if="errorFor('brokerOffice')"
                    id="broker-office-error"
                    class="field-error"
                  >
                    {{ errorFor('brokerOffice') }}
                  </p>
                </div>
              </div>
              <div class="reference-person">
                <div class="grid">
                  <div>
                    <label for="broker-name">Megler</label
                    ><input
                      id="broker-name"
                      placeholder="Navn"
                      v-model="form.brokerName"
                      autocomplete="name"
                      required
                      @blur="touched.brokerName = true"
                      :aria-invalid="!!errorFor('brokerName')"
                      aria-describedby="broker-name-error"
                    />
                    <p
                      v-if="errorFor('brokerName')"
                      id="broker-name-error"
                      class="field-error"
                    >
                      {{ errorFor('brokerName') }}
                    </p>
                  </div>
                  <div>
                    <label for="broker-email">E-post</label
                    ><input
                      id="broker-email"
                      placeholder="E-post"
                      v-model="form.brokerEmail"
                      type="email"
                      autocomplete="email"
                      required
                      @blur="touched.brokerEmail = true"
                      :aria-invalid="!!errorFor('brokerEmail')"
                      aria-describedby="broker-email-error"
                    />
                    <p
                      v-if="errorFor('brokerEmail')"
                      id="broker-email-error"
                      class="field-error"
                    >
                      {{ errorFor('brokerEmail') }}
                    </p>
                  </div>
                  <div>
                    <label for="broker-phone">Telefon</label
                    ><input
                      id="broker-phone"
                      placeholder="Telefon"
                      v-model="form.brokerPhone"
                      type="tel"
                      autocomplete="tel"
                      required
                      @blur="touched.brokerPhone = true"
                      :aria-invalid="!!errorFor('brokerPhone')"
                      aria-describedby="broker-phone-error"
                    />
                    <p
                      v-if="errorFor('brokerPhone')"
                      id="broker-phone-error"
                      class="field-error"
                    >
                      {{ errorFor('brokerPhone') }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section class="panel">
              <h2><span>05</span>Hvem skal motta tilbudet?</h2>
              <p>
                Velg ett alternativ. Dette avgjør om vi tar kontakt med utbygger
                direkte.
              </p>
              <fieldset>
                <legend class="sr-only">Mottaker av tilbud</legend>
                <div
                  v-for="option in recipientOptions"
                  :key="option.id"
                  class="package-card"
                  :class="{ selected: form.offerRecipient === option.id }"
                >
                  <label class="option">
                    <input
                      v-model="form.offerRecipient"
                      type="radio"
                      name="offer-recipient"
                      :value="option.id"
                      required
                      :aria-invalid="!!errorFor('offerRecipient')"
                    />
                    <span
                      ><strong>{{ option.title }}</strong
                      ><small>{{ option.subtitle }}</small></span
                    >
                    <span class="people" aria-hidden="true">
                      <svg
                        v-for="n in option.people"
                        :key="n"
                        viewBox="0 0 24 24"
                        width="26"
                        height="26"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                      </svg>
                    </span>
                  </label>
                </div>
              </fieldset>
              <p
                class="choice-note"
                :class="{ invalid: errorFor('offerRecipient') }"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 11v6M12 7.5v.01" />
                </svg>
                <span>Du må velge ett av alternativene før du kan sende.</span>
              </p>
            </section>
          </div>
          <aside>
            <div class="summary" aria-live="polite" aria-atomic="true">
              <h2>
                Din pris
                <small v-if="validUnits(form.units)"
                  >{{ form.units }}
                  {{ Number(form.units) === 1 ? 'enhet' : 'enheter' }}</small
                >
              </h2>
              <dl>
                <div>
                  <dt>Lisens / mnd</dt>
                  <dd>
                    <span class="price-value">{{ money(price?.monthly) }}</span>
                  </dd>
                </div>
                <p>{{ licenseDetails }}</p>
                <div>
                  <dt>Onboarding</dt>
                  <dd>
                    <del v-if="price">{{ money(prices.onboarding) }}</del
                    ><span class="price-value">{{
                      price ? money(0) : '–'
                    }}</span>
                  </dd>
                </div>
                <p>100% DNB-rabatt</p>
                <div>
                  <dt>Etablering</dt>
                  <dd>
                    <del v-if="price">{{ money(price.establishmentFull) }}</del
                    ><span class="price-value">{{
                      money(price?.establishment)
                    }}</span>
                  </dd>
                </div>
                <p>50% DNB-rabatt</p>
                <div>
                  <dt>
                    {{
                      form.packageId === 'makr'
                        ? 'Skreddersøm via MAKR'
                        : 'Tech konsulent'
                    }}
                  </dt>
                  <dd>
                    <span class="price-value">{{
                      form.packageId === 'makr'
                        ? 'Pris etter forespørsel'
                        : money(price?.setup)
                    }}</span>
                  </dd>
                </div>
                <p>{{ setupDetails }}</p>
              </dl>
              <button type="submit" :disabled="sending">
                {{ sending ? 'Sender …' : 'Send' }}
              </button>
              <p v-if="sendError" class="hint">{{ sendError }}</p>
              <p v-if="attempted && !ready" class="hint">
                Fyll ut feltene markert i rødt
              </p>
              <p v-else-if="!ready" class="hint">
                Fyll ut steg 1–5 for å sende
              </p>
              <p class="hint">Vi tar kontakt innen 24 timer</p>
            </div>
            <p class="footnote">
              Alle priser er eks. mva. Endelig tilbud bekreftes av Kvass eller
              MAKR.
            </p>
          </aside>
        </form>
      </template>
    </main>
  </div>
</template>

<style>
:host {
  display: block;
  color: #0b2b30;
  font-family: Arial, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  --accent: #007272;
}
* {
  box-sizing: border-box;
}
.calculator {
  background: #f4f6f3;
  min-height: 100vh;
}
header {
  background: white;
  border-bottom: 1px solid #dde5df;
  padding: 20px max(24px, calc((100% - 1160px) / 2));
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
header p {
  font-size: 14px;
  color: #4a5f62;
  margin: 0;
}
.brand {
  display: flex;
  gap: 20px;
  align-items: center;
  color: var(--accent);
  font-size: 28px;
  letter-spacing: -1px;
}
.brand strong {
  font-weight: 400;
}
.brand span {
  height: 28px;
  width: 1px;
  background: #ccd8d2;
}
main {
  max-width: 1208px;
  margin: auto;
  padding: 28px 24px 64px;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 10px;
}
h1 {
  font-size: clamp(28px, 4vw, 42px);
  letter-spacing: -1.2px;
  line-height: 1.12;
  margin: 0 0 14px;
}
.intro {
  color: #4a5f62;
  margin-bottom: 32px;
}
form {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 28px;
  align-items: start;
}
.fields {
  display: grid;
  gap: 20px;
}
.panel {
  padding: 26px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e7ece8;
}
h2 {
  font-size: 20px;
  line-height: 1.3;
  margin: 0 0 12px;
  display: flex;
  gap: 14px;
  align-items: baseline;
}
h2 > span {
  font-size: 14px;
  color: var(--accent);
}
.panel > p {
  margin: 0 0 20px;
  color: #4a5f62;
  font-size: 14px;
}
label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}
input,
textarea,
select,
button {
  font: inherit;
}
input:not([type='radio']):not([type='checkbox']),
textarea,
select {
  display: block;
  width: 100%;
  border: 1px solid #b9cbc4;
  border-radius: 8px;
  padding: 11px;
  color: #0b2b30;
  background: white;
}
input.units {
  max-width: 160px;
  font-size: 24px !important;
}
input[type='radio'],
input[type='checkbox'] {
  accent-color: var(--accent);
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 3px solid #2b9393;
  outline-offset: 3px;
}
fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
.option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 12px;
  border: 1px solid #dce3df;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  font-weight: 400;
}
.option.selected {
  border: 2px solid var(--accent);
  padding: 15px 11px;
  background: #f0f8f5;
}
.option > span {
  flex: 1;
  min-width: 0;
}
.option strong {
  font-size: 14px;
}
.option small {
  display: block;
  color: #4a5f62;
  margin-top: 4px;
  font-size: 12px;
}
.option .details {
  margin-top: 12px;
  line-height: 1.6;
}
.amount {
  font-size: 13px;
  text-align: right;
  max-width: 94px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
aside {
  position: sticky;
  top: 24px;
}
.summary {
  background: #00343e;
  color: white;
  border-radius: 16px;
  padding: 26px;
}
.summary h2 {
  justify-content: space-between;
}
.summary h2 small {
  font-size: 12px;
  color: #a5e1d2;
  font-weight: 400;
}
dl {
  margin: 20px 0;
}
dl > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #356066;
  padding-top: 16px;
}
dt {
  font-size: 15px;
}
dd {
  margin: 0;
  font-weight: bold;
  font-size: 20px;
  text-align: right;
}
dl p {
  font-size: 12px;
  color: #a5e1d2;
  margin: 6px 0 18px;
}
button {
  border: 0;
  border-radius: 28px;
  padding: 13px 22px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.summary button {
  width: 100%;
  background: #a5e1d2;
  color: #00343e;
}
.hint {
  font-size: 12px;
  text-align: center;
  color: #d7efe8;
}
.footnote {
  font-size: 12px;
  color: #4a5f62;
  padding: 0 8px;
}
.muted {
  font-size: 12px !important;
}
.error {
  color: #a12626 !important;
}
.success {
  max-width: 580px;
  margin: 60px auto;
  background: white;
  padding: 36px;
  border-radius: 16px;
  text-align: center;
}
.check {
  display: block;
  font-size: 36px;
  color: var(--accent);
}
.success h1 {
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: normal;
  margin: 12px auto 28px;
  max-width: 400px;
}
.access {
  max-width: 360px;
  margin: 60px auto;
  background: white;
  padding: 36px;
  border-radius: 16px;
}
.access h1 {
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: normal;
  margin: 0 0 20px;
  text-align: center;
}
.access form {
  display: block;
}
.access input {
  width: 100%;
  margin-top: 6px;
}
.access button {
  display: block;
  margin: 20px auto 0;
  min-width: 160px;
}
.hp {
  position: absolute;
  left: -9999px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 760px) {
  form {
    grid-template-columns: 1fr;
  }
  aside {
    position: static;
  }
  header {
    flex-wrap: wrap;
    padding: 18px 20px;
  }
  main {
    padding: 20px 16px 40px;
  }
  .panel,
  .summary {
    padding: 20px;
  }
  h2 {
    font-size: 18px;
  }
  .option {
    flex-wrap: wrap;
  }
  .amount {
    margin-left: 30px;
    max-width: none;
  }
}

/* Dimensjoner, typografi og farger fra den originale kalkulatoren. */
:host {
  font-family: Figtree, system-ui, sans-serif;
  line-height: normal;
  -webkit-font-smoothing: antialiased;
}
header {
  padding: 0;
  border-color: #e1e6e2;
  display: block;
}
.header-inner {
  max-width: 1228px;
  margin: auto;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.brand {
  gap: 14px;
}
.brand span {
  height: 22px;
  background: #c9d2cd;
}
.brand img {
  display: block;
  width: auto;
}
.dnb-logo {
  height: 38px;
}
.kvass-logo {
  height: 30px;
}
main {
  max-width: 1180px;
  padding: 40px 24px 64px;
}
h1 {
  font-size: clamp(30px, 4vw, 44px);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 8px;
}
.intro {
  font-size: 17px;
  margin: 0 0 32px;
}
form {
  grid-template-columns: minmax(0, 680fr) minmax(0, 420fr);
  gap: 32px;
}
.panel {
  padding: 28px;
  border: 0;
}
h2 {
  font-size: 21px;
  letter-spacing: -0.01em;
  gap: 16px;
  line-height: normal;
  margin: 0 0 4px;
}
h2 > span {
  font-size: 15px;
  min-width: 16px;
}
.panel > p {
  font-size: 15px;
  margin: 0 0 18px;
  padding-left: 32px;
}
.units-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding-left: 36px;
}
.project-field {
  flex: 1;
  min-width: 0;
}
.units-row input.units {
  width: 170px;
  max-width: 100%;
  font-size: 22px !important;
  font-weight: 600;
  padding: 12px 14px !important;
  border-radius: 10px !important;
  border-color: #c9d2cd !important;
}
.units-row input.project-name {
  font-size: 18px;
  padding: 14px !important;
  border-radius: 10px !important;
  border-color: #c9d2cd !important;
}
fieldset {
  padding-left: 36px;
  display: grid;
  gap: 10px;
}
.option {
  border: 1.5px solid #d8e1dc;
  border-radius: 12px;
  padding: 16px 18px;
  gap: 14px;
  align-items: center;
  margin: 0;
}
.option.selected {
  padding: 16px 18px;
  border-width: 1.5px;
}
.option strong {
  font-size: 16px;
  font-weight: 600;
}
.option small {
  font-size: 14px;
  margin-top: 4px;
}
.option > span {
  line-height: 1.35;
}
.amount {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  max-width: none;
}
.option .amount small {
  font-size: 12px;
  font-weight: 400;
  margin-top: 2px;
}
.option input {
  margin: 0;
  width: 20px;
  height: 20px;
}
.option input[type='radio'] {
  appearance: none;
  border: 2px solid #9eb3b3;
  border-radius: 50%;
}
.option input:checked {
  border-color: #007272;
  background: radial-gradient(#007272 0 45%, transparent 50%);
}
.summary {
  padding: 28px;
}
.summary h2 {
  margin: 0 0 20px;
}
.summary h2 small {
  font-size: 14px;
  font-weight: 600;
}
dl {
  margin: 0 0 20px;
}
dl > div {
  padding-top: 14px;
  align-items: baseline;
  border-color: rgba(165, 225, 210, 0.25);
}
dt {
  font-size: 16px;
  flex-shrink: 0;
}
dd {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 20px;
  font-weight: 700;
}
dd del {
  font-size: 14px;
  font-weight: 600;
  color: #a5e1d2;
}
dl p {
  font-size: 13px;
  font-weight: 600;
  margin: 4px 0 0;
  padding-bottom: 14px;
  color: #a5e1d2;
}
dl p:last-child {
  border-bottom: 1px solid rgba(165, 225, 210, 0.25);
}
.summary button {
  padding: 16px;
  font-size: 18px;
  font-weight: 700;
}
.summary button:disabled {
  opacity: 1;
  background: rgba(165, 225, 210, 0.35);
}
.hint {
  font-size: 14px;
  margin: 20px 0 0;
}
.hint + .hint {
  margin-top: 6px;
}
.footnote {
  font-size: 13px;
  margin: 16px 0 0;
  padding: 0 4px;
  text-align: center;
}
@media (max-width: 760px) {
  form {
    grid-template-columns: 1fr;
  }
  .header-inner {
    padding: 18px 20px;
  }
  main {
    padding: 28px 16px 40px;
  }
  .panel,
  .summary {
    padding: 20px;
  }
  h2 {
    font-size: 19px;
  }
  fieldset,
  .units-row {
    padding-left: 0;
  }
  .option {
    flex-wrap: wrap;
    padding: 14px 12px;
    gap: 8px 10px;
  }
  .option.selected {
    padding: 14px 12px;
  }
  .option strong {
    font-size: 15px;
  }
  .amount {
    margin: 0 0 0 30px;
    flex-basis: calc(100% - 30px);
    text-align: left;
    font-size: 14px;
  }
  .option .amount small {
    display: inline;
    margin-left: 6px;
  }
  .units-row {
    flex-wrap: wrap;
  }
  .units-row input {
    flex-shrink: 1;
    min-width: 0;
  }
  .units-row {
    gap: 16px;
  }
  .project-field {
    flex-basis: 100%;
  }
  dd {
    font-size: 18px;
  }
}
.package-card {
  border: 1.5px solid #dce3df;
  border-radius: 12px;
  overflow: hidden;
}
.package-card.selected {
  border-color: #007272;
  background: #f0f8f5;
}
.package-card .option {
  border: 0;
  border-radius: 0;
}
.package-details {
  padding: 0 18px 18px 52px;
  font-size: 14px;
  line-height: 1.45;
  color: #2d4448;
}
.package-details > strong {
  display: block;
  color: #14555a;
  font-weight: 600;
  margin-bottom: 8px;
}
.package-details ol {
  padding-left: 22px;
  margin: 0;
  display: grid;
  gap: 8px;
}
.package-details li {
  padding-left: 4px;
}
.package-details li::marker {
  color: #007272;
  font-weight: 600;
}
.package-details p {
  margin: 0;
}
.recipient-panel > .grid,
.recipient-panel > .reference-person {
  padding-left: 36px;
}
.panel > h2 + .grid,
.panel > h2 + .units-row {
  margin-top: 18px;
}
.makr-notes {
  padding-left: 36px;
  margin-top: 16px;
}
input[aria-invalid='true'] {
  border-color: #a12626 !important;
}
.field-error {
  color: #a12626;
  font-size: 13px;
  margin: 6px 0 0;
}
.option > .people {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
  align-self: flex-start;
  margin-left: auto;
  color: var(--accent);
}
.panel > p.choice-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 36px;
  margin: 14px 0 0;
  font-size: 13px;
  color: #4a5f62;
}
.panel > p.choice-note svg {
  flex-shrink: 0;
}
.panel > p.choice-note.invalid {
  color: #a12626;
}
@media (max-width: 760px) {
  .makr-notes,
  .panel > p.choice-note {
    padding-left: 0;
  }
}
@media (max-width: 760px) {
  .recipient-panel > .grid,
  .recipient-panel > .reference-person {
    padding-left: 0;
  }
  .package-details {
    padding-left: 42px;
  }
}
</style>
