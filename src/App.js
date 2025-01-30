import dommaster from "/dom.svg";
import vite from "/vite.svg";

import { setupRecorder, formatTime, findMatchingBlob } from "./utils";

const { ReactiveState, createElement } = master; // from CDN link

let recorder = setupRecorder(); // returns a promise

const state = new ReactiveState({
  // logo used in template
  dommaster,
  vite,
  // template logic
  recordings: [],
  error: null,
  isRecording: false,
  isPlaying: false,
  dark: true,
  audio: null,
  canvasContainer: null,
  currentTime: "0:00",
  record() {
    if (recorder.error) {
      this.error = recorder.error;
      return;
    } // to not work when if media devices or not accessible.
    this.isRecording = !this.isRecording;
    this.audioURL = null; // reset every time
    let timer = 0;
    let interval;
    this.currentTime = "0:00";

    if (this.isRecording) {
      interval = setInterval(() => {
        if (!this.isRecording) {
          clearInterval(interval);
          timer = 0;
          return;
        }
        this.currentTime = `${formatTime(timer)}`;
        timer += 1;
      }, 1000);
    }

    recorder.then(({ stopRecording, startRecording }) => {
      if (this.isRecording) {
        startRecording();
      } else {
        stopRecording((audio, blob) => {
          this.audio = audio;

          this.audio.ontimeupdate = () => {
            if (audio.duration && audio.duration == audio.currentTime) {
              this.isPlaying = false;
            }
            this.currentTime = `${formatTime(audio.currentTime)}`;
          };

          this.audio.load();

          if (this.recordings.length) {
            this.recordings = this.recordings = this.recordings.map(
              (rec, i) => {
                rec.selected = false;
                return rec;
              }
            );
          }
          let data = {
            selected: true,
            title: `untitled_${this.recordings.length + 1}.ogg`,
            blob,
            src: URL.createObjectURL(blob),
            downloaded: false,
          };

          this.recordings = [...this.recordings, data];
        });
      }
    });
  },
  play() {
    if (!this.audio) return; // can't be played if there are no url
    this.isPlaying = !this.isPlaying;

    if (this.audio && this.isPlaying) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  },
  toggleTheme() {
    this.dark = !this.dark;
  },
  closeError() {
    this.error = null;
  },
  setAudioSrc(index) {
    if (this.isPlaying) {
      this.error =
        "can't switch recording while one is playing. pause it first.";
      return;
    }
    if (this.audio) {
      this.recordings = this.recordings.map((rec, i) => {
        rec.selected = false;
        if (i == index) {
          rec.selected = true;
        }
        return rec;
      });

      let src = this.recordings[index].src;
      this.audio.src = src;
    }
  },
  select(e) {
    const target = e.target;
    const valueCount = target.value.split(".")[0].length;
    target.setSelectionRange(0, valueCount);
    target.focus();
  },
  changeTitle(index, e) {
    const value = e.target.value;
    this.recordings = this.recordings.map((rec, i) => {
      if (i == index) rec.title = value;
      return rec;
    });
  },
  download(index) {
    let { src, title, downloaded } = this.recordings.find((_, i) => i == index);
    this.recordings = this.recordings.map((rec, i) => {
      if (i == index) {
        rec.downloaded = true;
      }
      return rec;
    });

    if (downloaded) return (this.error = "recording recently downloaded");

    const link = document.createElement("a");
    link.href = src;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // allow dowload after a few seconds
    setTimeout(() => {
      this.recordings = this.recordings.map((rec, i) => {
        if (i == index) {
          rec.downloaded = false;
        }
        return rec;
      });
    }, 3000);
  },
  async remove(index) {
    let { blob, src } = this.recordings.find((_, i) => i === index);
    let isCurrentAudio = await findMatchingBlob(this.audio, blob);
    if (this.isPlaying && isCurrentAudio) {
      this.error =
        "Can't remove recording while it's playing. pause or stop first.";
      return;
    }
    let filtered = this.recordings.filter((_, i) => i != index);

    // if the selected recording gets removed.
    if (filtered.length && filtered[0]) {
      filtered[0].selected = true;
      this.audio.src = filtered[0].src;
    }

    this.recordings = filtered;
    URL.revokeObjectURL(src); // revoke removed rec blob- clears memory
  },
});

// error if not running on localhost or is secured
const setTheme = () => {
  document.body.setAttribute("data-theme", `${state.dark ? "dark" : "light"}`);
};

state.subscribe("dark", setTheme);
setTheme(); // initial call

const template = /*html*/ `
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
      {start:if isPlaying || isRecording}
          <div class="top-content">
            <span class="fade-in-out">{isRecording ? "REC" : isPlaying ? "PLAY": ""}</span>
            <span>{currentTime}</span>
          </div>
      {end:if}
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
`;

let App = createElement(template, state);
let visualizerContainer = App.querySelector(".middle");

if (!recorder.error) {
  recorder.then(({ canvas }) => {
    canvas.style.borderBottom = "1px solid #d42a02";
    visualizerContainer.appendChild(canvas);
  });
} else {
  state.error = recorder.error;
}
export default App;
