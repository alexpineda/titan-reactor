import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { FirstPersonControls } from "../utils/FirstPersonControls";
import StandardCameraControls from "./StandardCameraControls";

class CameraControl {
  constructor() {
    this._standard = null;
    this._fps = null;
    this._pointerlock = null;
    this._numpad = null;
    this._fly = null;
  }

  attach(camera, domElement) {
    if (this.camera || this.domElement) {
      this.detach();
    }
    this.camera = camera;
    this.domElement = domElement;
  }

  _attached() {
    return this.camera || this.domElement;
  }

  standard(enabled = true) {
    if (this._standard) {
      if (!enabled) {
        this._standard.dispose();
      }
      return;
    }
    this._standard = new StandardCameraControls(this.camera, this.domElement);
    return this._standard;
  }

  fps(enabled = true) {
    if (this._fps) {
      this._fps.enabled = enabled;
      return;
    }
  }

  pointerlock(enabled = true) {
    if (this._pointerlock) {
      this._pointerlock.enabled = enabled;
      return;
    }
  }

  numpad(enabled = true) {
    if (this._numpad) {
      this._numpad.enabled = enabled;
      return;
    }
  }

  detach(type) {
    if (this._standard && (!type || type === this.standard)) {
      this._standard.dispose();
    }

    if (this._fps && (!type || type === this.fps)) {
      this._fps.dispose();
    }

    if (this._pointerlock && (!type || type === this.pointerlock)) {
      this._pointerlock.dispose();
    }

    if (this._numpad && (!type || type === this.numpad)) {
      this._numpad.dispose();
    }
  }

  dispose() {
    this.detach();
  }
}

export default CameraControl;
