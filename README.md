# Kvass Widgets

Kvass Web Components to embed on external websites.

## Create new widgets

To create new widgets, simply create a new folder in `src/`. The folder should contain all files needed for the Web Component.

If you have the widget split into multiple vue components, you'll have to import each of the components styles, and merge them in the `main.js`file.

[See an example here](/src/contact/main.js)

## Build

Add the widget to `widgets.config.js`. That entry decides what gets built and what goes in `dist/manifest.json`.

```js
// ./widgets.config.js
export default {
  // ...
  'new-widget': {
    path: './src/new-widget/main.js',
    description: 'What the widget does, in one line',
    // isInternal: true, for widgets only used inside Kvass admin
  },
}
```

`npm run build` creates `dist/<name>.js` for every widget, plus the manifest. A release builds and publishes them when `development` is merged into `master`.