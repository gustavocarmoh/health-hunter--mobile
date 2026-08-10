// Synthesizes the two-tone "XP gain" chime as a WAV file, mirroring the
// Web Audio oscillator chime in the original prototype (880Hz -> 1318.5Hz).
// Run with: node scripts/generate-xp-chime.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const notes = [
  { freq: 880, start: 0, dur: 0.32 },
  { freq: 1318.5, start: 0.09, dur: 0.32 },
];
const totalDur = Math.max(...notes.map((n) => n.start + n.dur)) + 0.02;
const totalSamples = Math.ceil(totalDur * SAMPLE_RATE);
const samples = new Float32Array(totalSamples);

for (const note of notes) {
  const startSample = Math.floor(note.start * SAMPLE_RATE);
  const durSamples = Math.floor(note.dur * SAMPLE_RATE);
  const attack = Math.floor(0.02 * SAMPLE_RATE);
  for (let i = 0; i < durSamples; i++) {
    const idx = startSample + i;
    if (idx >= totalSamples) break;
    const t = i / SAMPLE_RATE;
    let env;
    if (i < attack) {
      env = i / attack;
    } else {
      // exponential decay to ~0.001 over the remaining duration
      const decayT = (i - attack) / (durSamples - attack);
      env = Math.exp(Math.log(0.001) * decayT);
    }
    const sample = Math.sin(2 * Math.PI * note.freq * t) * env * 0.28;
    samples[idx] += sample;
  }
}

// Clamp and convert to 16-bit PCM
const pcm = new Int16Array(totalSamples);
for (let i = 0; i < totalSamples; i++) {
  const clamped = Math.max(-1, Math.min(1, samples[i]));
  pcm[i] = Math.round(clamped * 32767);
}

const dataSize = pcm.length * 2;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // fmt chunk size
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
buffer.writeUInt16LE(2, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);
for (let i = 0; i < pcm.length; i++) {
  buffer.writeInt16LE(pcm[i], 44 + i * 2);
}

const outPath = path.join(__dirname, '..', 'assets', 'sounds', 'xp-chime.wav');
fs.writeFileSync(outPath, buffer);
console.log('Wrote', outPath, `(${(buffer.length / 1024).toFixed(1)} KB)`);
