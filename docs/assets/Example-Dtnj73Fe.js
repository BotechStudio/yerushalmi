import{r as d,m as F,n as R,j as h,c as j,k}from"./index-Bus15qib.js";import{D as z,F as $}from"./FusePageSimple-VLUdLyi1.js";function A(){if(console&&console.warn){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];typeof e[0]=="string"&&(e[0]=`react-i18next:: ${e[0]}`),console.warn(...e)}}const T={};function w(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];typeof e[0]=="string"&&T[e[0]]||(typeof e[0]=="string"&&(T[e[0]]=new Date),A(...e))}const E=(n,e)=>()=>{if(n.isInitialized)e();else{const t=()=>{setTimeout(()=>{n.off("initialized",t)},0),e()};n.on("initialized",t)}};function v(n,e,t){n.loadNamespaces(e,E(n,t))}function P(n,e,t,f){typeof t=="string"&&(t=[t]),t.forEach(i=>{n.options.ns.indexOf(i)<0&&n.options.ns.push(i)}),n.loadLanguages(e,E(n,f))}function U(n,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const f=e.languages[0],i=e.options?e.options.fallbackLng:!1,s=e.languages[e.languages.length-1];if(f.toLowerCase()==="cimode")return!0;const l=(y,C)=>{const a=e.services.backendConnector.state[`${y}|${C}`];return a===-1||a===2};return t.bindI18n&&t.bindI18n.indexOf("languageChanging")>-1&&e.services.backendConnector.backend&&e.isLanguageChangingTo&&!l(e.isLanguageChangingTo,n)?!1:!!(e.hasResourceBundle(f,n)||!e.services.backendConnector.backend||e.options.resources&&!e.options.partialBundledLanguages||l(f,n)&&(!i||l(s,n)))}function B(n,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};return!e.languages||!e.languages.length?(w("i18n.languages were undefined or empty",e.languages),!0):e.options.ignoreJSONStructure!==void 0?e.hasLoadedNamespace(n,{lng:t.lng,precheck:(i,s)=>{if(t.bindI18n&&t.bindI18n.indexOf("languageChanging")>-1&&i.services.backendConnector.backend&&i.isLanguageChangingTo&&!s(i.isLanguageChangingTo,n))return!1}}):U(n,e,t)}const O=d.createContext();class H{constructor(){this.usedNamespaces={}}addUsedNamespaces(e){e.forEach(t=>{this.usedNamespaces[t]||(this.usedNamespaces[t]=!0)})}getUsedNamespaces(){return Object.keys(this.usedNamespaces)}}const J=(n,e)=>{const t=d.useRef();return d.useEffect(()=>{t.current=n},[n,e]),t.current};function M(n){let e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{i18n:t}=e,{i18n:f,defaultNS:i}=d.useContext(O)||{},s=t||f||F();if(s&&!s.reportNamespaces&&(s.reportNamespaces=new H),!s){w("You will need to pass in an i18next instance by using initReactI18next");const r=(c,o)=>typeof o=="string"?o:o&&typeof o=="object"&&typeof o.defaultValue=="string"?o.defaultValue:Array.isArray(c)?c[c.length-1]:c,u=[r,{},!1];return u.t=r,u.i18n={},u.ready=!1,u}s.options.react&&s.options.react.wait!==void 0&&w("It seems you are still using the old wait option, you may migrate to the new useSuspense behaviour.");const l={...R(),...s.options.react,...e},{useSuspense:y,keyPrefix:C}=l;let a=n;a=typeof a=="string"?[a]:a||["translation"],s.reportNamespaces.addUsedNamespaces&&s.reportNamespaces.addUsedNamespaces(a);const p=(s.isInitialized||s.initializedStoreOnce)&&a.every(r=>B(r,s,l));function m(){return s.getFixedT(e.lng||null,l.nsMode==="fallback"?a:a[0],C)}const[S,b]=d.useState(m);let N=a.join();e.lng&&(N=`${e.lng}${N}`);const I=J(N),g=d.useRef(!0);d.useEffect(()=>{const{bindI18n:r,bindI18nStore:u}=l;g.current=!0,!p&&!y&&(e.lng?P(s,e.lng,a,()=>{g.current&&b(m)}):v(s,a,()=>{g.current&&b(m)})),p&&I&&I!==N&&g.current&&b(m);function c(){g.current&&b(m)}return r&&s&&s.on(r,c),u&&s&&s.store.on(u,c),()=>{g.current=!1,r&&s&&r.split(" ").forEach(o=>s.off(o,c)),u&&s&&u.split(" ").forEach(o=>s.store.off(o,c))}},[s,N]);const L=d.useRef(!0);d.useEffect(()=>{g.current&&!L.current&&b(m),L.current=!1},[s,C]);const x=[S,s,p];if(x.t=S,x.i18n=s,x.ready=p,p||!p&&!y)return x;throw new Promise(r=>{e.lng?P(s,e.lng,a,()=>r()):v(s,a,()=>r())})}const W=k($)(({theme:n})=>({"& .FusePageSimple-header":{backgroundColor:n.palette.background.paper,borderBottomWidth:1,borderStyle:"solid",borderColor:n.palette.divider},"& .FusePageSimple-content":{},"& .FusePageSimple-sidebarHeader":{},"& .FusePageSimple-sidebarContent":{}}));function G(){const{t:n}=M("examplePage");return h(W,{header:h("div",{className:"p-24",children:h("h4",{children:n("TITLE")})}),content:j("div",{className:"p-24",children:[h("h4",{children:"Content"}),h("br",{}),h(z,{})]})})}export{G as default};