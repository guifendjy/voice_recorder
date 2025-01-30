let recorder;
let dataChunks = [];
let recorderCallbacks = { src: null };

let recordingAudioContext;
let playbackAudioContext;

let analyzer;
let bufferLength;
let dataArray;

let clearAnimation;

export function setupRecorder({ audioType = "audio/webm" } = {}) {
  let response;
  try {
    response = navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        return setupStream(stream, audioType);
      })
      .catch((err) => {
        console.error("Error setting up recorder", err);
        return { error: "Error setting up recorder" };
      });
  } catch (err) {
    response = {
      error: "failed to setup recorder. failed to access media devices.",
    };
  }
  return response;
}

function setupStream(stream, mimeType) {
  recorder = new MediaRecorder(stream, { mimeType });
  const { canvas, draw } = setUpVisualizer(); // gets a stream an returns cavans
  const audioID = uniid();

  if (recorder) {
    recorder.ondataavailable = (e) => {
      dataChunks.push(e.data); // needs somewhere to save the recorded chunks
    };

    recorder.onstart = (e) => {
      if (recorderCallbacks.onstartCallback) {
        recorderCallbacks.onstartCallback(e);
      }
    };

    recorder.onstop = (e) => {
      const blob = new Blob(dataChunks, { type: mimeType });
      dataChunks = [];
      let blobURL = window.URL.createObjectURL(blob);
      const audio = new Audio(blobURL);

      audio.controls = true;
      audio.hidden = true;
      audio.preload = "metadata";
      audio.id = audioID;

      let oldAudio = document.getElementById(audioID);
      if (!oldAudio) document.body.appendChild(audio);
      else oldAudio.replaceWith(audio);

      playbackAudioContext = new AudioContext();
      const source = playbackAudioContext.createMediaElementSource(audio);
      analyzer = playbackAudioContext.createAnalyser();
      source.connect(analyzer);
      analyzer.connect(playbackAudioContext.destination);

      setupAnalyzer();

      audio.onplay = () => {
        draw();
      };
      audio.onended = () => {
        clearAnimation();
      };
      audio.onpause = () => {
        clearAnimation();
      };

      if (recorderCallbacks.onstop) {
        recorderCallbacks.onstop(audio, blob);
      }
    };
  }

  let startRecording = (onstartCallback) => {
    recordingAudioContext = new AudioContext();
    const source = recordingAudioContext.createMediaStreamSource(stream);
    analyzer = recordingAudioContext.createAnalyser();
    source.connect(analyzer);

    setupAnalyzer();

    recorder.start();
    if (onstartCallback) {
      recorderCallbacks.onstart = onstartCallback;
    }
    draw();
  };

  let stopRecording = (onstopCallback) => {
    recorder.stop();
    recordingAudioContext.close();
    recordingAudioContext = null;

    if (clearAnimation) {
      clearAnimation();
    }
    if (onstopCallback) {
      recorderCallbacks.onstop = onstopCallback;
    }
  };

  if (!recorder) return null;
  return { startRecording, stopRecording, canvas };
}

function setupAnalyzer() {
  analyzer.fftSize = 256;
  bufferLength = analyzer.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function setUpVisualizer() {
  const canvas = document.createElement("canvas");
  const canvasCtx = canvas.getContext("2d");

  // default sizing
  canvas.width = 350;
  canvas.height = 150;

  function draw() {
    analyzer.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barheight;
    let x = 0;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < bufferLength; i++) {
      barheight = dataArray[i];

      canvasCtx.fillStyle = "#d42a02";
      canvasCtx.fillRect(x, canvas.height - barheight / 2, barWidth, barheight);
      x += barWidth + 1;
    }
    let animationId = requestAnimationFrame(draw);
    clearAnimation = () => {
      cancelAnimationFrame(animationId);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }
  return { canvas, draw };
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds) % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

async function getBlobFromAudioSrc(audio) {
  const response = await fetch(audio.src);
  return response.blob();
}

async function areBlobsSame(blob1, blob2) {
  const buffer1 = await blob1.arrayBuffer();
  const buffer2 = await blob2.arrayBuffer();

  return (
    buffer1.byteLength === buffer2.byteLength &&
    new Uint8Array(buffer1).every(
      (byte, i) => byte === new Uint8Array(buffer2)[i]
    )
  );
}

export async function findMatchingBlob(audio, savedBlob) {
  const audioBlob = await getBlobFromAudioSrc(audio);
  const areSame = await areBlobsSame(audioBlob, savedBlob);
  return areSame;
}

function uniid() {
  let random = parseFloat(Math.random() * 0.999999);
  return random.toString(36).substring(2, 12);
}
