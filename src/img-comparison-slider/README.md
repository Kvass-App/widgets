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
<kvass-img-comparison-slider
  first-image="https://example.com/first-image,First image"
  second-image="https://example.com/second-image,Second image"
  options="direction:vertical,keyboard:disabled"
></kvass-img-comparison-slider>
```

## Props

The component has several props for easy configuration.

| Name        | Type    | Description                                               | Enums                   |
| :---------- | :------ | :-------------------------------------------------------- | :---------------------- |
| **options** | String  | key:value pairs separated by comma                        | The following options:  |
| value       | Number  | Position of the divider in percents.                      | `0...100`               |
| hover       | Boolean | Automatically slide on mouse over.                        | `false`, `true`         |
| direction   | String  | Set slider direction.                                     | `horiontal`, `vertical` |
| nonce       |         | Define nonce which gets passed to inline style.           |                         |
| keyboard    | String  | Enable/disable slider position control with the keyboard. | `enabled`, `disabled`   |
| handle      | Boolean | Enable/disable dragging by handle only.                   | `false`, `true`         |
|             |         |                                                           |                         |
| first-image | String  | Image url and text, separated by a comma                  |                         |
| second-mage | String  | Image url and text, separated by a comma                  |                         |
| handle-svg  | String  | The svg on the slider handle                              |                         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                      | Description                                                                              | Default |
| :------------------------ | :--------------------------------------------------------------------------------------- | :------ |
| `--divider-width`         | Width of the vertical line separating both images                                        | `1px`   |
| `--divider-color`         | Color of the vertical line separating the two images                                     | `#fff`  |
| `--divider-shadow`        | Shadow cast by the vertical line separating the two images                               | `none`  |
| `--handle-position-start` | Handle position on the divider axis. In case the handle must be displaced off the center | `50%`   |
