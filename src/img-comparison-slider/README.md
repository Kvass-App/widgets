# kvass-img-comparison-slider

A simple, embeddable Web Component to compare images.

`https://unpkg.com/@kvass/widgets@latest/dist/img-comparison-slider.js`

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

To use the widget, use the `<kvass-img-comparison-slider />` element as shown here.

```html
<kvass-img-comparison-slider account-url="https://example.kvass.no" />
```

## Props

The component has several props for easy configuration.

| Name           | Type    | Description                                               | Enums                   |
| :------------- | :------ | :-------------------------------------------------------- | :---------------------- |
| `Options`      |         |                                                           |                         |
| value          | Number  | Position of the divider in percents.                      | `0...100`               |
| hover          | Boolean | Automatically slide on mouse over.                        | `false`, `true`         |
| direction      | String  | Set slider direction.                                     | `horiontal`, `vertical` |
| nonce          |         | Define nonce which gets passed to inline style.           |                         |
| keyboard       | String  | Enable/disable slider position control with the keyboard. | `enabled`, `disabled`   |
| handle         | Boolean | Enable/disable dragging by handle only.                   | `false`, `true`         |
|                |         |                                                           |                         |
| `Data`         |         |                                                           |                         |
| firstImage     | Object  | Optional subtitle shown under form title                  |                         |
| secondImage    | Object  | Label for the submit button                               |                         |
|                |         |                                                           |                         |
| `handleSVG`    |         |                                                           |                         |
| privacy-url    | String  | Optional URL to privacy statement                         |                         |
| label-success  | String  | Message displayed after submit                            |                         |
| success-theme  | String  | Success theme, enums: ['default', 'overlay']              |                         |
| submit-timeout | Number  | Delay on submit reset                                     |                         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                             | Description                                                                              | Default       |
| :------------------------------- | :--------------------------------------------------------------------------------------- | :------------ |
| `--divider-width`                | Width of the vertical line separating both images                                        | `1px`         |
| `--divider-color`                | Color of the vertical line separating the two images                                     | `#fff`        |
| `--divider-shadow`               | Shadow cast by the vertical line separating the two images                               | `none`        |
| `--handle-position-start`        | Handle position on the divider axis. In case the handle must be displaced off the center | `50%`         |
| --kvass-contact-border-color     | Color of the borders of the form fields                                                  | `#eaeaea`     |
| --kvass-contact-border-width     | Border-width for input fields                                                            | `1px`         |
| --kvass-contact-color            | Base text color                                                                          | `#222222`     |
| --kvass-contact-color-inverted   | Inverted text color. Used for the submit button                                          | `#ffffff`     |
| --kvass-contact-primary          | Primary color. Used for submit button and form elements                                  | `#1d56d8`     |
| --kvass-contact-error            | Error color. Used for error states                                                       | `#d81d1d`     |
| --kvass-contact-grid-columns     | Amount of columns in the form                                                            | `1`           |
| --kvass-contact-disabled         | Background color on disabled button                                                      | `#eaeaea`     |
| --kvass-contact-input-background | Background color for input fields                                                        | `transparent` |
| --kvass-contact-outline-width    | Width of focus outline                                                                   | `2px`         |
| --kvass-contact-outline-offset   | Offset between the form control and its outline                                          | `0px`         |
| --kvass-contact-checkbox-size    | Size of checkboxes                                                                       | `1em`         |
