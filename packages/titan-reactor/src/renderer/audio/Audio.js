import { AudioLoader, PositionalAudio } from "three";
import { DebugLog } from "../utils/DebugLog";
import { range } from "ramda";

export default class Audio {
  constructor(getSoundFileName, audioListener, addSound) {
    this.getSoundFileName = getSoundFileName;
    this.logger = new DebugLog("audio");
    this.audioListener = audioListener;
    this.audioBuffers = {};

    this.volume = 1;
    this.maxSounds = 64;
    this.channels = range(0, this.maxSounds).map(() => ({
      audio: new PositionalAudio(this.audioListener),
      priority: 0,
    }));
    this.channels.forEach(({ audio }) => addSound(audio));
  }

  setVolume(volume) {
    this.volume = volume;
  }

  // replicate scbw channels
  _getFreeChannel(priority) {
    for (const channel of this.channels) {
      if (!channel.audio.isPlaying) {
        return channel;
      }
    }

    let bestPriority = priority;
    let c;
    for (const channel of this.channels) {
      if (channel.priority < bestPriority) {
        bestPriority = channel.priority;
        c = channel;
      }
    }
    return c;
  }

  // https://alemangui.github.io/ramp-to-value
  stop(audio) {
    audio.gain.gain.setValueAtTime(
      audio.gain.gain.value,
      audio.context.currentTime
    );
    audio.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.context.currentTime + 0.03
    );
    audio._progress = 0;
    audio.source.onended = null;
    audio.isPlaying = false;
  }

  play(sound, elapsed) {
    const { id, priority, mapX, mapY, mapZ } = sound;

    if (
      this.audioBuffers[id] &&
      elapsed - this.audioBuffers[id].elapsed < 160
    ) {
      return;
    }

    const channel = this._getFreeChannel(priority);

    if (!channel) return;

    if (channel.audio.isPlaying) {
      this.stop(channel.audio);
    }

    //@todo accomodate for audiolistener time delta transform
    channel.audio.position.set(mapX, mapY, mapZ);

    if (this.audioBuffers[id]) {
      this.audioBuffers[id].elapsed = elapsed;
      channel.priority = priority;
      channel.audio.setBuffer(this.audioBuffers[id].buffer);
      channel.audio.setVolume(this.volume);
      channel.audio.play();
      return;
    }

    const audioLoader = new AudioLoader();
    audioLoader.load(this.getSoundFileName(id), (buffer) => {
      this.audioBuffers[id] = { buffer, elapsed };

      channel.priority = priority;
      channel.audio.setBuffer(buffer);
      channel.audio.setRefDistance(8);
      channel.audio.setRolloffFactor(3);
      channel.audio.setDistanceModel("exponential");
      channel.audio.setVolume(this.volume);
      channel.audio.play();
    });
  }

  // unit.userData.runner.on("playsnd", playSound);
  // unit.userData.runner.on("playsndbtwn", playSound);
  // unit.userData.runner.on("playsndrand", playSound);
  // unit.userData.runner.on("attackmelee", playSound);
}
