const DefaultLabels = {
  idleTitle: '3D-visualisering',
  idleSubtitle: `En vellykket presentasjon av et nyboligprosjekt spiller en avgjørende rolle i å fange interessen til potensielle kjøpere - og det hele starter ofte med gode 3D-visualiseringer.
Vi leverer visualiseringer av høy kvalitet som gir prosjektet den oppmerksomheten og interessen det fortjener.
Klar for å bringe idéene dine til liv? Start bestillingen ved å spesifisere detaljene for visualiseringen din - vi tar oss av resten.`,
  startOrder: 'Start bestilling',

  orderImageTitle: 'Bestill 3D bilder',
  orderImageSubtitle:
    'Hva slags bilder trenger du? Velg mellom interiørbilder, eksteriørbilder, dronefoto eller andre typer prosjektbilder.',

  newOrder: 'Legg til 3D bilde',

  '3dImage': '3D bilde',
  specifyVisualizationDetails: 'Spesifiser detaljene for din visualisering',

  summaryOfVisualization: 'Sammendrag av visualiseringene',

  uploadFilesTitle: 'Last opp filer',
  uploadFilesSubtitle: `Har du egne 3D-modeller, referansebilder eller inspirasjon du vil dele med oss?
Last opp filene her, så får vi et bedre grunnlag for å forstå visjonen din og skape et resultat som treffer akkurat slik du ønsker det.`,

  servicesTitle: 'Tilleggsprodukter',
  servicesSubTitile: 'Velg tillegsprodukter',

  additionalServices: 'Tilleggsprodukter',

  summaryTitle: 'Oppsummering',
  summarySubtitle: 'Her får du en oppstilling av pris for dine valg.',

  confirmationTitle: '',
  confirmationSubtitle: '',

  sendOrder: 'Send Bestilling',

  '3dImages': '3D bilder',
  imageType: 'Type visualisering',
  imageTypeTooltip: 'Velg mellom interiør eller eksteriør bilde',
  interior: 'Interiør',
  exterior: 'Eksteriør',
  totalSuffix: 'stk',
  droneExterior: 'Drone bilder',
  numberOfUnits: 'Antall enheter',
  numberOfUnitsTooltip: 'Antall enheter som vises i 3d bildet',
  numberOfUnitsPlaceholder: '14',
  deliveryDescription: 'Leveransebeskrivelse',
  deliveryDescriptionTooltip:
    'For eksempel gulv de ønsker, kjøkkentegninger, fliser, hvor mange spotter, leverandører av produkter, materialvalg, kameraposisjon',
  deliveryDescriptionPlaceholder: 'Moderne, nordisk stil med naturlig lys',
  interiorRoom: 'Hvilket rom',
  interiorRoomTooltip: 'Hvilket rom? Soverom, bad, stue..',
  interiorRoomPlaceholder: 'Stue',
  drone: 'Skal det være drone bilde?',
  droneTooltip: 'Skal det være drone bilde?',
  select: 'Velg',
  selected: 'Valgt',
  removeSelected: 'Velg bort',
  remove: 'Slett',
  delete: 'Slett',
  next: 'Neste',
  prev: 'Forrige',
  selectImages: 'Du må velge minimum :min :attribute',

  totalPrice: 'Samlet veiledende pris',
  totalPriceDisclaimer: `Alle priser er veiledende, avhengig av prosjektets kompleksitet,
          omfang og endringer i kundens spesifikasjoner. Endelig pris fastsettes
          etter nærmere avtale.`,

  orderSendt: 'Bestilling sendt',
  thankYouForYourOrder:
    'Takk for din bestilling, vi vil kontakte deg for videre oppfølgning',

  no3DImages: '',
  no3DImagesTooltip: '',

  editOrderedImages: 'Rediger og tilpass dine 3D-bilder',
  uploadFiles: 'Last opp relevante filer for din 3D bestilling',
  uploadFilesTooltip: `<div><b>Last opp relevante filer for din 3D-bestilling</b>
For at vi skal kunne lage en så nøyaktig og inspirerende 3D-visualisering som mulig, trenger vi følgende:</div>
<b>3D-modell fra arkitekt</b> (f.eks. .dwg, .rvt, .skp eller lignende)

<b>Inspirasjonsbilder for interiør</b> (f.eks. stemningsbilder, fargepaletter, møblering)

<b>Eventuelle plantegninger, snitt eller fasader</b> fra arkitekten, hvis tilgjengelig
<div>
Jo mer materiale du kan dele med oss, desto bedre resultat kan vi levere.
Takk for at du hjelper oss med å forstå visjonen din!</div>`,
  dropMessage: 'Dra en fil hit eller <b>velg</b> for å laste opp',
  files: 'Filer',
  seperateOffer: 'Seperat tilbud',

  moveableElements: 'Bevegelige elementer',
  moveableElementsDescription:
    'Visualisering med dynamiske komponenter som f.eks. dører som åpnes, personer i bevegelse eller biler som kjører - gir liv til scenen.',
  animations: 'Animasjoner',
  animationsDescription:
    'Filmklipp som viser prosjektet over tid, for eksempel en gjennomgang av rom eller utendørsområder - ideelt for presentasjoner og markedsføring.',
  floorplan: 'Plantegning 2D eller 3D',
  floorplanDescription:
    'Oversiktsbilder av bygget i enten 2D (flat visning) eller 3D (romlig visning) - nyttig for planlegging og forståelse av rominndeling.',
  sundiagram: 'Soldiagram',
  sundiagramDescription:
    'Visualisering av solens bevegelser over tomten/prosjektet gjennom dagen og året - viser hvordan lys og skygge påvirker området.',
  interactiv3DModel: 'Interaktiv 3D modell',
  interactiv3DModelDescription:
    'En modell brukeren selv kan navigere i, rotere og utforske i eget tempo - gir en realistisk og engasjerende opplevelse av prosjektet.',
  '360': '360',
  '360Description':
    'Panoramabilder eller visninger hvor brukeren kan se seg rundt i et rom eller område i 360 grader - perfekt for å vise helheten.',

  priceNotIncluded:
    'Pris for dette er ikke inkludert, og det vil bli gitt et separat tilbud i etterkant.',

  comment: 'Kommentar',
  cancel: 'Avbryt',
  confirm: 'Bekreft',
}

