# kvass-location-selector

A simple, embeddable Web Component for location selector.

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

To use the widget, use the `<kvass-location-selector />` element as shown here.

```html
<kvass-location-selector />
```

## Props

The component has several props for easy configuration.

| Name          | Type    | Description                         | Default |
| :------------ | :------ | :---------------------------------- | :------ |
|               |
| show-warning  | Boolean | Show a panel with error             |         |
| show-selected | Boolean | Show a panel with selected position |         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                            | Description         | Default |
| :------------------------------ | :------------------ | :------ |
| --kvass-location-selector-width | The component width | `900px` |

|
