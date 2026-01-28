// Audio context for zero-latency playback
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

// Set initial volume
masterGain.gain.value = 0.7;

// Piano notes
const pianoNotes = [
  { note: "C", key: "A", freq: 261.63, type: "white" },
  { note: "C#", key: "W", freq: 277.18, type: "black" },
  { note: "D", key: "S", freq: 293.66, type: "white" },
  { note: "D#", key: "E", freq: 311.13, type: "black" },
  { note: "E", key: "D", freq: 329.63, type: "white" },
  { note: "F", key: "F", freq: 349.23, type: "white" },
  { note: "F#", key: "T", freq: 369.99, type: "black" },
  { note: "G", key: "G", freq: 392.0, type: "white" },
  { note: "G#", key: "Y", freq: 415.3, type: "black" },
  { note: "A", key: "H", freq: 440.0, type: "white" },
  { note: "A#", key: "U", freq: 466.16, type: "black" },
  { note: "B", key: "J", freq: 493.88, type: "white" },
  { note: "C", key: "K", freq: 523.25, type: "white" },
];

// DOM Elements
const piano = document.getElementById("piano");
const volumeSlider = document.getElementById("volume-slider");
const pianoInstructions = document.getElementById("piano-instructions");

// Active oscillators to stop them on key release
const activeOscillators = {};

// Initialize the piano
function init() {
  createPiano();
  setupEventListeners();
  updateInstructions();

  console.log("Piano loaded and ready!");
}

// Create piano keys
function createPiano() {
  // White keys
  const whiteKeys = pianoNotes.filter((note) => note.type === "white");
  const blackKeys = pianoNotes.filter((note) => note.type === "black");

  // Create white keys
  whiteKeys.forEach((note, index) => {
    const whiteKey = document.createElement("div");
    whiteKey.className = "white-key";
    whiteKey.dataset.note = note.note;
    whiteKey.dataset.key = note.key;
    whiteKey.dataset.freq = note.freq;

    whiteKey.innerHTML = `
            <div class="key-label">${note.key}</div>
            <div class="note-name">${note.note}</div>
        `;

    // Click event
    whiteKey.addEventListener("click", () =>
      playPianoNote(note.freq, note.key),
    );
    whiteKey.addEventListener("mousedown", () => {
      whiteKey.classList.add("active");
      playPianoNote(note.freq, note.key);
    });
    whiteKey.addEventListener("mouseup", () => {
      whiteKey.classList.remove("active");
      stopPianoNote(note.key);
    });
    whiteKey.addEventListener("mouseleave", () => {
      if (whiteKey.classList.contains("active")) {
        whiteKey.classList.remove("active");
        stopPianoNote(note.key);
      }
    });

    // Touch events for mobile
    whiteKey.addEventListener("touchstart", (e) => {
      e.preventDefault();
      whiteKey.classList.add("active");
      playPianoNote(note.freq, note.key);
    });

    whiteKey.addEventListener("touchend", () => {
      whiteKey.classList.remove("active");
      stopPianoNote(note.key);
    });

    piano.appendChild(whiteKey);
  });

  // Create black keys
  blackKeys.forEach((note, index) => {
    const blackKey = document.createElement("div");
    blackKey.className = "black-key";
    blackKey.dataset.note = note.note;
    blackKey.dataset.key = note.key;
    blackKey.dataset.freq = note.freq;

    // Position black keys (they sit between white keys)
    let position = 0;
    if (note.note === "C#") position = 9.5;
    else if (note.note === "D#") position = 22;
    else if (note.note === "F#") position = 47;
    else if (note.note === "G#") position = 59.5;
    else if (note.note === "A#") position = 72;

    blackKey.style.left = `${position}%`;

    blackKey.innerHTML = `
            <div class="key-label">${note.key}</div>
            <div class="note-name">${note.note}</div>
        `;

    // Click event
    blackKey.addEventListener("click", () =>
      playPianoNote(note.freq, note.key),
    );
    blackKey.addEventListener("mousedown", () => {
      blackKey.classList.add("active");
      playPianoNote(note.freq, note.key);
    });
    blackKey.addEventListener("mouseup", () => {
      blackKey.classList.remove("active");
      stopPianoNote(note.key);
    });
    blackKey.addEventListener("mouseleave", () => {
      if (blackKey.classList.contains("active")) {
        blackKey.classList.remove("active");
        stopPianoNote(note.key);
      }
    });

    // Touch events for mobile
    blackKey.addEventListener("touchstart", (e) => {
      e.preventDefault();
      blackKey.classList.add("active");
      playPianoNote(note.freq, note.key);
    });

    blackKey.addEventListener("touchend", () => {
      blackKey.classList.remove("active");
      stopPianoNote(note.key);
    });

    piano.appendChild(blackKey);
  });
}

