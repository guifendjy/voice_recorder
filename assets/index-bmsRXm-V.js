(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function o(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(t){if(t.ep)return;t.ep=!0;const i=o(t);fetch(t.href,i)}})();const S="/voice_recorder/dom.svg",L="/voice_recorder/vite.svg";let d,v=[],u={src:null},g,p,l,m,b,f;function T(){let e;try{e=navigator.mediaDevices.getUserMedia({audio:!0}).then(r=>U(r)).catch(r=>(console.error("Error setting up recorder",r),{error:"Error setting up recorder"}))}catch{e={error:"failed to setup recorder. failed to access media devices."}}return e}function U(e){d=new MediaRecorder(e);const{canvas:r,draw:o}=E(),s=O();d&&(d.ondataavailable=n=>{v.push(n.data)},d.onstart=n=>{u.onstartCallback&&u.onstartCallback(n)},d.onstop=n=>{const a=new Blob(v,{type:"audio/ogg; codecs=opus"});v=[];let w=window.URL.createObjectURL(a);const c=new Audio(w);c.controls=!0,c.hidden=!0,c.preload="metadata",c.id=s;let R=document.getElementById(s);R?R.replaceWith(c):document.body.appendChild(c),p=new AudioContext;const P=p.createMediaElementSource(c);l=p.createAnalyser(),P.connect(l),l.connect(p.destination),A(),c.onplay=()=>{o()},c.onended=()=>{f()},c.onpause=()=>{f()},u.onstop&&u.onstop(c,a)});let t=n=>{g=new AudioContext;const a=g.createMediaStreamSource(e);l=g.createAnalyser(),a.connect(l),A(),d.start(),n&&(u.onstart=n),o()},i=n=>{d.stop(),g.close(),g=null,f&&f(),n&&(u.onstop=n)};return d?{startRecording:t,stopRecording:i,canvas:r}:null}function A(){l.fftSize=256,m=l.frequencyBinCount,b=new Uint8Array(m)}function E(){const e=document.createElement("canvas"),r=e.getContext("2d");e.width=350,e.height=150;function o(){l.getByteFrequencyData(b);const s=e.width/m*2.5;let t,i=0;r.clearRect(0,0,e.width,e.height);for(let a=0;a<m;a++)t=b[a],r.fillStyle="#d42a02",r.fillRect(i,e.height-t/2,s,t),i+=s+1;let n=requestAnimationFrame(o);f=()=>{cancelAnimationFrame(n),r.clearRect(0,0,e.width,e.height)}}return{canvas:e,draw:o}}function x(e){const r=Math.floor(e/60),o=Math.floor(e)%60;return`${r}:${o<10?"0":""}${o}`}async function B(e){return(await fetch(e.src)).blob()}async function _(e,r){const o=await e.arrayBuffer(),s=await r.arrayBuffer();return o.byteLength===s.byteLength&&new Uint8Array(o).every((t,i)=>t===new Uint8Array(s)[i])}async function M(e,r){const o=await B(e);return await _(o,r)}function O(){return parseFloat(Math.random()*.999999).toString(36).substring(2,12)}const{ReactiveState:z,createElement:$}=master;let h=T();const y=new z({dommaster:S,vite:L,recordings:[],error:null,isRecording:!1,isPlaying:!1,dark:!0,audio:null,canvasContainer:null,currentTime:"0:00",record(){if(h.error){this.error=h.error;return}this.isRecording=!this.isRecording,this.audioURL=null;let e=0,r;this.currentTime="0:00",this.isRecording&&(r=setInterval(()=>{if(!this.isRecording){clearInterval(r),e=0;return}this.currentTime=`${x(e)}`,e+=1},1e3)),h.then(({stopRecording:o,startRecording:s})=>{this.isRecording?s():o((t,i)=>{this.audio=t,this.audio.ontimeupdate=()=>{t.duration&&t.duration==t.currentTime&&(this.isPlaying=!1),this.currentTime=`${x(t.currentTime)}`},this.audio.load(),this.recordings.length&&(this.recordings=this.recordings=this.recordings.map((a,w)=>(a.selected=!1,a)));let n={selected:!0,title:`untitled_${this.recordings.length+1}.ogg`,blob:i,src:URL.createObjectURL(i),downloaded:!1};this.recordings=[...this.recordings,n]})})},play(){this.audio&&(this.isPlaying=!this.isPlaying,this.audio&&this.isPlaying?this.audio.play():this.audio.pause())},toggleTheme(){this.dark=!this.dark},closeError(){this.error=null},setAudioSrc(e){if(this.isPlaying){this.error="can't switch recording while one is playing. pause it first.";return}if(this.audio){this.recordings=this.recordings.map((o,s)=>(o.selected=!1,s==e&&(o.selected=!0),o));let r=this.recordings[e].src;this.audio.src=r}},select(e){const r=e.target,o=r.value.split(".")[0].length;r.setSelectionRange(0,o),r.focus()},changeTitle(e,r){const o=r.target.value;this.recordings=this.recordings.map((s,t)=>(t==e&&(s.title=o),s))},download(e){let{src:r,title:o,downloaded:s}=this.recordings.find((i,n)=>n==e);if(this.recordings=this.recordings.map((i,n)=>(n==e&&(i.downloaded=!0),i)),s)return this.error="recording recently downloaded";const t=document.createElement("a");t.href=r,t.download=o,document.body.appendChild(t),t.click(),document.body.removeChild(t),setTimeout(()=>{this.recordings=this.recordings.map((i,n)=>(n==e&&(i.downloaded=!1),i))},3e3)},async remove(e){let{blob:r,src:o}=this.recordings.find((i,n)=>n===e),s=await M(this.audio,r);if(this.isPlaying&&s){this.error="Can't remove recording while it's playing. pause or stop first.";return}let t=this.recordings.filter((i,n)=>n!=e);t.length&&t[0]&&(t[0].selected=!0,this.audio.src=t[0].src),this.recordings=t,URL.revokeObjectURL(o)}}),k=()=>{document.body.setAttribute("data-theme",`${y.dark?"dark":"light"}`)};y.subscribe("dark",k);k();const F=`
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
`;let C=$(F,y),I=C.querySelector(".middle");h.error?y.error=h.error:h.then(({canvas:e})=>{e.style.borderBottom="1px solid #d42a02",I.appendChild(e)});root.appendChild(C);
