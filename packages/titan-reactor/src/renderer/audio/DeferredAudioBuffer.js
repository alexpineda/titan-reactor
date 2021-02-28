/**
 * Thanks javascript!
 */
export default class DeferredAudioBuffer {
  constructor(load, soundId, lastPlayed) {
    this.soundId = soundId;
    this._load = load;
    this._buffer = null;
    this.lastPlayed = lastPlayed;
    this.load();
  }

  async load() {
    this._buffer = await this._load(this.soundId);
  }

  get buffer() {
    return this._buffer;
  }
}
