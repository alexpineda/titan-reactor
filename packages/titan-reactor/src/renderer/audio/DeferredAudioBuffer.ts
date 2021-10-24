// a reference to an audio buffer to play once it's loaded
export default class DeferredAudioBuffer {
  lastPlayed = 0;
  soundId: number;
  private _load: (id: number) => Promise<AudioBuffer>;
  private _buffer?: AudioBuffer;

  constructor(load: (id: number) => Promise<AudioBuffer>, soundId: number) {
    this.soundId = soundId;
    this._load = load;
    this.load();
  }

  async load() {
    this._buffer = await this._load(this.soundId);
  }

  get buffer() {
    return this._buffer;
  }
}
