// a reference to an audio buffer to play once it's loaded
export default class DeferredAudioBuffer {
  constructor(load, soundId) {
    this.soundId = soundId;
    this._load = load;
    this._buffer = null;
    this.lastPlayed = 0;
    this.load();
  }

  async load() {
    this._buffer = await this._load(this.soundId);
  }

  get buffer() {
    return this._buffer;
  }
}
