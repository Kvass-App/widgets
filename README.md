# kvass-lead-form

A simple, embeddable Web Component for sending leads to Kvass.

## Develop

To run in development mode, first install the neccessary packages.

```
npm install
```

Then, run in development mode.

```
npm run dev
```

Open `localhost:3000` in the browser of your choice, and you will see the form widget.

## Build

To build the widget for production, run `build` instead of `dev`.

```
npm run build
```

To use the widget, use the `<kvass-lead-form />` element as shown here.

```html
<kvass-lead-form account-url="https://example.kvass.no" />
```

## Props

The component has several props for easy configuration.

| Name                  | Type    | Description                                                                      | Default                                 |
| --------------------- | ------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| title                 | String  | Title of the lead form                                                           | `"Meld interesse"`                      |
| subtitle              | String  | Optional subtitle shown under form title                                         |                                         |
| submitLabel           | String  | Label for the submit button                                                      | `"Meld interesse"`                      |
| privacyUrl            | String  | Optional URL to privacy statement                                                | `{accountUrl}/api/legal/privacy/tenant` |
| accountUrl `required` | String  | Account URL where data will be sent.                                             |                                         |
| projects              | String  | Comma-separated list of project ids. If not defined, a selection field will show |                                         |
| references `required` | String  | Comma-separated list of references in {type}:{id} format                         |                                         |
| upsell                | Boolean | If `true`, shows a checkbox for upsell                                           | `false`                                 |
| tags                  | String  | Comma-separated list of tags                                                     |                                         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                             | Description                                                 | Default   |
| -------------------------------- | ----------------------------------------------------------- | --------- |
| --kvass-lead-form-background     | The form's background color                                 | `#ffffff` |
| --kvass-lead-form-spacing        | Base spacing amount. Other amounts are calculated from this | `2rem`    |
| --kvass-lead-form-max-width      | Max width of the form                                       | `720px`   |
| --kvass-lead-form-border-radius  | Base border-radius                                          | `4px`     |
| --kvass-lead-form-border-color   | Color of the borders of the form fields                     | `#eaeaea` |
| --kvass-lead-form-color          | Base text color                                             | `#222222` |
| --kvass-lead-form-color-inverted | Inverted text color. Used for the submit button             | `#ffffff` |
| --kvass-lead-form-primary        | Primary color. Used for the submit button                   | `#1d56d8` |
| --kvass-lead-form-error          | Error color. Used for error states                          | `#d81d1d` |
| --kvass-lead-form-grid-columns   | Amount of columns in form                                   | `1`       |
