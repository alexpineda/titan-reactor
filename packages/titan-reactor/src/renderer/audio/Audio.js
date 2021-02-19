import { AudioLoader, PositionalAudio } from "three";
import { DebugLog } from "../utils/DebugLog";
import { range } from "ramda";

class Channel {
  constructor(audio) {
    this.audio = audio;
    this.queued = false;
    this.audio.onEnded = () => {
      this.queued = false;
      this.audio.isPlaying = false;
    };
  }

  queue(sound) {
    this.id = sound.id;
    this.unitTypeId = sound.unitTypeId;
    this.flags = sound.flags;
    this.queued = true;
  }

  get isPlaying() {
    return this.audio.isPlaying;
  }

  get position() {
    return this.audio.position;
  }

  play() {
    this.audio.play();
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    const audio = this.audio;
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
    this.queued = false;
  }
}

export default class Audio {
  constructor(getSoundFileName, audioListener, addSound) {
    this.getSoundFileName = getSoundFileName;
    this.logger = new DebugLog("audio");
    this.audioListener = audioListener;
    this.audioBuffers = {};

    this.volume = 1;
    this.maxSounds = 8; //original bw
    this.channels = range(0, this.maxSounds).map(
      () => new Channel(new PositionalAudio(this.audioListener))
    );
    this.channels.forEach(({ audio }) => addSound(audio));
  }

  setVolume(volume) {
    this.volume = volume;
  }

  // replicate scbw channels
  _getFreeChannel(priority) {
    for (const channel of this.channels) {
      if (!channel.audio.isPlaying && !channel.queued) {
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

  async get(sound, volume, panX, panY, elapsed) {
    if (
      this.audioBuffers[sound.id] &&
      elapsed - this.audioBuffers[sound.id].elapsed <= 80
    ) {
      return;
    }

    if (sound.flags & 0x10) {
      const channel = this.channels.find(({ id }) => id === sound.id);
      if (channel && channel.isPlaying) {
        return;
      }
    } else if (sound.flags & 2 && sound.unitTypeId) {
      const channel = this.channels.find(
        ({ unitTypeId, flags }) => unitTypeId === sound.unitTypeId && flags & 2
      );
      if (channel && channel.isPlaying) {
        return;
      }
    }

    const channel = this._getFreeChannel(sound.priority);

    if (!channel) {
      return;
    }

    channel.queue(sound);

    return new Promise((res) => {
      const { id, priority } = sound;

      let delay = 0;

      if (channel.isPlaying) {
        channel.stop();
        delay = 30;
      }

      channel.position.set(panX, 0, panY);

      if (this.audioBuffers[id]) {
        this.audioBuffers[id].elapsed = elapsed;
        channel.priority = priority;
        channel.audio.setBuffer(this.audioBuffers[id].buffer);
        channel.audio.setVolume(this.volume * (volume / 100));
        setTimeout(() => res(channel), delay);
        return;
      }

      const audioLoader = new AudioLoader();
      audioLoader.load(this.getSoundFileName(id), (buffer) => {
        this.audioBuffers[id] = { buffer, elapsed };
        channel.priority = priority;
        channel.audio.setBuffer(buffer);
        channel.audio.setVolume(this.volume * (volume / 100));
        channel.audio.setRefDistance(16);
        channel.audio.setRolloffFactor(0.1);
        channel.audio.setDistanceModel("exponential");
        res(channel);
      });
    });
  }
}
