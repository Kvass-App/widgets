# kvass-youtube

A simple, embeddable Web Component to play youtube videos.

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

To use the widget, use the `<kvass-youtube />` element as shown here.

```html
<kvass-youtube
  url="https://www.youtube.com/watch?v=oPVte6aMprI"
  autoplay="true"
  loop="true"
></kvass-youtube>

<script type="module" src="/src/youtube/main.js"></script>
```

### YouTube Shorts

Shorts URLs (`https://www.youtube.com/shorts/<id>`) are detected automatically and rendered as a vertical 9:16 player, centered inside the element. The `aspect-ratio` attribute only applies to regular videos.

```html
<kvass-youtube url="https://www.youtube.com/shorts/qWYn55cRh9w"></kvass-youtube>
```

## Props

The component has several props for easy configuration.

| Name                | Type                                | Description                                  | Enums           | Default                                                |
| :------------------ | :---------------------------------- | :------------------------------------------- | :-------------- | ------------------------------------------------------ |
| **url**             | String                              | youtube embed / share url                    |                 |
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
