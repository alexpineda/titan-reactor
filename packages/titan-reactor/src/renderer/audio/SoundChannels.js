import { range } from "ramda";
import AudioBuffer from "./AudioBuffer";
import SoundChannel from "./SoundChannel";

export default class SoundChannels {
  constructor(mixer, loadSoundAsync) {
    this.mixer = mixer;
    this.maxChannels = 8;
    this.channels = range(0, this.maxChannels).map(
      () => new SoundChannel(this.mixer)
    );
    this.buffers = new Map();
    this.loadSoundAsync = loadSoundAsync;
  }

  async _load(id) {
    const buffer = (await this.loadSoundAsync(id)).buffer;
    return await this.mixer.context.decodeAudioData(buffer.slice(0));
  }

  async _getBuffer(soundId) {
    if (this.buffers.has(soundId)) {
      return this.buffers.get(soundId);
    }
    const buffer = await this._load(soundId);
    this.buffers.set(soundId, new AudioBuffer(buffer));
    return buffer;
  }

  async _queueSound(sound, elapsed) {
    const channel = this._getFreeChannel(sound, elapsed);
    if (!channel) {
      return;
    }

    sound.buffer = (await this._getBuffer(sound.id)).buffer;
    channel.queue(sound);
  }

  async queue(sounds, elapsed) {
    for (const sound of sounds) {
      await this._queueSound(sound, elapsed);
    }
  }

  _getFreeChannel(requestedSound, elapsed) {
    if (
      this.buffers.has(requestedSound.id) &&
      elapsed - this.buffers.get(requestedSound.id).elapsed <= 80
    ) {
      return false;
    }

    if (requestedSound.flags & 0x10) {
      const channel = this.channels.find(({ id }) => id === requestedSound.id);
      //@todo native sound playing
      if (channel && channel.isPlaying) {
        return false;
      }
    } else if (requestedSound.flags & 2 && requestedSound.unitTypeId) {
      const channel = this.channels.find(
        ({ unitTypeId, flags }) =>
          unitTypeId === requestedSound.unitTypeId && flags & 2
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

    let bestPriority = requestedSound.priority;
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

  play(time) {
    for (const channel of this.channels) {
      channel.play(time);
    }
  }
}
