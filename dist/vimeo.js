import{_ as p,o,c as r,z as l,A as m,k as v,w as g,a as d,y as c,B as y,C as k,t as u,d as w,q as b}from"./_plugin-vue_export-helper.js";import{E as h,L as _,W as S}from"./index.js";const x=`.widget-kvass-media-render-vimeo{background-color:#d2d2d2;height:100%;width:100%;position:relative}.widget-kvass-media-render-vimeo iframe{height:100%;width:100%}.widget-kvass-media-render-vimeo>*{position:absolute;top:0;left:0;width:100%;height:100%}.widget-kvass-media-render-vimeo__thumbnail{background-size:cover;background-repeat:no-repeat;background-position:center;filter:blur(10px);opacity:.7}.widget-kvass-media-render-vimeo__blocked{display:flex;justify-content:center;align-items:center;left:50%;top:50%;transform:translate(-50%,-50%)}.widget-kvass-media-render-vimeo__blocked svg{opacity:.3}@media (max-width: 992px){.widget-kvass-media-render-vimeo__blocked svg{font-size:2.5em}}.widget-kvass-media-render-vimeo__blocked-warning{pointer-events:initial;position:absolute;bottom:0;text-align:center;background-color:#f2f2f2;font-size:.6em;bottom:3rem;left:3rem;max-width:400px;font-size:.8em;padding:1.5em 2em}.widget-kvass-media-render-vimeo__blocked-warning-button{padding:.5rem;border:1px solid #818181;backdrop-filter:none;background-color:transparent}@media (max-width: 992px){.widget-kvass-media-render-vimeo__blocked-warning{left:.5rem;bottom:.5rem;font-size:.6em;max-width:200px}}.widget-kvass-media-render-vimeo .fade-enter-active,.widget-kvass-media-render-vimeo .fade-leave-active{transition:opacity .5s}.widget-kvass-media-render-vimeo .fade-enter,.widget-kvass-media-render-vimeo .fade-leave-to{opacity:0}
`,B={props:{url:{type:String,default:""},loop:{type:[String,Boolean],default:!0},autoplay:{type:[String,Boolean],default:!1},controls:{type:[String,Boolean],default:!0},mute:{type:[String,Boolean],default:!1},displayThumbnail:{type:[String,Boolean],default:!0},ignoreConsent:{type:[String,Boolean],default:!1},hideConsent:{type:[String,Boolean],default:!1},thumbnailSource:{type:String,default:""},consentBlockMessage:{type:String,default:"The video is blocked due to lack of consent to cookies"},consentButtonLabel:{type:String,default:"Edit consents"},aspectRatio:{type:String,default:"16/9"}},data(){return{ready:!1,player:null,thumbnail:null,consents:[]}},computed:{kvassDefined(){return typeof Kvass<"u"},showConsent(){return this.hideConsent||!this.kvassDefined?!1:!this.ignoreConsent&&!this.consents.includes("statistics")},videoId(){if(this.url)return[h(this.url,/https\:\/\/(w{3}\.)?vimeo\.com\/(.+)\/?/,{group:2}),h(this.url,/https\:\/\/(w{3}\.)?player\.vimeo\.com\/(video\/)?(.+)\/?/,{group:3})].find(e=>!!e).split("&")[0]}},methods:{openConsent(){this.kvassDefined&&Kvass.emit("consent:show")},play(){!this.player||!this.ready||this.player.play()},async init(){const e={id:this.videoId,loop:this.loop,autoplay:this.autoplay,controls:this.controls,muted:this.mute||this.autoplay,playsinline:1,dnt:1};function t(i){return i==="false"?!1:i==="true"?!0:i}Object.entries(e).map(([i,s])=>e[i]=t(s)),_("https://player.vimeo.com/api/player.js");const n=await S(()=>window.Vimeo,{limit:100});this.player=new n.Player(this.$refs.vimeoPlayer,{...e}),await this.player.ready().then(()=>{this.ready=!0}).catch(i=>{this.ready=!0})}},async mounted(){if(this.displayThumbnail&&(this.thumbnail=!this.thumbnailSource&&this.kvassDefined?`/api/media/thumbnail?url=${this.url}`:this.thumbnailSource),this.ignoreConsent||!this.kvassDefined)return this.init();let e=t=>{if(this.consents=t||[],!(!this.consents||!this.consents.length))return this.consents.includes("statistics")?this.init():this.$nextTick(()=>this.$emit("ended"))};this.kvassDefined&&(Kvass.emit("consent:get",t=>e(t)),Kvass.on("consent:change",e))}},C={key:0,class:"widget-kvass-media-render-vimeo__blocked"},z={class:"widget-kvass-media-render-vimeo__blocked-warning"};function D(e,t,n,i,s,a){return o(),r("div",{class:"widget-kvass-media-render-vimeo",style:c(`aspect-ratio: ${n.aspectRatio};`)},[l((o(),r("div",{key:a.videoId,ref:"vimeoPlayer",class:"widget-kvass-media-render-vimeo__embed",frameborder:"0",allow:"autoplay; fullscreen;",webkitallowfullscreen:"",mozallowfullscreen:""})),[[m,s.ready]]),v(y,{name:"fade",mode:"in-out"},{default:g(()=>[l(d("div",{class:"widget-kvass-media-render-vimeo__thumbnail",style:c({backgroundImage:`url(${s.thumbnail})`})},null,4),[[m,!s.ready&&s.thumbnail]])]),_:1}),a.showConsent?(o(),r("div",C,[d("div",z,[k(u(n.consentBlockMessage)+" ",1),d("button",{class:"widget-kvass-media-render-vimeo__blocked-warning-button",onClick:t[0]||(t[0]=(...f)=>a.openConsent&&a.openConsent(...f))},u(n.consentButtonLabel),1)])])):w("",!0)],4)}const T=p(B,[["render",D],["styles",[x]]]);customElements.define("kvass-vimeo",b(T));