const Services = [
  {
    id: 'movableElements',
    vimeo: {
      url: 'https://player.vimeo.com/video/1045022734?muted=1&autoplay=1&controls=0&dnt=1&app_id=122963',
      displayThumbnail: true,
      thumbnailSource:
        'https://i.vimeocdn.com/video/1968526494-6d018ab17b4a68ecdf0775ac2cba5e2e5da1cec62453e91a789e5ce514177891-d_295x166',
    },
    label: 'moveableElements',
    description: 'moveableElementsDescription',
  },

  {
    id: 'animations',
    vimeo: {
      url: 'https://player.vimeo.com/video/1045017474?muted=1&autoplay=1&controls=0&dnt=1&app_id=122963',
      displayThumbnail: true,
      thumbnailSource:
        'https://i.vimeocdn.com/video/1968520200-f7babb53e9aa29976cd93d6dc126877f3da3424338766407d39fb6539b61a9e5-d_295x166',
    },
    label: 'animations',
    description: 'animationsDescription',
  },

  {
    id: 'floorplan',
    image: {
      src: 'https://cms.kvass.no/media/Kvass_visualisering_1680x1080px.jpg',
    },
    label: 'floorplan',
    description: 'floorplanDescription',
  },

  {
    id: 'sundiagram',
    image: {
      src: 'https://cms.kvass.no/media/Kvass_visualisering_1680x1080px.jpg',
    },
    label: 'sundiagram',
    description: 'sundiagramDescription',
  },

  {
    id: 'interactiv3DModel',
    image: {
      src: 'https://cms.kvass.no/media/Kvass_visualisering_1680x1080px.jpg',
    },
    label: 'interactiv3DModel',
    description: 'interactiv3DModelDescription',
  },

  {
    id: '360',
    image: {
      src: 'https://cms.kvass.no/media/Kvass_visualisering_1680x1080px.jpg',
    },
    label: '360',
    description: '360Description',
  },
]

export { Services, DefaultLabels }
