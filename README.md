# Kvass Widgets

Kvass Web Components to embed on external websites.

## Create new widgets

To create new widgets, simply create a new folder in `src/`. The folder should contain all files needed for the Web Component.

If you have the widget split into multiple vue components, you'll have to import each of the components styles, and merge them in the `main.js`file.

[See an example here](/src/contact/main.js)

## Build

To make sure the web component builds correctly, you'll have to add a property in the rollup build options

```js
// ./vite.config.js
export default defineConfig({
  // ...
  build: {
    rollupOptions: {
      // ...
      input: {
        contact: fileURLToPath(new URL('./src/contact/main.js', import.meta.url)),
        // newWidget: fileURLToPath(new URL('./src/newWidget/main.js', import.meta.url)),
      },
    },
  },
  // ...
})
```

The components will be automatically built after each commit, and a `js` file will be created in `/dist`.