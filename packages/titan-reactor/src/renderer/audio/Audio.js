import AudioPanningStyle from "common/AudioPanningStyle";

const stopTime = 30; //ms

// an instance of a bw sound
export default class Audio {
  /**
   *
   * @param {MainMixer} mixer
   * @param {Object} soundData
   * @param {DeferredAudioBuffer} buffer
   * @param {SoundChannel} channel
   */
  constructor(mixer, sound, buffer, panningStyle = AudioPanningStyle.Spatial) {
    this.mixer = mixer;
    this.buffer = buffer;
    this.sound = sound;
    this.isPlaying = false;
    this.panningStyle = panningStyle;
  }

  queue(elapsed) {
    if (this.source) return;
    this.isPlaying = true;
    this.buffer.lastPlayed = elapsed;
    this.queueStartTime = elapsed;
  }

  play(elapsed) {
    const offset = (elapsed - this.queueStartTime) * 0.001;
    if (this.source || offset > this.buffer.buffer.duration) return;

    const source = this.mixer.context.createBufferSource();

    const gain = this.mixer.context.createGain();

    let panner;
    let volume = 1;
    if (this.panningStyle === AudioPanningStyle.Stereo) {
      panner = this.mixer.context.createStereoPanner();
      panner.pan.value = this.sound.pan;
      volume = this.sound.volume / 100;
    } else {
      panner = this.mixer.context.createPanner();
      panner.panningModel = "HRTF";

      panner.refDistance = 20;
      panner.rolloffFactor = 0.5;
      panner.distanceModel = "inverse";

      panner.positionX.value = this.sound.mapX;
      panner.positionY.value = this.sound.mapY;
      panner.positionZ.value = this.sound.mapZ;
    }

    source.buffer = this.buffer.buffer;

    gain.connect(this.mixer.sound);
    panner.connect(gain);
    source.connect(panner);

    source.onended = () => {
      this.isPlaying = false;
    };
    gain.gain.setValueAtTime(
      Math.min(0.99, volume),
      this.mixer.context.currentTime
    );
    source.start(0);
    // gain.gain.exponentialRampToValueAtTime(
    //   volume,
    //   this.mixer.context.currentTime + offset
    // );
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
