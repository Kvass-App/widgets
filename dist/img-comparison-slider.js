import{s as L,v as T,_ as M,b as E,e as S,w as _,m as D,u as b,o as P,a as v,t as k,q as C}from"./plugin-vue_export-helper.js";(()=>{var d={792:(o,n,r)=>{r.d(n,{Z:()=>m});var a=r(609),l=r.n(a)()(function(p){return p[1]});l.push([o.id,':host{--divider-width: 1px;--divider-color: #fff;--divider-shadow: none;--default-handle-width: 50px;--default-handle-color: #fff;--default-handle-opacity: 1;--default-handle-shadow: none;--handle-position-start: 50%;position:relative;display:inline-block;overflow:hidden;line-height:0;direction:ltr}@media screen and (-webkit-min-device-pixel-ratio: 0)and (min-resolution: 0.001dpcm){:host{outline-offset:1px}}:host(:focus){outline:2px solid -webkit-focus-ring-color}::slotted(*){-webkit-user-drag:none;-khtml-user-drag:none;-moz-user-drag:none;-o-user-drag:none;user-drag:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.first{position:absolute;left:0;top:0;right:0;line-height:normal;font-size:100%;max-height:100%;height:100%;width:100%;--exposure: 50%;--keyboard-transition-time: 0ms;--default-transition-time: 0ms;--transition-time: var(--default-transition-time)}.first .first-overlay-container{position:relative;clip-path:inset(0 var(--exposure) 0 0);transition:clip-path var(--transition-time);height:100%}.first .first-overlay{overflow:hidden;height:100%}.first.focused{will-change:clip-path}.first.focused .first-overlay-container{will-change:clip-path}.second{position:relative}.handle-container{transform:translateX(50%);position:absolute;top:0;right:var(--exposure);height:100%;transition:right var(--transition-time),bottom var(--transition-time)}.focused .handle-container{will-change:right}.divider{position:absolute;height:100%;width:100%;left:0;top:0;display:flex;align-items:center;justify-content:center;flex-direction:column}.divider:after{content:" ";display:block;height:100%;border-left-width:var(--divider-width);border-left-style:solid;border-left-color:var(--divider-color);box-shadow:var(--divider-shadow)}.handle{position:absolute;top:var(--handle-position-start);pointer-events:none;box-sizing:border-box;margin-left:1px;transform:translate(calc(-50% - 0.5px), -50%);line-height:0}.default-handle{width:var(--default-handle-width);opacity:var(--default-handle-opacity);transition:all 1s;filter:drop-shadow(var(--default-handle-shadow))}.default-handle path{stroke:var(--default-handle-color)}.vertical .first-overlay-container{clip-path:inset(0 0 var(--exposure) 0)}.vertical .handle-container{transform:translateY(50%);height:auto;top:unset;bottom:var(--exposure);width:100%;left:0;flex-direction:row}.vertical .divider:after{height:1px;width:100%;border-top-width:var(--divider-width);border-top-style:solid;border-top-color:var(--divider-color);border-left:0}.vertical .handle{top:auto;left:var(--handle-position-start);transform:translate(calc(-50% - 0.5px), -50%) rotate(90deg)}',""]);const m=l},609:o=>{o.exports=function(n){var r=[];return r.toString=function(){return this.map(function(a){var l=n(a);return a[2]?"@media ".concat(a[2]," {").concat(l,"}"):l}).join("")},r.i=function(a,l,m){typeof a=="string"&&(a=[[null,a,""]]);var p={};if(m)for(var f=0;f<this.length;f++){var g=this[f][0];g!=null&&(p[g]=!0)}for(var h=0;h<a.length;h++){var e=[].concat(a[h]);m&&p[e[0]]||(l&&(e[2]?e[2]="".concat(l," and ").concat(e[2]):e[2]=l),r.push(e))}},r}}},u={};function c(o){var n=u[o];if(n!==void 0)return n.exports;var r=u[o]={id:o,exports:{}};return d[o](r,r.exports,c),r.exports}c.n=o=>{var n=o&&o.__esModule?()=>o.default:()=>o;return c.d(n,{a:n}),n},c.d=(o,n)=>{for(var r in n)c.o(n,r)&&!c.o(o,r)&&Object.defineProperty(o,r,{enumerable:!0,get:n[r]})},c.o=(o,n)=>Object.prototype.hasOwnProperty.call(o,n),(()=>{var o=c(792);const n="rendered",r=(h,e)=>{const i=h.getBoundingClientRect();let t,s;return e.type==="mousedown"?(t=e.clientX,s=e.clientY):(t=e.touches[0].clientX,s=e.touches[0].clientY),t>=i.x&&t<=i.x+i.width&&s>=i.y&&s<=i.y+i.height},a=document.createElement("template");a.innerHTML='<div class="second" id="second"> <slot name="second"><slot name="before"></slot></slot> </div> <div class="first" id="first"> <div class="first-overlay"> <div class="first-overlay-container" id="firstImageContainer"> <slot name="first"><slot name="after"></slot></slot> </div> </div> <div class="handle-container"> <div class="divider"></div> <div class="handle" id="handle"> <slot name="handle"> <svg xmlns="http://www.w3.org/2000/svg" class="default-handle" viewBox="-8 -3 16 6"> <path d="M -5 -2 L -7 0 L -5 2 M 5 -2 L 7 0 L 5 2" fill="none" vector-effect="non-scaling-stroke"/> </svg> </slot> </div> </div> </div> ';const l={ArrowLeft:-1,ArrowRight:1},m=["horizontal","vertical"],p=h=>({x:h.touches[0].pageX,y:h.touches[0].pageY}),f=h=>({x:h.pageX,y:h.pageY});class g extends HTMLElement{constructor(){super(),this.exposure=this.hasAttribute("value")?parseFloat(this.getAttribute("value")):50,this.slideOnHover=!1,this.slideDirection="horizontal",this.keyboard="enabled",this.isMouseDown=!1,this.animationDirection=0,this.isFocused=!1,this.handle=!1,this.onMouseMove=t=>{if(this.isMouseDown||this.slideOnHover){const s=f(t);this.slideToPage(s)}},this.bodyUserSelectStyle="",this.onMouseDown=t=>{if(this.slideOnHover||this.handle&&!r(this.handleElement,t))return;t.preventDefault(),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onWindowMouseUp),this.isMouseDown=!0,this.enableTransition();const s=f(t);this.slideToPage(s),this.focus(),this.bodyUserSelectStyle=window.document.body.style.userSelect,window.document.body.style.userSelect="none"},this.onWindowMouseUp=()=>{this.isMouseDown=!1,window.document.body.style.userSelect=this.bodyUserSelectStyle,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onWindowMouseUp)},this.touchStartPoint=null,this.isTouchComparing=!1,this.hasTouchMoved=!1,this.onTouchStart=t=>{this.handle&&!r(this.handleElement,t)||(this.touchStartPoint=p(t),this.isFocused&&(this.enableTransition(),this.slideToPage(this.touchStartPoint)))},this.onTouchMove=t=>{if(this.touchStartPoint===null)return;const s=p(t);if(this.isTouchComparing)return this.slideToPage(s),t.preventDefault(),!1;if(!this.hasTouchMoved){const w=Math.abs(s.y-this.touchStartPoint.y),x=Math.abs(s.x-this.touchStartPoint.x);if(this.slideDirection==="horizontal"&&w<x||this.slideDirection==="vertical"&&w>x)return this.isTouchComparing=!0,this.focus(),this.slideToPage(s),t.preventDefault(),!1;this.hasTouchMoved=!0}},this.onTouchEnd=()=>{this.isTouchComparing=!1,this.hasTouchMoved=!1,this.touchStartPoint=null},this.onBlur=()=>{this.stopSlideAnimation(),this.isFocused=!1,this.firstElement.classList.remove("focused")},this.onFocus=()=>{this.isFocused=!0,this.firstElement.classList.add("focused")},this.onKeyDown=t=>{if(this.keyboard==="disabled")return;const s=l[t.key];this.animationDirection!==s&&s!==void 0&&(this.animationDirection=s,this.startSlideAnimation())},this.onKeyUp=t=>{if(this.keyboard==="disabled")return;const s=l[t.key];s!==void 0&&this.animationDirection===s&&this.stopSlideAnimation()},this.resetDimensions=()=>{this.imageWidth=this.offsetWidth,this.imageHeight=this.offsetHeight};const e=this.attachShadow({mode:"open"}),i=document.createElement("style");i.innerHTML=o.Z,this.getAttribute("nonce")&&i.setAttribute("nonce",this.getAttribute("nonce")),e.appendChild(i),e.appendChild(a.content.cloneNode(!0)),this.firstElement=e.getElementById("first"),this.secondElement=e.getElementById("second"),this.handleElement=e.getElementById("handle")}get value(){return this.exposure}set value(e){const i=parseFloat(e);i!==this.exposure&&(this.exposure=i,this.enableTransition(),this.setExposure())}get hover(){return this.slideOnHover}set hover(e){this.slideOnHover=e.toString().toLowerCase()!=="false",this.removeEventListener("mousemove",this.onMouseMove),this.slideOnHover&&this.addEventListener("mousemove",this.onMouseMove)}get direction(){return this.slideDirection}set direction(e){this.slideDirection=e.toString().toLowerCase(),this.slide(0),this.firstElement.classList.remove(...m),m.includes(this.slideDirection)&&this.firstElement.classList.add(this.slideDirection)}static get observedAttributes(){return["hover","direction"]}connectedCallback(){this.hasAttribute("tabindex")||(this.tabIndex=0),this.addEventListener("dragstart",e=>(e.preventDefault(),!1)),new ResizeObserver(this.resetDimensions).observe(this),this.setExposure(0),this.keyboard=this.hasAttribute("keyboard")&&this.getAttribute("keyboard")==="disabled"?"disabled":"enabled",this.addEventListener("keydown",this.onKeyDown),this.addEventListener("keyup",this.onKeyUp),this.addEventListener("focus",this.onFocus),this.addEventListener("blur",this.onBlur),this.addEventListener("touchstart",this.onTouchStart,{passive:!0}),this.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.addEventListener("touchend",this.onTouchEnd),this.addEventListener("mousedown",this.onMouseDown),this.handle=this.hasAttribute("handle"),this.hover=!!this.hasAttribute("hover")&&this.getAttribute("hover"),this.direction=this.hasAttribute("direction")?this.getAttribute("direction"):"horizontal",this.resetDimensions(),this.classList.contains(n)||this.classList.add(n),this.querySelectorAll('[slot="before"], [slot="after"]').length>0&&console.warn(`<img-comparison-slider>: slot names "before" and "after" are deprecated and soon won't be supported. Please use slot="first" instead of slot="after", and slot="second" instead of slot="before".`)}disconnectedCallback(){this.transitionTimer&&window.clearTimeout(this.transitionTimer)}attributeChangedCallback(e,i,t){e==="hover"&&(this.hover=t),e==="direction"&&(this.direction=t),e==="keyboard"&&(this.keyboard=t==="disabled"?"disabled":"enabled")}setExposure(e=0){var i;this.exposure=(i=this.exposure+e)<0?0:i>100?100:i,this.firstElement.style.setProperty("--exposure",100-this.exposure+"%")}slide(e=0){this.setExposure(e);const i=new Event("slide");this.dispatchEvent(i)}slideToPage(e){this.slideDirection==="horizontal"&&this.slideToPageX(e.x),this.slideDirection==="vertical"&&this.slideToPageY(e.y)}slideToPageX(e){const i=e-this.getBoundingClientRect().left-window.scrollX;this.exposure=i/this.imageWidth*100,this.slide(0)}slideToPageY(e){const i=e-this.getBoundingClientRect().top-window.scrollY;this.exposure=i/this.imageHeight*100,this.slide(0)}enableTransition(){this.firstElement.style.setProperty("--transition-time","100ms"),this.transitionTimer=window.setTimeout(()=>{this.firstElement.style.setProperty("--transition-time","var(--default-transition-time)"),this.transitionTimer=null},100)}startSlideAnimation(){let e=null,i=this.animationDirection;this.firstElement.style.setProperty("--transition-time","var(--keyboard-transition-time)");const t=s=>{if(this.animationDirection===0||i!==this.animationDirection)return;e===null&&(e=s);const w=(s-e)/16.666666666666668*this.animationDirection;this.slide(w),setTimeout(()=>window.requestAnimationFrame(t),0),e=s};window.requestAnimationFrame(t)}stopSlideAnimation(){this.animationDirection=0,this.firstElement.style.setProperty("--transition-time","var(--default-transition-time)")}}typeof window!="undefined"&&window.customElements.define("img-comparison-slider",g)})()})();const A=L({name:"ImgComparisonSlider",setup(d,{slots:u}){return()=>T("img-comparison-slider",u.default())}});var I=`.img-comparison-slider{width:100%;height:100%;--divider-width: 4px;--divider-color: black;aspect-ratio:var(--kvass-img-comparison-slider-aspect-ratio, 1.7777777778)}.img-comparison-slider__image{width:100%;height:100%;aspect-ratio:var(--kvass-img-comparison-slider-aspect-ratio, 1.7777777778)}.img-comparison-slider .handle{display:flex;flex-direction:row;justify-content:center;align-items:center;flex-wrap:nowrap;gap:1rem;width:2000px;font-size:1rem}@media (max-width: 600px){.img-comparison-slider .handle{font-size:.75rem}}.img-comparison-slider .handle__caption{color:#fff;word-wrap:wrap;width:100%}.img-comparison-slider .handle__caption--left{text-align:right}.img-comparison-slider .handle__svg{padding:.3em;background-color:#000;border-radius:100%}.img-comparison-slider .handle__svg svg{width:2.5em;height:2.5em}
`;const B=["src"],H=["src"],z={slot:"handle",class:"handle"},O={class:"handle__caption handle__caption--left"},F=["innerHTML"],U={class:"handle__caption handle__caption--right"},X={__name:"ImgComparisonSlider.ce",props:{data:{type:Object,default:()=>({firstImage:{src:"https://img-comparison-slider.sneas.io/demo/images/before.webp",name:"Kort Bildetekst"},secondImage:{src:"https://img-comparison-slider.sneas.io/demo/images/after.webp",name:"Lang lang lang bildetekst "}})},options:{type:Object,default:()=>({})},handleSVG:{type:String,default:'<svg xmlns="http://www.w3.org/2000/svg"  viewBox="-8 -3 16 6"><path stroke="#fff" d="M -3 -2 L -5 0 L -3 2 M -3 -2 L -3 2 M 3 -2 L 5 0 L 3 2 M 3 -2 L 3 2" stroke-width="1" fill="#fff" vector-effect="non-scaling-stroke"></path></svg>'}},setup(d){const u=d,c={value:50,hover:!1,direction:"horizontal",keyboard:"enabled",handle:!1},o=E(()=>u.data.firstImage.description||u.data.firstImage.name),n=E(()=>u.data.secondImage.description||u.data.secondImage.name);return(r,a)=>(P(),S(b(A),D({style:`--first-image-caption: ${b(o)}; --second-image-caption: ${b(n)}`,tabindex:"0",class:"img-comparison-slider"},{...c,...d.options}),{default:_(()=>[v("img",{slot:"second",class:"img-comparison-slider__image",src:d.data.firstImage.src},null,8,B),v("img",{slot:"first",class:"img-comparison-slider__image",src:d.data.secondImage.src},null,8,H),v("div",z,[v("p",O,k(d.data.firstImage.description||d.data.firstImage.name),1),v("div",{class:"handle__svg",innerHTML:d.handleSVG},null,8,F),v("p",U,k(d.data.secondImage.description||d.data.secondImage.name),1)])]),_:1},16,["style"]))}};var y=M(X,[["styles",[I]]]);y.styles=[...y.styles];customElements.define("kvass-img-comparison-slider",C(y));
