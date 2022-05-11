# kvass-lead-form

A simple, embeddable Web Component for sending leads to Kvass.

## Development

To run in development mode, first download the neccessary packages.

```
npm install
```

Then, run in development mode.

```
npm run dev
```

Open `localhost:3000` in the browser of your choice, and you will see the form widget.

## Production

To build a Web Component for production, run `build` instead of `dev`.

```
npm run build
```

To use the Web Component, use the `<kvass-lead-form />` tag as shown here.

```html
<kvass-lead-form account-url="https://example.kvass.no" />
```

## Props

The component has several props for easy customization.

| Name        | Type   | Description                                                | Default                            |
| ----------- | ------ | ---------------------------------------------------------- | ---------------------------------- |
| title       | String | Title of the lead form                                     | `"Meld interesse"`                 |
| subtitle    | String | Optional subtitle under form title                         |                                    |
| submitLabel | String | Label for the submit button                                | `"Meld interesse"`                 |
| tosUrl      | String | URL to privacy statement                                   | `"https://legal.kvass.no/privacy"` |
| accountUrl  | String | Account URL where data will be sent. This prop is required |                                    |

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
