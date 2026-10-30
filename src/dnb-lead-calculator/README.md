# kvass-lead-calculator

Price calculator and lead form for DNB Eiendom brokers ordering a Kvass project
site with unit selector (PD-131). Hosted in integrations on
`/dnb-kvass-kalkulator`.

`https://unpkg.com/@kvass/widgets@latest/dist/dnb-lead-calculator.js`

```html
<script
  type="module"
  src="https://unpkg.com/@kvass/widgets@<version>/dist/dnb-lead-calculator.js"
></script>
<kvass-lead-calculator
  endpoint="https://manager.kvass.no/api/lead/dnb-kvass-calculator"
></kvass-lead-calculator>
```

Figtree is loaded from Google Fonts on the document, all other styles live in
the Shadow DOM.

## Props

| Prop       | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| `endpoint` | Manager endpoint the lead is posted to. Required to submit. |

## Access code

The form is shown after the right access code is entered. This only keeps
casual visitors out, the code runs in the browser. Only a SHA-256 hash of the
code is stored, in `accessHash` in `access.js`. New code:

```sh
printf %s 'new-code' | shasum -a 256
```

The browser remembers access in localStorage until the code changes.

## Prices

Rates and rules live in `pricing.js`. Monthly license is project license plus
base package. Establishment (50 % discount) and unit selector setup follow the
project size in tiers: 1–9, 10–29 and 30–80 units. Above 80 units an add-on is
added per started 30 units, also on the license. Onboarding has 100 % discount.
Prices are always shown as for a new customer.

## Submission

`submitRequest()` in `submit.js` posts the form data and calculated prices
(with `source: "dnb"`) to the `endpoint` prop, normally
`POST https://manager.kvass.no/api/lead/dnb-kvass-calculator`. Manager registers
the lead in HubSpot and emails leads@kvass.no.

- Without `endpoint` nothing is sent and an error is shown below the send
  button.
- Point `endpoint` to `https://staging.manager.kvass.no/...` to test without
  creating real leads in HubSpot.
- A hidden `website` field is a honeypot, manager ignores submissions where it
  is filled in.
- Failed submissions show an error below the send button, with a separate
  message for too many submissions (HTTP 429).
