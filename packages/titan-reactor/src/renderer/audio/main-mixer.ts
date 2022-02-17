import { AudioListener, Camera, Vector3 } from "three";

const MUSIC_REDUCTION_RATIO = 0.1;
const _lerp = new Vector3;
// mixes sound and music volumes
export class MainMixer extends AudioListener {
  sound: GainNode;
  music: GainNode;

  constructor() {
    super();

    this.sound = this.context.createGain();
    this.sound.connect(this.gain);

    this.music = this.context.createGain();
    this.music.connect(this.gain);

    this.matrixAutoUpdate = false;
  }

  // For compatibility with THREE.Audio, which is used for Music.
  // getInput() is called on the THREE.Audio constructor.
  // If in the future, we want audio for our menu, we'll need to dynamically swap this.
  override getInput() {
    return this.music;
  }

  get masterVolume() {
    return this.gain.gain.value;
  }

  set masterVolume(val) {
    this.gain.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get soundVolume() {
    return this.sound.gain.value;
  }

  set soundVolume(val) {
    this.sound.gain.setTargetAtTime(val, this.context.currentTime, 0.01);
  }

  get musicVolume() {
    return this.music.gain.value;
  }

  set musicVolume(val) {
    this.music.gain.setTargetAtTime(val * MUSIC_REDUCTION_RATIO, this.context.currentTime, 0.01);
  }

  lerp(a: Vector3, b: Vector3, alpha: number, delta: number) {
    _lerp.lerpVectors(a, b, alpha)
    this.update(_lerp.x, _lerp.y, _lerp.z, delta);
  }

  update(x: number, y: number, z: number, delta: number) {
    if (this.parent) {
      throw new Error("This method should not be called on a parented object.");
    }
    const endTime = this.context.currentTime + delta * 0.001;
    this.context.listener.positionX.linearRampToValueAtTime(x, endTime);
    this.context.listener.positionY.linearRampToValueAtTime(y, endTime);
    this.context.listener.positionZ.linearRampToValueAtTime(z, endTime);
  }

  updateFromCamera(camera: Camera) {
    if (this.parent) {
      throw new Error("This method should not be called on a parented object.");
    }
    this.matrixWorld.multiplyMatrices(camera.matrixWorld, this.matrix)
    this.updateMatrixWorld(false);
  }
}

export default MainMixer;
