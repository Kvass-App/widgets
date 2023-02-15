# kvass-contact

A simple, embeddable Web Component for sending leads to Kvass.

`https://unpkg.com/@kvass/widgets@latest/dist/contact.js`

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

To use the widget, use the `<kvass-contact />` element as shown here.

```html
<kvass-contact account-url="https://example.kvass.no" />
```

## Props

The component has several props for easy configuration.

| Name                   | Type    | Description                                                                              | Default                                 |
| :--------------------- | :------ | :--------------------------------------------------------------------------------------- | :-------------------------------------- |
| account-url `required` | String  | Account URL where data will be sent.                                                     |                                         |
| references `required`  | String  | Comma-separated list of references in {type}:{id} format                                 |                                         |
| default-assignees      | String  | Comma-separated list of userIds. Used as fallback assignees of the created task in Kvass |                                         |
| projects               | String  | Comma-separated list of project ids. If not defined, a selection field will show         |                                         |
| tags                   | String  | Comma-separated list of tags                                                             |                                         |
| upsell                 | Boolean | If `true`, shows a checkbox for upsell                                                   | `false`                                 |
| label-title            | String  | Title of the lead form                                                                   | `"Meld interesse"`                      |
| label-subtitle         | String  | Optional subtitle shown under form title                                                 |                                         |
| label-submit           | String  | Label for the submit button                                                              | `"Meld interesse"`                      |
| privacy-url            | String  | Optional URL to privacy statement                                                        | `{accountUrl}/api/legal/privacy/tenant` |
| label-success          | String  | Message displayed after submit                                                           | `"Takk for interessen!"`                |
| success-theme          | String  | Success theme, enums: ['default', 'overlay']                                             | `"default"`                             |
| submit-timeout         | Number  | Delay on submit reset                                                                    | `2000`                                  |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                             | Description                                                 | Default       |
| :------------------------------- | :---------------------------------------------------------- | :------------ |
| --kvass-contact-background       | The form's background color                                 | `#ffffff`     |
| --kvass-contact-spacing          | Base spacing amount. Other amounts are calculated from this | `2rem`        |
| --kvass-contact-max-width        | Max width of the form                                       | `720px`       |
| --kvass-contact-border-radius    | Base border-radius                                          | `4px`         |
| --kvass-contact-border-color     | Color of the borders of the form fields                     | `#eaeaea`     |
| --kvass-contact-border-width     | Border-width for input fields                               | `1px`         |
| --kvass-contact-color            | Base text color                                             | `#222222`     |
| --kvass-contact-color-inverted   | Inverted text color. Used for the submit button             | `#ffffff`     |
| --kvass-contact-primary          | Primary color. Used for submit button and form elements     | `#1d56d8`     |
| --kvass-contact-error            | Error color. Used for error states                          | `#d81d1d`     |
| --kvass-contact-grid-columns     | Amount of columns in the form                               | `1`           |
| --kvass-contact-disabled         | Background color on disabled button                         | `#eaeaea`     |
| --kvass-contact-input-background | Background color for input fields                           | `transparent` |
| --kvass-contact-outline-width    | Width of focus outline                                      | `2px`         |
| --kvass-contact-outline-offset   | Offset between the form control and its outline             | `0px`         |
| --kvass-contact-checkbox-size    | Size of checkboxes                                          | `1em`         |