// Play piano note with zero latency using oscillator
function playPianoNote(frequency, key) {
  // Stop any existing oscillator for this key
  if (activeOscillators[key]) {
    try {
      activeOscillators[key].stop();
    } catch (e) {
      // Oscillator already stopped
    }
    delete activeOscillators[key];
  }

  // Create oscillator for immediate playback
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.frequency.value = frequency;
  oscillator.type = "triangle";

  // Store reference to stop later
  activeOscillators[key] = oscillator;

  // Quick attack and release for realistic piano sound
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  oscillator.start(now);
  oscillator.stop(now + 1.5);

  // Remove from active oscillators when done
  oscillator.onended = () => {
    delete activeOscillators[key];
  };
}

// Stop piano note
function stopPianoNote(key) {
  if (activeOscillators[key]) {
    try {
      // Create a quick release
      const gainNode = activeOscillators[key].gainNode;
      if (gainNode) {
        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      }

      // Stop the oscillator after a short delay
      setTimeout(() => {
        if (activeOscillators[key]) {
          activeOscillators[key].stop();
        }
      }, 100);
    } catch (e) {
      // Oscillator already stopped
    }
    delete activeOscillators[key];
  }
}

// Setup event listeners
function setupEventListeners() {
  // Keyboard events
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Volume control
  volumeSlider.addEventListener("input", (e) => {
    masterGain.gain.value = e.target.value / 100;
  });
}

// Handle key down events
function handleKeyDown(e) {
  const key = e.key.toUpperCase();

  // Prevent default behavior for piano keys
  const pianoKeys = [
    "A",
    "W",
    "S",
    "E",
    "D",
    "F",
    "T",
    "G",
    "Y",
    "H",
    "U",
    "J",
    "K",
  ];
  if (pianoKeys.includes(key)) {
    e.preventDefault();

    const pianoKey = document.querySelector(`[data-key="${key}"]`);
    if (pianoKey && !pianoKey.classList.contains("active")) {
      pianoKey.classList.add("active");
      const freq = parseFloat(pianoKey.dataset.freq);
      playPianoNote(freq, key);
    }
  }
}

// Handle key up events (for piano key release)
function handleKeyUp(e) {
  const key = e.key.toUpperCase();
  const pianoKeys = [
    "A",
    "W",
    "S",
    "E",
    "D",
    "F",
    "T",
    "G",
    "Y",
    "H",
    "U",
    "J",
    "K",
  ];

  if (pianoKeys.includes(key)) {
    const pianoKey = document.querySelector(`[data-key="${key}"]`);
    if (pianoKey) {
      pianoKey.classList.remove("active");
      stopPianoNote(key);
    }
  }
}

// Update instructions
function updateInstructions() {
  pianoInstructions.innerHTML = "";
  pianoNotes.forEach((note) => {
    const keyItem = document.createElement("div");
    keyItem.className = "key-item";
    keyItem.innerHTML = `
            <div class="key">${note.key}</div>
            <span>${note.note} Note</span>
        `;
    pianoInstructions.appendChild(keyItem);
  });
}

// Initialize the piano when page loads
document.addEventListener("DOMContentLoaded", init);

// Ensure audio context is resumed after user interaction
document.addEventListener(
  "click",
  () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
      console.log("Audio context resumed");
    }
  },
  { once: true },
);

// Also resume on keydown
document.addEventListener(
  "keydown",
  () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  },
  { once: true },
);
