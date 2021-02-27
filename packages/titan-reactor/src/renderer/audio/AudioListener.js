import { AudioContext, Quaternion, Clock, Object3D, Vector3 } from "three";

AudioContext.setContext(
  new window.AudioContext({ latencyHint: "interactive" })
);

const _position = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();
const _orientation = /*@__PURE__*/ new Vector3();

export default class AudioListener extends Object3D {
  constructor() {
    super();

    this.type = "AudioListener";

    this.context = AudioContext.getContext();

    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);

    this.filter = null;

    this.timeDelta = 0;

    const compressor = this.context.createDynamicsCompressor();
    this.setFilter(compressor);

    // private

    this._clock = new Clock();
  }

  getInput() {
    return this.gain;
  }

  removeFilter() {
    if (this.filter !== null) {
      this.gain.disconnect(this.filter);
      this.filter.disconnect(this.context.destination);
      this.gain.connect(this.context.destination);
      this.filter = null;
    }

    return this;
  }

  getFilter() {
    return this.filter;
  }

  setFilter(value) {
    if (this.filter !== null) {
      this.gain.disconnect(this.filter);
      this.filter.disconnect(this.context.destination);
    } else {
      this.gain.disconnect(this.context.destination);
    }

    this.filter = value;
    this.gain.connect(this.filter);
    this.filter.connect(this.context.destination);

    return this;
  }

  getMasterVolume() {
    return this.gain.gain.value;
  }

  setMasterVolume(value) {
    this.gain.gain.setTargetAtTime(value, this.context.currentTime, 0.01);

    return this;
  }

  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);

    const listener = this.context.listener;
    const up = this.up;

    this.timeDelta = this._clock.getDelta();

    this.matrixWorld.decompose(_position, _quaternion, _scale);

    _orientation.set(0, 0, -1).applyQuaternion(_quaternion);

    // code path for Chrome (see #14393)

    const endTime = this.context.currentTime + this.timeDelta;

    // listener.positionX.setValueAtTime(_position.x, endTime);
    // listener.positionY.setValueAtTime(_position.y, endTime);
    // listener.positionZ.setValueAtTime(_position.z, endTime);
    // listener.forwardX.setValueAtTime(_orientation.x, endTime);
    // listener.forwardY.setValueAtTime(_orientation.y, endTime);
    // listener.forwardZ.setValueAtTime(_orientation.z, endTime);
    // listener.upX.setValueAtTime(up.x, endTime);
    // listener.upY.setValueAtTime(up.y, endTime);
    // listener.upZ.setValueAtTime(up.z, endTime);

    listener.positionX.linearRampToValueAtTime(_position.x, endTime);
    listener.positionY.linearRampToValueAtTime(_position.y, endTime);
    listener.positionZ.linearRampToValueAtTime(_position.z, endTime);
    listener.forwardX.linearRampToValueAtTime(_orientation.x, endTime);
    listener.forwardY.linearRampToValueAtTime(_orientation.y, endTime);
    listener.forwardZ.linearRampToValueAtTime(_orientation.z, endTime);
    listener.upX.linearRampToValueAtTime(up.x, endTime);
    listener.upY.linearRampToValueAtTime(up.y, endTime);
    listener.upZ.linearRampToValueAtTime(up.z, endTime);
  }
}
