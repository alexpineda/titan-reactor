import { range } from "ramda";
import DeferredAudioBuffer from "./DeferredAudioBuffer";
import Audio from "./Audio";
import SoundChannel from "./SoundChannel";

export default class SoundChannels {
  constructor(mixer, loadSoundAsync) {
    this.mixer = mixer;
    this.maxChannels = 8;
    this.channels = range(0, this.maxChannels).map(() => new SoundChannel());
    this.buffers = new Map();
    this.loadSoundAsync = loadSoundAsync;
    this.audio = [];
  }

  async _load(id) {
    const buffer = (await this.loadSoundAsync(id)).buffer;
    return await this.mixer.context.decodeAudioData(buffer.slice(0));
  }

  _getBuffer(soundId) {
    let buffer = this.buffers.get(soundId);
    if (!buffer) {
      buffer = new DeferredAudioBuffer(this._load.bind(this), soundId);
      this.buffers.set(soundId, buffer);
    }
    return buffer;
  }

  _getAvailableChannel(sound) {
    if (sound.flags & 0x10) {
      const channel = this.channels.find(({ id }) => id === this.sound.id);
      //@todo native sound playing
      if (channel && channel.isPlaying) {
        return false;
      }
    } else if (sound.flags & 2 && sound.unitTypeId) {
      const channel = this.channels.find(
        ({ unitTypeId, flags }) => unitTypeId === sound.unitTypeId && flags & 2
      );
      //@todo native sound playing
      if (channel && channel.isPlaying) {
        return false;
      }
    }

    for (const channel of this.channels) {
      if (!channel.isPlaying) {
        return channel;
      }
    }

    let bestPriority = sound.priority;
    let c;
    for (const channel of this.channels) {
      if (channel.flags & 0x20) continue;
      if (channel.priority < bestPriority) {
        bestPriority = channel.priority;
        c = channel;
      }
    }
    return c;
  }

  _assignAvailableChannel(audio) {
    const channel = this._getAvailableChannel(audio);
    if (channel) {
      if (channel.audio) {
        channel.audio.stop();
      }
      channel.assign(audio);
      audio.channel = channel;
      return true;
    }
    return false;
  }

  queue(soundData, elapsed) {
    this.audio.push(
      new Audio(
        this.mixer,
        soundData,
        this._getBuffer(soundData.id, elapsed),
        elapsed
      )
    );
  }

  play(elapsed) {
    for (const audio of this.audio) {
      if (elapsed - audio.buffer.lastPlayed <= 80) {
        continue;
      }
      this._assignAvailableChannel(audio);
    }

    this.audio.length = 0;
    for (const channel of this.channels) {
      if (!channel.audio) {
        continue;
      }

      //channel has audio available
      if (channel.audio.buffer.buffer) {
        channel.audio.play(elapsed);
      } else {
        // keep audio that is still loading
        this.audio.push(channel.audio);
      }
    }
  }
}
