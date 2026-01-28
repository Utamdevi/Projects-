// Audio context for zero-latency playback
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

// Set initial volume
masterGain.gain.value = 0.7;

// Drum samples - using synthesized sounds to avoid external dependencies
const drumSounds = {
  Kick: { type: "sine", freq: 100, duration: 0.5, icon: "fas fa-drum" },
  Snare: { type: "noise", freq: 200, duration: 0.3, icon: "fas fa-drum" },
  "Hi-Hat": {
    type: "square",
    freq: 800,
    duration: 0.1,
    icon: "fas fa-times-circle",
  },
  Crash: {
    type: "square",
    freq: 300,
    duration: 1.0,
    icon: "fas fa-record-vinyl",
  },
  "Tom 1": { type: "sine", freq: 180, duration: 0.4, icon: "fas fa-drum" },
  "Tom 2": { type: "sine", freq: 150, duration: 0.4, icon: "fas fa-drum" },
  Clap: { type: "noise", freq: 500, duration: 0.2, icon: "fas fa-hands" },
  Ride: {
    type: "square",
    freq: 600,
    duration: 0.8,
    icon: "fas fa-record-vinyl",
  },
};

// DOM Elements
const drumKit = document.getElementById("drum-kit");
const volumeSlider = document.getElementById("volume-slider");
const drumInstructions = document.getElementById("drum-instructions");

// Initialize the drum kit
function init() {
  createDrumKit();
  setupEventListeners();
  updateInstructions();

  console.log("Drum Kit loaded and ready!");
}

// Create drum pads
function createDrumKit() {
  const drumKeys = ["A", "S", "D", "F", "G", "H", "J", "K"];
  const drumNames = Object.keys(drumSounds);

  drumKeys.forEach((key, index) => {
    const drumPad = document.createElement("div");
    drumPad.className = "drum-pad";
    drumPad.dataset.key = key;
    drumPad.dataset.sound = drumNames[index];

    drumPad.innerHTML = `
            <div class="drum-icon"><i class="${drumSounds[drumNames[index]].icon}"></i></div>
            <div class="drum-key">${key}</div>
            <div class="drum-name">${drumNames[index]}</div>
        `;

    // Click event
    drumPad.addEventListener("click", () => playDrumSound(drumNames[index]));
    drumPad.addEventListener("mousedown", () =>
      drumPad.classList.add("active"),
    );
    drumPad.addEventListener("mouseup", () =>
      drumPad.classList.remove("active"),
    );
    drumPad.addEventListener("mouseleave", () =>
      drumPad.classList.remove("active"),
    );

    // Touch events for mobile
    drumPad.addEventListener("touchstart", (e) => {
      e.preventDefault();
      drumPad.classList.add("active");
      playDrumSound(drumNames[index]);
    });

    drumPad.addEventListener("touchend", () =>
      drumPad.classList.remove("active"),
    );

    drumKit.appendChild(drumPad);
  });
}

// Play drum sound with zero latency
function playDrumSound(soundName) {
  const sound = drumSounds[soundName];

  if (sound.type === "noise") {
    // Create noise for snare/clap
    playNoiseSound(sound.duration);
  } else {
    // Create oscillator for other sounds
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.type = sound.type;
    oscillator.frequency.value = sound.freq;

    // Different envelope for kick
    if (soundName === "Kick") {
      // Kick has a pitch drop
      oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + sound.duration,
      );

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + sound.duration,
      );
    } else {
      // Standard ADSR envelope
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration);
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + sound.duration);
  }

  // Visual feedback
  const drumPad = document.querySelector(
    `.drum-pad[data-sound="${soundName}"]`,
  );
  if (drumPad) {
    drumPad.classList.add("active");
    setTimeout(() => drumPad.classList.remove("active"), 100);
  }
}

// Play noise sound (for snare/clap)
function playNoiseSound(duration) {
  // Create buffer with white noise
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(
    1,
    bufferSize,
    audioContext.sampleRate,
  );
  const output = buffer.getChannelData(0);

  // Fill buffer with random values (white noise)
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseSource = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  noiseSource.buffer = buffer;
  noiseSource.connect(gainNode);
  gainNode.connect(masterGain);

  // Apply envelope
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noiseSource.start();
}

// Setup event listeners
function setupEventListeners() {
  // Keyboard events
  document.addEventListener("keydown", handleKeyDown);

  // Volume control
  volumeSlider.addEventListener("input", (e) => {
    masterGain.gain.value = e.target.value / 100;
  });
}

// Handle key down events
function handleKeyDown(e) {
  const key = e.key.toUpperCase();

  // Prevent default behavior for drum keys
  const drumKeys = ["A", "S", "D", "F", "G", "H", "J", "K"];
  if (drumKeys.includes(key)) {
    e.preventDefault();

    const drumPad = document.querySelector(`.drum-pad[data-key="${key}"]`);
    if (drumPad) {
      const soundName = drumPad.dataset.sound;
      playDrumSound(soundName);
    }
  }
}

// Update instructions
function updateInstructions() {
  const drumKeys = ["A", "S", "D", "F", "G", "H", "J", "K"];
  const drumNames = Object.keys(drumSounds);

  drumInstructions.innerHTML = "";
  drumKeys.forEach((key, index) => {
    const keyItem = document.createElement("div");
    keyItem.className = "key-item";
    keyItem.innerHTML = `
            <div class="key">${key}</div>
            <span>${drumNames[index]}</span>
        `;
    drumInstructions.appendChild(keyItem);
  });
}

// Initialize the drum kit when page loads
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
