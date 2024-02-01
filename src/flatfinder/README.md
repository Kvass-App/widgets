# kvass-flatfinder

A simple, embeddable Web Component for navigating Kvass projects.

`https://unpkg.com/@kvass/widgets@latest/dist/flatfinder.js`

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
<kvass-flatfinder
  project-url="https://example.kvass.no"
  project-id="88eda909-9a78-4c2a-8fe3-bc263c283984"
  path-prefix="/residential"
/>
```

## Props

The component has several props for easy configuration.

| Name                   | Type   | Description                                                  | Default |
| :--------------------- | :----- | :----------------------------------------------------------- | :------ |
| project-url `required` | String | Project URL where data will be fetched from.                 |         |
| project-id `required`  | String | The ID of the project specified in the `project-url` prop    |         |
| path-prefix            | String | The prefix in the url path for each property when navigating |         |

## Styling

The widget's styles are based on CSS custom properties, and can be overwritten.
These are the available CSS variables.

| Name                          | Description                 | Default   |
| :---------------------------- | :-------------------------- | :-------- |
| --kvass-flatfinder-background | The form's background color | `#ffffff` |
