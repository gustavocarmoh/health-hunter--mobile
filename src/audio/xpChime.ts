import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const source = require('../../assets/sounds/xp-chime.wav');

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer | null {
  if (player) return player;
  try {
    player = createAudioPlayer(source);
    return player;
  } catch {
    return null;
  }
}

export function playXpChime() {
  try {
    const p = getPlayer();
    if (!p) return;
    p.seekTo(0);
    p.play();
  } catch {
    // sound is best-effort — never block gameplay on audio failures
  }
}
