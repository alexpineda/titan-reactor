import range from "../../common/utils/range";
import { SoundBWInstance } from "../game-data/SoundsBW";
import Audio from "./Audio";
import DeferredAudioBuffer from "./DeferredAudioBuffer";
import MainMixer from "./MainMixer";
import SoundChannel from "./SoundChannel";

// an implementation of bw sound referenced from openbw, limited to 8 channels (although not really since tails are allowed to continue)
export class SoundChannels {
  mixer: MainMixer;
  maxChannels = 8;
  channels = range(0, this.maxChannels).map(() => new SoundChannel());
  buffers = new Map();
  audio: Audio[] = [];
  scheduled: Audio[] = [];
  loadSoundAsync: (id: number) => Promise<ArrayBuffer>;

  constructor(
    mixer: MainMixer,
    loadSoundAsync: (id: number) => Promise<ArrayBuffer>
  ) {
    this.mixer = mixer;
    this.loadSoundAsync = loadSoundAsync;
  }

  async _load(id: number) {
    const buffer = await this.loadSoundAsync(id);
    return await this.mixer.context.decodeAudioData(buffer.slice(0));
  }

  _getBuffer(soundId: number) {
    let buffer = this.buffers.get(soundId);
    if (!buffer) {
      buffer = new DeferredAudioBuffer(this._load.bind(this), soundId);
      this.buffers.set(soundId, buffer);
    }
    return buffer;
  }

  _getAvailableChannel(sound: SoundBWInstance) {
    if (sound.flags & 0x10) {
      for (const channel of this.channels) {
        if (channel.isPlaying && channel.id === sound.id) {
          if (channel.audio && channel.audio.isPlaying) {
            return;
          }
          channel.isPlaying = false;
        }
      }
    } else if (sound.flags & 2 && sound.unitTypeId) {
      for (const channel of this.channels) {
        if (
          channel.isPlaying &&
          channel.unitTypeId === sound.unitTypeId &&
          channel.flags & 2
        ) {
          if (channel.audio && channel.audio.isPlaying) {
            return;
          }
          channel.isPlaying = false;
        }
      }
    }

    let availableChannel;
    for (const channel of this.channels) {
      if (channel.isPlaying) {
        if (channel.audio && !channel.audio.isPlaying) {
          channel.isPlaying = false;
          availableChannel = channel;
        }
      } else {
        availableChannel = channel;
      }
    }

    if (availableChannel) {
      return availableChannel;
    }

    let bestPriority = sound.priority;
    for (const channel of this.channels) {
      if (channel.flags & 0x20) continue;
      if (channel.priority < bestPriority) {
        bestPriority = channel.priority;
        availableChannel = channel;
      }
    }
    return availableChannel;
  }

  queue(soundData: SoundBWInstance) {
    this.audio.push(
      new Audio(this.mixer, soundData, this._getBuffer(soundData.id))
    );
  }

  _channelHasAudioAvailable(audio: Audio) {
    return audio.buffer.buffer;
  }

  _channelHasNotPlayed(audio: Audio) {
    return !audio.source;
  }

  play(elapsed: number) {
    for (const audio of this.audio) {
      if (elapsed - audio.buffer.lastPlayed <= 80) {
        continue;
      }
      const channel = this._getAvailableChannel(audio.sound);
      if (channel) {
        channel.queue(audio);
        audio.queue(elapsed);
      }
    }

    this.audio.length = 0;
    for (const channel of this.channels) {
      if (!channel.audio) {
        continue;
      }
      this.scheduled.push(channel.audio);
    }

    //channel has audio available
    for (const audio of this.scheduled.filter(this._channelHasAudioAvailable)) {
      audio.play(elapsed);
    }

    //keep items that are loading for next time
    this.scheduled = this.scheduled.filter(this._channelHasNotPlayed);
  }
}
export default SoundChannels;
