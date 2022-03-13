
import { Vector3 } from "three";
import { SoundDAT } from "../../common/types";
import range from "../../common/utils/range";
import { SoundStruct } from "../../common/types/structs";
import Audio from "./audio";
import { ClassicSound } from "./classic-sound";
import DeferredAudioBuffer from "./deferred-audio-buffer";
import MainMixer from "./main-mixer";
import SoundChannel from "./sound-channel";

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

  _getAvailableChannel(audio: Audio) {
    const sound = audio.sound;

    if (audio.dat.flags & 0x10) {
      for (const channel of this.channels) {
        if (channel.isPlaying && channel.id === sound.typeId) {
          if (channel.audio && channel.audio.isPlaying) {
            return;
          }
          channel.isPlaying = false;
        }
      }
    } else if (audio.dat.flags & 2 && sound.unitTypeId) {
      for (const channel of this.channels) {
        if (
          channel.isPlaying &&
          channel.unitTypeId === sound.unitTypeId &&
          channel.audio &&
          channel.audio.dat.flags & 2
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

    let bestPriority = audio.dat.priority;
    for (const channel of this.channels) {
      if (!channel.audio) {
        return channel;
      }
      if (channel.audio?.dat.flags & 0x20) continue;
      if (channel.audio?.dat.priority < bestPriority) {
        bestPriority = channel.audio?.dat.priority;
        availableChannel = channel;
      }
    }
    return availableChannel;
  }

  queue(soundData: SoundStruct | ClassicSound, dat: SoundDAT, mapCoords: Vector3) {
    this.audio.push(
      new Audio(this.mixer, soundData, this._getBuffer(soundData.typeId), dat, mapCoords)
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
      const channel = this._getAvailableChannel(audio);
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

    for (const audio of this.scheduled.filter(this._channelHasAudioAvailable)) {
      audio.play(elapsed);
    }

    //keep items that are loading for next time
    this.scheduled = this.scheduled.filter(this._channelHasNotPlayed);
  }
}
export default SoundChannels;