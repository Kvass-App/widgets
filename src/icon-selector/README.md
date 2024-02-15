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

| Name               | Type   | Description                                                 | Default                                                         |
| :----------------- | :----- | :---------------------------------------------------------- | :-------------------------------------------------------------- |
| api-url            | String | The Iconify API endpoint to get icons from.                 | `https://icons.ui.kvass.no`                                     |
| value              | String | The selected icon.                                          |                                                                 |
| label              | String | An optional label for the input.                            |                                                                 |
| default            | String | Fallback icon if value prop is not assigned.                |                                                                 |
| default-search     | String | Use this if you want to have a default search value be set. |                                                                 |
| collections        | String | Comma-separated list of icon collections to be available.   |                                                                 |
| search-placeholder | String | The placeholder of the search input.                        | `Søk på engelsk etter ikonet du leter etter. Eks. "Helicopter"` |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                                      | Description                                       | Default        |
| :---------------------------------------- | :------------------------------------------------ | :------------- |
| --kvass-icon-selector-border-radius       | The border radius of the input field              | `6px`          |
| --kvass-icon-selector-background-color    | The background color of the component             | `white`        |
| --kvass-icon-selector-trigger-padding-y   | The inline padding of the trigger button          | `1rem`         |
| --kvass-icon-selector-trigger-padding-x   | The block padding of the trigger button           | `1rem`         |
| --kvass-icon-selector-border-width        | The width of the borders                          | `1px`          |
| --kvass-icon-selector-border-style        | The style of the borders                          | `solid`        |
| --kvass-icon-selector-border-color        | The color of the borders                          | `#eaeaea`      |
| --kvass-icon-selector-max-width           | The maximum width of the component                | `100%`         |
| --kvass-icon-selector-label-color         | The color of the label                            | `currentColor` |
| --kvass-icon-selector-label-weight        | The weight of the label                           | `400`          |
| --kvass-icon-selector-transition-easing   | The easing function of the navigation transitions | `ease-out`     |
| --kvass-icon-selector-transition-duration | The duration of the navigation transitions        | `100ms`        |
