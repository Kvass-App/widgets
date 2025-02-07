<script setup>
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<template>
  <p class="k-text--xs disclaimer">
    Informasjon i Nabolagsprofilen er hentet fra ulike kilder og det kan
    forekomme feil eller mangler i dataene. Distanser er basert på korteste
    gang- eller kjørbare vei (og luftlinje i noen tilfeller). Vurderingene,
    sitatene og bildene fra lokalkjente er innhentet på nettstedet Nabolag.no og
    er aggregerte data basert på svar innenfor et gitt nabolag. Eiendomsprofil
    AS, FINN.no AS, innholdsleverandørene (se kilder) eller samarbeidspartnere
    kan ikke holdes ansvarlig for feil eller mangler i dataene. Kilder:
    Statistisk sentralbyrå (SSB), Statens kartverk, Geodata AS, Nabolag.no m.fl.
    Kartene er levert av Finn/Norkart. Vi benytter informasjonskapsler (cookies)
    til å lage generelle statistikker om bruken av våre tjenester. Ingen
    sensitiv bruker-informasjon samles inn, og vi selger ei heller brukerdata
    videre til andre. Copyright © Eiendomsprofil AS {{ year }}
  </p>
</template>

<style lang="scss">
.disclaimer {
}
</style>
