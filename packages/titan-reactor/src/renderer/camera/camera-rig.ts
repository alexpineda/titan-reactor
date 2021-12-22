import { Settings } from "../../common/types/common";
import { Clock, PerspectiveCamera, Vector3 } from "three";

import { CanvasTarget } from "../../common/image";
import PreviewCamera from "./preview-camera";
import StandardCameraControls from "../input/standard-camera-controls";
import { KeyboardShortcuts } from "../input";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

// manages camera and camera controls as well as updating aspect ratio on screen resize and other camera operations
class CameraRig {
  gameSurface: CanvasTarget;
  freeControl = false;
  camera: PerspectiveCamera;
  previewCamera: PerspectiveCamera;

  private cameraClock = new Clock();
  private _delta = new Vector3();
  private settings: Settings;
  private control: StandardCameraControls;
  private previewControl?: StandardCameraControls;

  constructor(
    settings: Settings,
    gameSurface: CanvasTarget,
    previewSurface: CanvasTarget,
    minimapControl: boolean,
    keyboardShortcuts: KeyboardShortcuts,
    freeControl = false
  ) {
    this.settings = settings;
    this.gameSurface = gameSurface;
    this.freeControl = freeControl;
    const aspect = gameSurface.width / gameSurface.height;
    this.camera = this._createCamera(aspect);
    this.previewCamera = this._createPreviewCamera(aspect);
    // this.control = new StandardCameraControls(
    //   this.camera,
    //   gameSurface.canvas,
    //   keyboardShortcuts,
    //   freeControl
    // );

    // this.control.setConstraints(freeControl);
    // this.control.initNumpadControls();
    // this.control.execNumpad(1);

    // this.lookAtLocation();

    if (minimapControl) {
      this.previewControl = new StandardCameraControls(
        this.previewCamera,
        previewSurface.canvas,
        keyboardShortcuts
      );
    }
    //   this.previewControl.setConstraints();
    //   this.previewControl.initNumpadControls();
    //   this.previewControl.execNumpad(7);
    //   this.previewControl.keyboardTruckingEnabled = false;

    //   minimapControl.addEventListener("start", ({ message: { speed } }) => {
    //     const target = new Vector3();
    //     const position = new Vector3();

    //       this.camera.fov = this.previewCamera.fov;
    //       this.previewControl.getTarget(target);
    //       this.previewControl.getPosition(position);

    //     const transition = speed < 2;
    //     this.control.dampingFactor = 0.05;

    //     this.camera.updateProjectionMatrix();
    //     this.control.setLookAt(
    //       position.x,
    //       position.y,
    //       position.z,
    //       target.x,
    //       target.y,
    //       target.z,
    //       transition
    //     );
    //   });

    //   minimapControl.addEventListener("update", ({ message: { pos, e } }) => {
    //     this.control.moveTo(pos.x, pos.y, pos.z, true);
    //     this.camera.position.subVectors(pos, this._delta);
    //   });

    //   minimapControl.addEventListener("hover", ({ message: { pos, e } }) => {
    //     const target = new Vector3();
    //     this.control.getTarget(target);
    //     this._delta.subVectors(target, this.camera.position);
    //     this.previewControl.moveTo(pos.x, pos.y, pos.z, false);
    //     this.previewCamera.position.subVectors(pos, this._delta);
    //   });

    //   minimapControl.addEventListener("enter", () => {
    //     const target = new Vector3();
    //     const position = new Vector3();
    //     this.control.getTarget(target);
    //     this.control.getPosition(position);

    //     this.previewCamera.fov = this.camera.fov;
    //     this.previewCamera.updateProjectionMatrix();
    //     this.previewControl.setLookAt(
    //       position.x,
    //       position.y,
    //       position.z,
    //       target.x,
    //       target.y,
    //       target.z,
    //       false
    //     );
    //   });
    // }
  }

  _createCamera(aspect: number) {
    return this._initPerspectiveCamera(aspect);
  }

  _createPreviewCamera(aspect: number) {
    return this._initPerspectiveCamera(aspect, PreviewCamera);
  }

  _initPerspectiveCamera(aspect: number, constructor = PerspectiveCamera) {
    if (this.freeControl) {
      return new constructor(55, aspect);
    }
    return new constructor(55, aspect, 3, 256);
  }

  // tall camera to look down at scene for preloading webgl programs
  get compileCamera() {
    const aspect = this.gameSurface.width / this.gameSurface.height;
    const camera = this._initPerspectiveCamera(aspect);
    camera.position.set(0, 200, 0);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  lookAtLocation(x: number, y: number) {
    const p = new Vector3();
    const t = new Vector3();
    const d = new Vector3();

    this.control.getPosition(p);
    this.control.getTarget(t);

    d.subVectors(t, p);
    this.control.moveTo(x, 0, y, false);
    // this.control.setPosition(position.subVectors(p, d));
  }

  update() {
    const delta = this.cameraClock.getDelta();
    // this.control.update(delta);
    this.previewControl && this.previewControl.update(delta);
  }

  updateGameScreenAspect(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updatePreviewScreenAspect(width: number, height: number) {}

  getShear() {
    const delta = new Vector3();
    const target = this.getTarget();
    return delta.subVectors(this.camera.position, target);
  }

  updateDirection32() {
    // let dir;
    // const target = this.getTarget();
    // const adj = target.z - this.camera.position.z;
    // const opp = target.x - this.camera.position.x;
    // const a = Math.atan2(opp, adj) / Math.PI;
    // if (a < 0) {
    //   dir = Math.floor((a + 2) * 16 + 16);
    // } else {
    //   dir = Math.floor(a * 16 + 16);
    // }
    // if (dir != this.camera.userData.direction) {
    //   this.camera.userData.prevDirection = this.camera.userData.direction;
    //   this.camera.userData.direction = dir;
    // }
  }

  updateFromSettings() {
    // .azimuthRotateSpeed	number	1.0	Speed of azimuth rotation.
    // .polarRotateSpeed	number	1.0	Speed of polar rotation.
  }

  getTarget() {
    const target = new Vector3();
    this.control.getTarget(target);
    return target;
  }

  setTarget(x: number, y: number, z: number, enableTransition = false) {
    this.control.setTarget(x, y, z, enableTransition);
  }

  dispose() {
    this.control.dispose();
    this.previewControl && this.previewControl.dispose();
  }
}

export default CameraRig;
