import { Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three";

const stopTime = 80; //ms

export default class Channel {
  constructor(createAudio, removeAudio) {
    this.createAudio = createAudio;
    this.removeAudio = removeAudio;

    this.audio = this.createAudio();
    this.queued = false;

    // we have a few ms seconds delay on stopping audio to avoid clipping, put them here as their gain is reduced
    this.stoppedAudio = [];
  }

  queue(sound) {
    this.id = sound.id;
    this.unitTypeId = sound.unitTypeId;
    this.flags = sound.flags;
    this.priority = sound.priority;
  }

  get isPlaying() {
    return this.audio.isPlaying;
  }

  play(buffer, volume, x, y, z) {
    if (this.audio.isPlaying) {
      this.stop();
    }

    this.audio.setBuffer(buffer);
    this.audio.setVolume(volume);
    this.audio.setRefDistance(1);
    this.audio.setRolloffFactor(0.5);
    this.audio.setDistanceModel("exponential");
    this.audio.position.set(x, y, z);

    //work arounds to get updateMatrixWorld to execute immediately
    this.audio.hasPlaybackControl = false;
    const td = this.audio.listener.timeDelta;
    this.audio.listener.timeDelta = 0;
    this.audio.updateMatrixWorld(true);
    this.audio.listener.timeDelta = td;
    this.audio.hasPlaybackControl = true;

    this.audio.play();
  }

  // https://alemangui.github.io/ramp-to-value
  stop() {
    const audio = this.audio;
    audio.gain.gain.setValueAtTime(
      audio.gain.gain.value,
      audio.context.currentTime
    );
    audio.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.context.currentTime + stopTime * 0.001
    );
    audio._progress = 0;
    audio.source.onended = null;
    audio.isPlaying = false;

    // let stopped audio gain reduce over time
    this.stoppedAudio.push(audio);
    setTimeout(() => {
      this.stoppedAudio = this.stoppedAudio.filter((a) => a !== audio);
      this.removeAudio(audio);
    }, stopTime);
    this.audio = this.createAudio();
  }
}
