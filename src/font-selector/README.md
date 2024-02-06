# kvass-font-selector

A simple, embeddable Web Component for selecting fonts.

`https://unpkg.com/@kvass/widgets@latest/dist/font-selector.js`

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

To use the widget, use the `<kvass-flatfinder />` element as shown here.

```html
<kvass-font-selector provider="google" />
```

## Props

The component has several props for easy configuration.

| Name     | Type   | Description                       | Default  |
| :------- | :----- | :-------------------------------- | :------- |
| provider | String | The provider to fetch fonts from. | `google` |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                                | Description                           | Default |
| :---------------------------------- | :------------------------------------ | :------ |
| --kvass-font-selector-border-radius | The border radius of the input fields | `6px`   |
