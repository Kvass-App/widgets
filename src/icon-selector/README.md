# kvass-icon-selector

A simple, embeddable Web Component for selecting icons.

`https://unpkg.com/@kvass/widgets@latest/dist/icon-selector.js`

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

To use the widget, use the `<kvass-icon-selector>` element as shown here.

```html
<kvass-icon-selector></kvass-icon-selector>
```

## Props

The component has several props for easy configuration.

| Name  | Type   | Description                      | Default |
| :---- | :----- | :------------------------------- | :------ |
| value | String | The selected icon.               |         |
| label | String | An optional label for the input. |         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                                   | Description                           | Default        |
| :------------------------------------- | :------------------------------------ | :------------- |
| --kvass-icon-selector-border-radius    | The border radius of the input field  | `6px`          |
| --kvass-icon-selector-background-color | The background color of the component | `white`        |
| --kvass-icon-selector-padding-y        | The inline padding                    | `1rem`         |
| --kvass-icon-selector-padding-x        | The block padding                     | `1rem`         |
| --kvass-icon-selector-border-width     | The width of the borders              | `1px`          |
| --kvass-icon-selector-border-style     | The style of the borders              | `solid`        |
| --kvass-icon-selector-border-color     | The color of the borders              | `#eaeaea`      |
| --kvass-icon-selector-max-width        | The maximum width of the component    | `100%`         |
| --kvass-icon-selector-label-color      | The color of the label                | `currentColor` |
| --kvass-icon-selector-label-weight     | The weight of the label               | `400`          |
