# kvass-map

A simple, embeddable Web Component for maps.

`https://unpkg.com/@kvass/widgets@latest/dist/map.js`

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

To use the widget, use the `<kvass-map />` element as shown here.

```html
<kvass-map coordinates="10.745,59.9123" />
```

## Props

The component has several props for easy configuration.

| Name                   | Type    | Description                                                                             | Default |
| :--------------------- | :------ | :-------------------------------------------------------------------------------------- | :------ |
| coordinates `required` | String  | The coordinates for the main marker.                                                    |         |
| markers                | String  | A list of markers formatted in `lon,lat`. Each marker is separated with `;`             |         |
| address                | String  | The address as a formatted string. This will be visible if `show-address` prop is true. |         |
| show-address           | Boolean | Show a panel with the formatted address string.                                         |         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                           | Description                               | Default                   |
| :----------------------------- | :---------------------------------------- | :------------------------ |
| --kvass-map-background         | The map's background color                | `rgb(0 0 0 / 0.2)`        |
| --kvass-map-address-padding-x  | The inline padding of the address panel   | `0.5rem`                  |
| --kvass-map-address-padding-y  | The block padding of the address panel    | `1rem`                    |
| --kvass-map-address-background | The background color of the address panel | `rgb(0 0 0 / 0.2)`        |
| --kvass-map-address-color      | The text color of the address panel       | `rgb(255 255 255 / 0.75)` |
