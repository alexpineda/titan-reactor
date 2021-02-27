import { AudioLoader, PositionalAudio } from "three";
import { range } from "ramda";
import { DebugLog } from "../utils/DebugLog";
import Channel from "./Channel";
import AudioBuffer from "./AudioBuffer";

export default class Audio {
  constructor(
    getSoundFileName,
    audioListener,
    addSound,
    addPointer,
    removeSound
  ) {
    this.getSoundFileName = getSoundFileName;
    this.logger = new DebugLog("audio");
    this.audioListener = audioListener;
    this.audioBuffers = {};

    this.addPointer = addPointer;
    this.volume = 1;
    this.maxSounds = 8; //original bw
    this.channels = range(0, this.maxSounds).map(
      () =>
        new Channel(() => {
          const audio = new PositionalAudio(this.audioListener);
          addSound(audio);
          return audio;
        }, removeSound)
    );

    this.channels.forEach(({ audio, debugVisual }) => {
      addSound(audio);
      addSound(debugVisual);
    });
  }

  setVolume(volume) {
    this.volume = volume;
  }

  // replicate scbw channels
  _getFreeChannel(priority, soundId) {
    for (const channel of this.channels) {
      if (!channel.isPlaying) {
        console.log(`found channel (not playing) #${channel.id} => ${soundId}`);
        return channel;
      }
    }

    let bestPriority = priority;
    let c;
    for (const channel of this.channels) {
      if (channel.flags & 0x20) continue;
      if (channel.priority < bestPriority) {
        console.log(
          `found channel (priority ${channel.priority} < ${bestPriority}) #${channel.id} => ${soundId}`
        );
        bestPriority = channel.priority;
        c = channel;
      }
    }
    return c;
  }

  copyBuffer(audioBuffer) {
    const buffer = this.audioListener.context.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      buffer.copyToChannel(audioBuffer.getChannelData(i), i);
    }
    return buffer;
  }

  dump(sound, x, y, z, elapsed, reason, color = 0x000000) {
    this.addPointer(x, y, z, color, {
      ...sound,
      elapsed,
      reason,
      channels: this.channels.map((c) => ({ ...c, p: c.audio.isPlaying })),
    });
    console.log(`%c ${reason}`, `color: #${color.toString(16)}`);
    console.log({
      ...sound,
      elapsed,
    });
  }

  get(sound, volume, x, y, z) {
    const { id: soundId, priority, unitTypeId, flags: soundFlags } = sound;

    return (elapsed) => {
      //a promise is loading the buffer
      if (this.audioBuffers[soundId] && !this.audioBuffers[soundId].buffer) {
        return;
      }

      if (
        this.audioBuffers[soundId] &&
        elapsed - this.audioBuffers[soundId].elapsed <= 80
      ) {
        this.dump(sound, x, y, z, elapsed, "buffer < 80", 0x0000ff);
        return;
      }

      if (soundFlags & 0x10) {
        const channel = this.channels.find(({ id }) => id === soundId);
        if (channel && channel.isPlaying) {
          this.dump(sound, x, y, z, elapsed, "0x10 playing", 0x00ff00);
          return;
        }
      } else if (soundFlags & 2 && unitTypeId) {
        const channel = this.channels.find(
          ({ unitTypeId, flags }) => unitTypeId === unitTypeId && flags & 2
        );
        if (channel && channel.isPlaying) {
          this.dump(sound, x, y, z, elapsed, "0x2 playing", 0x00ff00);
          return;
        }
      }

      const channel = this._getFreeChannel(priority, soundId);

      if (!channel) {
        this.dump(sound, x, y, z, elapsed, "no free channel", 0xffa500);
        return;
      }

      if (!this.audioBuffers[soundId]) {
        this.audioBuffers[soundId] = new AudioBuffer();
      }
      this.audioBuffers[soundId].elapsed = elapsed;

      //stop if it's playing OR stop if its queued and already loaded
      if (channel.isPlaying) {
        channel.stop();
      }

      channel.queue(sound);

      if (this.audioBuffers[soundId].buffer) {
        this.dump(sound, x, y, z, elapsed, "immediate", 0x999999);

        channel.play(
          this.audioBuffers[soundId].buffer,
          this.volume * (volume / 100),
          x,
          y,
          z
        );
        return;
      }

      const audioLoader = new AudioLoader();
      const time = performance.now();
      audioLoader.load(this.getSoundFileName(soundId), (buffer) => {
        this.dump(sound, x, y, z, elapsed, "deferred", 0x999999);

        this.audioBuffers[soundId].buffer = buffer;
        this.audioBuffers[soundId].elapsed = elapsed + performance.now() - time;
        channel.play(
          this.audioBuffers[soundId].buffer,
          this.volume * (volume / 100),
          x,
          y,
          z
        );
      });
    };
  }
}
