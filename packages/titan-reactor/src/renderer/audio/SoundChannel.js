const stopTime = 30; //ms

export default class SoundChannel {
  constructor(mixer) {
    this.mixer = mixer;
    this.isPlaying = false;
    this.sound = null;
  }

  queue(sound) {
    this.sound = sound;
    this.id = sound.id;
    this.unitTypeId = sound.unitTypeId;
    this.priority = sound.priority;
    this.flags = sound.flags;
  }

  play(time) {
    if (!this.sound) {
      return;
    }

    const source = this.mixer.context.createBufferSource();

    const gain = this.mixer.context.createGain();
    gain.gain.value = this.sound.volume;

    const panner = this.mixer.context.createPanner();
    panner.panningModel = "HRTF";
    //refDistance, rolloffFactor, distanceModel

    panner.refDistance = 1;
    panner.rolloffFactor = 0.5;
    panner.distanceModel = "exponential";

    panner.positionX.value = this.sound.mapX;
    panner.positionY.value = this.sound.mapY;
    panner.positionZ.value = this.sound.mapZ;

    source.buffer = this.sound.buffer;

    gain.connect(this.mixer.input);
    panner.connect(gain);
    source.connect(panner);

    source.onended = () => {
      this.isPlaying = false;
    };
    source.start(this.mixer.context.currentTime + time * 1000);
    this.sound.source = source;
    this.sound.gain = gain;
    this.isPlaying = true;
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    const sound = this.sound;
    sound.gain.gain.setValueAtTime(
      sound.gain.gain.value,
      sound.context.currentTime
    );
    sound.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      sound.context.currentTime + stopTime * 0.001
    );
    sound.source.onended = null;
    this.isPlaying = false;
  }
}
