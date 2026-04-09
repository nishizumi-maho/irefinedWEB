import { getSettings } from "./settings.js";

let audioContext = null;
let unlockListenersAttached = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getAudioContext() {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  audioContext = new AudioContextCtor();
  return audioContext;
}

function detachUnlockListeners() {
  if (!unlockListenersAttached) {
    return;
  }

  unlockListenersAttached = false;
  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.removeEventListener(eventName, unlockAudioContext, true);
  });
}

function unlockAudioContext() {
  const ctx = getAudioContext();

  if (!ctx) {
    detachUnlockListeners();
    return;
  }

  if (ctx.state === "running") {
    detachUnlockListeners();
    return;
  }

  ctx.resume().then(() => {
    if (ctx.state === "running") {
      detachUnlockListeners();
    }
  }).catch(() => {});
}

export function initSoundSupport() {
  const ctx = getAudioContext();

  if (!ctx || unlockListenersAttached || ctx.state === "running") {
    return;
  }

  unlockListenersAttached = true;
  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, unlockAudioContext, true);
  });
}

export function playQueueRegisteredSound(options = {}) {
  const { ignoreEnabled = false } = options;
  const settings = getSettings();

  if (!ignoreEnabled && settings["queue-register-sound"] === false) {
    return false;
  }

  const ctx = getAudioContext();

  if (!ctx) {
    return false;
  }

  const volumeSetting = Number(settings["queue-register-sound-volume"]);
  const masterVolume = clamp(
    Number.isNaN(volumeSetting) ? 65 : volumeSetting,
    0,
    100
  ) / 100;

  const playTone = () => {
    const start = ctx.currentTime + 0.02;
    const sequence = [
      { time: start, frequency: 659.25, duration: 0.11, gain: 0.14, type: "triangle" },
      { time: start + 0.12, frequency: 987.77, duration: 0.11, gain: 0.13, type: "triangle" },
      { time: start + 0.24, frequency: 1318.51, duration: 0.17, gain: 0.15, type: "sawtooth" },
    ];

    sequence.forEach(({ time, frequency, duration, gain, type }) => {
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);

      envelope.gain.setValueAtTime(0.0001, time);
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, gain * masterVolume),
        time + 0.02
      );
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      oscillator.connect(envelope);
      envelope.connect(ctx.destination);

      oscillator.start(time);
      oscillator.stop(time + duration + 0.02);
    });
  };

  if (ctx.state === "running") {
    playTone();
    return true;
  }

  ctx.resume().then(() => {
    if (ctx.state === "running") {
      playTone();
    }
  }).catch(() => {});

  return false;
}
