const stopTime = 30; //ms
export default class Audio {
  /**
   *
   * @param {MainMixer} mixer
   * @param {Object} soundData
   * @param {DeferredAudioBuffer} buffer
   * @param {SoundChannel} channel
   */
  constructor(mixer, sound, buffer, queueStartTime) {
    this.mixer = mixer;
    this.buffer = buffer;
    this.sound = sound;
    this.isPlaying = false;
    this.queueStartTime = queueStartTime;
  }

  queue(elapsed) {
    if (this.source) return;
    this.isPlaying = true;
    this.buffer.lastPlayed = elapsed;
  }

  play(elapsed) {
    const offset = 0; //(elapsed - this.queueStartTime) * 0.001;
    if (this.source || offset > this.buffer.buffer.duration) return;

    const source = this.mixer.context.createBufferSource();

    const gain = this.mixer.context.createGain();
    // gain.gain.value = this.sound.volume / 100; //@todo allow classic style sounds with pan

    const panner = this.mixer.context.createPanner();
    panner.panningModel = "HRTF";
    //refDistance, rolloffFactor, distanceModel

    panner.refDistance = 1;
    panner.rolloffFactor = 0.5;
    panner.distanceModel = "exponential";

    panner.positionX.value = this.sound.mapX;
    panner.positionY.value = this.sound.mapY;
    panner.positionZ.value = this.sound.mapZ;

    source.buffer = this.buffer.buffer;

    gain.connect(this.mixer.sound);
    panner.connect(gain);
    source.connect(panner);

    source.onended = () => {
      this.isPlaying = false;
    };
    source.start(this.mixer.context.currentTime - offset);
    this.buffer.lastPlayed = elapsed;
    this.source = source;
    this.gain = gain;
    this.isPlaying = true;
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    this.isPlaying = false;

    if (!this.source) {
      return;
    }

    this.gain.gain.setValueAtTime(
      this.gain.gain.value,
      this.mixer.context.currentTime
    );
    this.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.mixer.context.currentTime + stopTime * 0.001
    );
    this.source.onended = null;
  }
}
