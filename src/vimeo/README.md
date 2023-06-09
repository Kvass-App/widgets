# kvass-vimeo

A simple, embeddable Web Component to play vimeo videos.

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

To use the widget, use the `<kvass-vimeo />` element as shown here.

```html
<kvass-vimeo
  url="https://vimeo.com/833277445"
  autoplay="true"
  loop="true"
></kvass-vimeo>

<script type="module" src="/src/vimeo/main.js"></script>
```

## Props

The component has several props for easy configuration.

| Name                | Type                                | Description                                  | Enums           | Default                                                |
| :------------------ | :---------------------------------- | :------------------------------------------- | :-------------- | ------------------------------------------------------ |
| **url**             | String                              | vimeo embed / share url                      |                 |
| loop                | String / Boolean                    | Loop video                                   | `false`, `true` | true                                                   |
| autoplay            | String / Boolean                    | Autoplay video                               | `false`, `true` | false                                                  |
| controls            | String / Boolean                    | Enable / disable control bar                 | `false`, `true` | true                                                   |
| mute                | String / Boolean                    | Mute sound                                   | `false`, `true` | false                                                  |
| displayThumbnail    | String                              | specify if the thumbnail should be displayed | `false`, `true` | true                                                   |
| ignoreConsent       | Boolean                             | spesify to ignore consent                    | `false`, `true` | false                                                  |
| hideConsent         | specify to hide the consent warning |                                              | `false`, `true` | false                                                  |
| thumbnailSource     | String                              | specify the soruce of the thumbnail          |                 | if Kvass defined: /api/media/thumbnail?url=${this.url} |
| consentBlockMessage | String                              | Block consent message                        |                 | The video is blocked due to lack of consent to cookies |
| consentButtonLabel  | String                              | Label on consent button                      |                 | Edit consents                                          |
| aspect-ratio        | String                              | aspect ratio of the video                    |                 | 16/9                                                   |
