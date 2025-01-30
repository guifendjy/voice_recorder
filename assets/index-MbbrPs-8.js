(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function i(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(t){if(t.ep)return;t.ep=!0;const n=i(t);fetch(t.href,n)}})();const L="/voice_recorder/dom.svg",U="/voice_recorder/vite.svg";let d,b=[],u={src:null},f,p,l,y,w,m;function E({audioType:e="audio/webm"}={}){let r;try{r=navigator.mediaDevices.getUserMedia({audio:!0}).then(i=>T(i,e)).catch(i=>(console.error("Error setting up recorder",i),{error:"Error setting up recorder"}))}catch{r={error:"failed to setup recorder. failed to access media devices."}}return r}function T(e,r){d=new MediaRecorder(e,{mimeType:r});const{canvas:i,draw:o}=B(),t=z();d&&(d.ondataavailable=a=>{b.push(a.data)},d.onstart=a=>{u.onstartCallback&&u.onstartCallback(a)},d.onstop=a=>{const g=new Blob(b,{type:r});b=[];let P=window.URL.createObjectURL(g);const c=new Audio(P);c.controls=!0,c.hidden=!0,c.preload="metadata",c.id=t;let R=document.getElementById(t);R?R.replaceWith(c):document.body.appendChild(c),p=new AudioContext;const S=p.createMediaElementSource(c);l=p.createAnalyser(),S.connect(l),l.connect(p.destination),A(),c.onplay=()=>{o()},c.onended=()=>{m()},c.onpause=()=>{m()},u.onstop&&u.onstop(c,g)});let n=a=>{f=new AudioContext;const g=f.createMediaStreamSource(e);l=f.createAnalyser(),g.connect(l),A(),d.start(),a&&(u.onstart=a),o()},s=a=>{d.stop(),f.close(),f=null,m&&m(),a&&(u.onstop=a)};return d?{startRecording:n,stopRecording:s,canvas:i}:null}function A(){l.fftSize=256,y=l.frequencyBinCount,w=new Uint8Array(y)}function B(){const e=document.createElement("canvas"),r=e.getContext("2d");e.width=350,e.height=150;function i(){l.getByteFrequencyData(w);const o=e.width/y*2.5;let t,n=0;r.clearRect(0,0,e.width,e.height);for(let a=0;a<y;a++)t=w[a],r.fillStyle="#d42a02",r.fillRect(n,e.height-t/2,o,t),n+=o+1;let s=requestAnimationFrame(i);m=()=>{cancelAnimationFrame(s),r.clearRect(0,0,e.width,e.height)}}return{canvas:e,draw:i}}function x(e){const r=Math.floor(e/60),i=Math.floor(e)%60;return`${r}:${i<10?"0":""}${i}`}async function _(e){return(await fetch(e.src)).blob()}async function M(e,r){const i=await e.arrayBuffer(),o=await r.arrayBuffer();return i.byteLength===o.byteLength&&new Uint8Array(i).every((t,n)=>t===new Uint8Array(o)[n])}async function O(e,r){const i=await _(e);return await M(i,r)}function z(){return parseFloat(Math.random()*.999999).toString(36).substring(2,12)}const{ReactiveState:$,createElement:F}=master;let h=E();const v=new $({dommaster:L,vite:U,recordings:[],error:null,isRecording:!1,isPlaying:!1,dark:!0,audio:null,canvasContainer:null,currentTime:"0:00",record(){if(h.error){this.error=h.error;return}this.isRecording=!this.isRecording,this.audioURL=null;let e=0,r;this.currentTime="0:00",this.isRecording&&(r=setInterval(()=>{if(!this.isRecording){clearInterval(r),e=0;return}this.currentTime=`${x(e)}`,e+=1},1e3)),h.then(({stopRecording:i,startRecording:o})=>{this.isRecording?o():i((t,n)=>{this.audio=t,this.audio.ontimeupdate=()=>{t.duration&&t.duration==t.currentTime&&(this.isPlaying=!1),this.currentTime=`${x(t.currentTime)}`},this.audio.load(),this.recordings.length&&(this.recordings=this.recordings=this.recordings.map((a,g)=>(a.selected=!1,a)));let s={selected:!0,title:`untitled_${this.recordings.length+1}.webm`,blob:n,src:URL.createObjectURL(n),downloaded:!1};this.recordings=[...this.recordings,s]})})},play(){this.audio&&(this.isPlaying=!this.isPlaying,this.audio&&this.isPlaying?this.audio.play():this.audio.pause())},toggleTheme(){this.dark=!this.dark},closeError(){this.error=null},setAudioSrc(e){if(this.isPlaying){this.error="can't switch recording while one is playing. pause it first.";return}if(this.audio){this.recordings=this.recordings.map((i,o)=>(i.selected=!1,o==e&&(i.selected=!0),i));let r=this.recordings[e].src;this.audio.src=r}},select(e){const r=e.target,i=r.value.split(".")[0].length;r.setSelectionRange(0,i),r.focus()},changeTitle(e,r){const i=r.target.value;this.recordings=this.recordings.map((o,t)=>(t==e&&(o.title=i),o))},download(e){let{src:r,title:i,downloaded:o}=this.recordings.find((n,s)=>s==e);if(this.recordings=this.recordings.map((n,s)=>(s==e&&(n.downloaded=!0),n)),o)return this.error="recording recently downloaded";const t=document.createElement("a");t.href=r,t.download=i,document.body.appendChild(t),t.click(),document.body.removeChild(t),setTimeout(()=>{this.recordings=this.recordings.map((n,s)=>(s==e&&(n.downloaded=!1),n))},3e3)},async remove(e){let{blob:r,src:i}=this.recordings.find((n,s)=>s===e),o=await O(this.audio,r);if(this.isPlaying&&o){this.error="Can't remove recording while it's playing. pause or stop first.";return}let t=this.recordings.filter((n,s)=>s!=e);t.length&&t[0]&&(t[0].selected=!0,this.audio.src=t[0].src),this.recordings=t,URL.revokeObjectURL(i)}}),k=()=>{document.body.setAttribute("data-theme",`${v.dark?"dark":"light"}`)};v.subscribe("dark",k);k();const I=`
<div class="main">
  <div style="display:{error ? 'flex': 'none'};" class="error-dialog">
     <div class="error-icon">
       <span>!</span>
     </div>
     <div class="error-content">
       <h3>Error</h3>
       <p>{error}</p>
     </div>
     <button onclick="closeError" class="error-close">✕</button>
   </div>

  <!-- From Uiverse.io by Praashoo7 -->
  <label class="switch">
    <input onchange="toggleTheme" type="checkbox">
    <span class="slider"></span>
  </label>
<span style="font-family:Montserrat; font-size:0.8em; margin-top:-15px">{dark ? 'dark': 'light'} mode</span>
  <h1>Voice Recorder</h1>
  {start:if recordings.length}
    <div class="list">
      {for:each recording, index of recordings}
        <div class="recording">
          <span onclick="setAudioSrc(index)" class="recording-logo {recording.selected ? 'selected' : ''}">🔴</span>
          <input onmouseenter="select" onchange="changeTitle(index)" class="recording-title" type="text" value="{recording.title}"/>
          
          <button onclick="download(index)" class="rec-card-btn">
            <svg width="50" viewBox="0 0 100 100">
              <circle id="circle" cx="50" cy="50" r="40" stroke="#ff5f5f" fill="none"  stroke-width="5" stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
              <text x="50" y="50" font-size="2rem" fill="#ccc" text-anchor="middle" dominant-baseline="middle">{!recording.downloaded ? '&#x2B07;' : '&#10003;'}</text>
            </svg>
          </button>
          <button onclick="remove(index)" class="rec-card-btn">
            &#10005;
          </button>
        </div>
      {end:each}
    </div>
  {end:if}

  <div class="visualizer">
    <div class="top">
        <div style="display:{isPlaying || isRecording ? 'flex': 'none'};" class="top-content">
          <span class="fade-in-out">{isRecording ? "REC" : isPlaying ? "PLAY": ""}</span>
          <span>{currentTime}</span>
        </div>
    </div>
    <div class="middle"></div>
  </div>

  <div class="buttons">
    <div class="button_pair">
      <div class="btn">
        <button disabled="{isPlaying}"  onclick="record" class="button3">
          <span class="button_text">{!isRecording ? 'RECORD' : 'STOP'}</span>
        </button>
      </div>
      <div class="btn">
        <button disabled="{isRecording  || !audio || recordings.length < 1}" onclick="play" class="button4">
          <span class="button_text">{!isPlaying ? 'PLAY' : 'PAUSE'}</span>
        </button>
      </div>
    </div>
  </div>

  <div class="footer">
      <h2>Vite + Dom Master</h2>
      <a href="https://vite.dev/" target="_blank">
        <img src="{vite}" alt="vite logo" />
      </a>
      <a href="https://github.com/guifendjy/dom_master" target="_blank">
        <img width="50" height="50" src="{dommaster}" alt="dommaster logo" />
      </a>
  </div>
  <span style="margin-top:-30px; font-size:0.80rem; color:gray;">click any of the logos to learn more.</span>
</div>
`;let C=F(I,v),q=C.querySelector(".middle");h.error?v.error=h.error:h.then(({canvas:e})=>{e.style.borderBottom="1px solid #d42a02",q.appendChild(e)});root.appendChild(C);
