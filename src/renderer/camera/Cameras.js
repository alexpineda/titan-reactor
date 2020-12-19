import { is } from "ramda";
import { Clock, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera";
import {
  MinimapLayer,
  MinimapUnitLayer,
  MinimapPingLayer,
  MinimapFogLayer,
} from "./Layers";
import MinimapCameraHelper from "./MinimapCameraHelper";
import StandardCameraControls from "./StandardCameraControls";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

class Cameras {
  constructor(context, gameSurface, minimapControl, keyboardShortcuts) {
    this.context = context;
    this.gameSurface = gameSurface;
    const aspect = gameSurface.width / gameSurface.height;
    this.camera = this._createCamera(aspect);
    this.previewCamera = this._createCamera(aspect);
    this.cinematicOptions = {
      far: this.camera.far,
      focalDepth: 100,
      focalLength: 40,
      fstop: 20,
      near: 1,
      showFocus: 0,
      gammaBoost: 1.5,
    };

    this.cinematicCamera = this._initCinematicCamera(aspect);
    this.useCinematicCamera = false;

    this.control = new StandardCameraControls(
      this.camera,
      gameSurface.canvas,
      keyboardShortcuts
    );
    this.previewControl = new StandardCameraControls(
      this.previewCamera,
      gameSurface.canvas,
      keyboardShortcuts
    );
    this.controlClock = new Clock();

    this._delta = new Vector3();

    if (minimapControl) {
      this.minimapCamera = this._initMinimapCamera(
        minimapControl.mapWidth,
        minimapControl.mapHeight
      );
      this.minimapCameraHelper = new MinimapCameraHelper(this.camera);
      this.minimapCameraHelper.layers.enable(MinimapLayer);

      //start-drag update-drag stop-drag
      //start-preview update-preview stop-preview

      minimapControl.addEventListener(
        "start",
        ({ message: { pos, rightMouse, e } }) => {
          const target = new Vector3();
          this.control.getTarget(target);

          this._delta.subVectors(target, this.camera.position);
          this.control.moveTo(pos.x, pos.y, pos.z, rightMouse);
          this.camera.position.subVectors(pos, this._delta);

          // this.control.rotateTo(Math.PI / 4, Math.PI / 4, true);
          // const newCameraPosition = new Vector3();
          // newCameraPosition.subVectors(pos, this._delta);

          // this.control.setLookAt(
          //   newCameraPosition.x,
          //   newCameraPosition.y,
          //   newCameraPosition.z,
          //   pos.x,
          //   pos.y,
          //   pos.z,
          //   rightMouse
          // );
        }
      );

      minimapControl.addEventListener("update", ({ message: { pos, e } }) => {
        this.control.moveTo(pos.x, pos.y, pos.z, true);
        this.camera.position.subVectors(pos, this._delta);
        // this.control.rotateTo(Math.PI / 4, Math.PI / 4, true);

        // const newCameraPosition = new Vector3();
        // newCameraPosition.subVectors(pos, this._delta);

        // this.control.setLookAt(
        //   newCameraPosition.x,
        //   newCameraPosition.y,
        //   newCameraPosition.z,
        //   pos.x,
        //   pos.y,
        //   pos.z,
        //   true
        // );
      });

      // minimapControl.addEventListener(
      //   "hover",
      //   ({ message: { pos, preview } }) => {
      //     this.previewOn = preview;
      //     if (preview) {
      //       const target = new Vector3();
      //       this.control.getTarget(target);

      //       const delta = new Vector3();
      //       delta.subVectors(target, this.previewCamera.position);

      //       const newCameraPosition = new Vector3();
      //       newCameraPosition.subVectors(pos, delta);

      //       this.previewControl.setLookAt(
      //         newCameraPosition.x,
      //         newCameraPosition.y,
      //         newCameraPosition.z,
      //         pos.x,
      //         pos.y,
      //         pos.z,
      //         true
      //       );
      //     }
      //   }
      // );

      // minimapControl.addEventListener("stop", () => {
      //   this.previewOn = false;
      // });
    }

    this.resetMainCamera();
  }

  _createCamera(aspect) {
    return this._initPerspectiveCamera(aspect);
    // this.context.settings.orthoCamera
    //   ? this._initOrthoCamera()
  }

  _initPerspectiveCamera(aspect) {
    return new PerspectiveCamera(22, aspect, 6, 256);
  }

  _initCinematicCamera(aspect) {
    return new CinematicCamera(3, aspect, 6, 256);
  }

  _initOrthoCamera() {
    return new OrthographicCamera(-16, 16, 16, -16, 1, 10000);
  }

  _initMinimapCamera(mapWidth, mapHeight) {
    const dim = Math.max(mapWidth, mapHeight);

    const camera = new OrthographicCamera(
      -mapWidth / 2,
      mapWidth / 2,
      mapHeight / 2,
      -mapHeight / 2,
      0.1,
      130
    );
    camera.position.set(0, 128, 0);
    camera.lookAt(new Vector3());
    camera.layers.disableAll();
    camera.layers.enable(MinimapLayer);
    camera.layers.enable(MinimapUnitLayer);
    camera.layers.enable(MinimapPingLayer);
    camera.layers.enable(MinimapFogLayer);

    return camera;
  }

  enableControls(val) {
    this.control.enabled = val;
  }

  update() {
    this.control.update(this.controlClock.getDelta());
    this.previewControl.update(this.controlClock.getDelta());
  }

  resetMainCamera() {
    this.camera.position.set(0, 100, 0);
    this.camera.lookAt(new Vector3());
  }

  updateGameScreenAspect(width, height) {
    if (is(OrthographicCamera, this.camera)) {
      const m = Math.max(width, height);

      this.camera.left = (-16 * width) / m;
      this.camera.right = (16 * width) / m;
      this.camera.top = (16 * height) / m;
      this.camera.bottom = (-16 * height) / m;
    } else {
      this.camera.aspect = width / height;
      this.cinematicCamera.aspect = width / height;
    }

    this.camera.updateProjectionMatrix();
  }

  updatePreviewScreenAspect(width, height) {
    this.previewCamera.aspect = width / height;
    this.previewCamera.updateProjectionMatrix();
  }

  getShear() {
    const delta = new Vector3();
    const target = new Vector3();
    this.control.getTarget(target);
    return delta.subVectors(this.camera.position, target);
  }

  getDirection32() {
    const target = new Vector3();
    this.control.getTarget(target);
    const adj = target.z - this.camera.position.z;
    const opp = target.x - this.camera.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      return Math.floor((a + 2) * 16 + 16);
    } else {
      return Math.floor(a * 16 + 16);
    }
  }

  dispose() {
    this.control.dispose();
    this.previewControl.dispose();
  }
}

export default Cameras;
