import DeferredAudioBuffer from "./DeferredAudioBuffer";
import Audio from "./Audio";
import SoundChannel from "./SoundChannel";
import range from "../../common/utils/range";

// an implementation of bw sound referenced from openbw, limited to 8 channels (although not really since tails are allowed to continue)
export default class SoundChannels {
  constructor(mixer, loadSoundAsync) {
    this.mixer = mixer;
    this.maxChannels = 8;
    this.channels = range(0, this.maxChannels).map(() => new SoundChannel());
    this.buffers = new Map();
    this.loadSoundAsync = loadSoundAsync;
    this.audio = [];
    this.scheduled = [];
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

  /**
   * We call queue() a few frames ahead of time to get the buffers loading
   * @param {Object} soundData
   * @param {Number} elapsed
   */
  queue(soundData, elapsed) {
    this.audio.push(
      new Audio(this.mixer, soundData, this._getBuffer(soundData.id, elapsed))
    );
  }

  _channelHasAudioAvailable(audio) {
    return audio.buffer.buffer;
  }

  _channelHasNotPlayed(audio) {
    return !audio.source;
  }

  /**
   * play the audio, even if not immediately (due to loading buffer)
   * @param {Number} elapsed
   */
  play(elapsed) {
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
