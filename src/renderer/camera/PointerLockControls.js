import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import InputEvents from "../input/InputEvents";

class StandardPointerLockControls extends PointerLockControls {
  constructor(camera, domElement) {
    super(camera, domElement);
    this.firstPersonControls = new PointerLockControls(
      this.cinematicCamera,
      gameSurface.canvas
    );
    this.firstPersonControls.disconnect();

    this.firstPersonControlsOptions = {
      moveSpeed: 0.02,
      scrollSpeed: 0.02,
    };
    this._fpControlsListener = (evt) => {
      if (this.activeCamera !== this.cinematicCamera) return;
      this.cinematicCamera.position.y =
        this.cinematicCamera.position.y +
        evt.deltaY * -this.firstPersonControlsOptions.scrollSpeed;
    };
    this.gameSurface.canvas.addEventListener("wheel", this._fpControlsListener);

    keyboardShortcuts.addEventListener(
      InputEvents.TruckLeft,
      ({ message: delta }) => {
        this.firstPersonControls.moveRight(
          -this.firstPersonControlsOptions.moveSpeed * delta
        );
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.TruckRight,
      ({ message: delta }) => {
        this.firstPersonControls.moveRight(
          this.firstPersonControlsOptions.moveSpeed * delta
        );
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveForward,
      ({ message: delta }) => {
        this.firstPersonControls.moveForward(
          this.firstPersonControlsOptions.moveSpeed * delta
        );
      }
    );
    keyboardShortcuts.addEventListener(
      InputEvents.MoveBackward,
      ({ message: delta }) => {
        this.firstPersonControls.moveForward(
          -this.firstPersonControlsOptions.moveSpeed * delta
        );
      }
    );
  }
}
