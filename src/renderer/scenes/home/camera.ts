import Janitor from "@utils/janitor";
import CameraControls from "camera-controls";
import { MathUtils, Object3D, PerspectiveCamera, Vector3 } from "three";

export enum CameraState {
    RotateAroundWraiths,
    ManualOverride,
    UnderBattleCruiser,
    UnderWraiths
}

const evolvingCameraStates = [CameraState.UnderBattleCruiser, CameraState.UnderWraiths];
let _evolvingCameraState = -1;
let _prevPosition = new Vector3();

export const CAMERA_ROTATE_SPEED = 10000;
let _cameraRotateSpeed = CAMERA_ROTATE_SPEED / 4;
let _destCameraSpeed = CAMERA_ROTATE_SPEED;

export const createCamera = () => {
    let _polarAngleRange = 0;
    let _minPolarAngle = 0;
    let _polarAngle = 0;

    const camera = new PerspectiveCamera(110, 1, 0.1, 100000);
    const janitor = new Janitor;

    return {
        cameraState: CameraState.RotateAroundWraiths,
        get() {
            return camera;
        },
        init(controls: CameraControls, battleCruiser: Object3D) {
            _minPolarAngle = _polarAngle = controls.polarAngle;
            _polarAngleRange = (Math.PI / 2 - _minPolarAngle) * 2;


            janitor.setInterval(() => {
                if (this.cameraState === CameraState.RotateAroundWraiths) {
                    controls.zoomTo(Math.random() * 2 + 1.75);
                }
            }, 20000);

            janitor.setInterval(() => {
                _evolvingCameraState = (++_evolvingCameraState) % evolvingCameraStates.length;
                this.cameraState = evolvingCameraStates[_evolvingCameraState];
                console.log(this.cameraState)
                _prevPosition.copy(camera.position);
                if (this.cameraState === CameraState.UnderBattleCruiser) {
                    controls.setLookAt(-100, -1120, -1040, battleCruiser.position.x, battleCruiser.position.y, battleCruiser.position.z, false);
                    controls.zoomTo(2);
                } else if (this.cameraState === CameraState.UnderWraiths) {
                    _prevPosition.copy(camera.position);
                    controls.setTarget(0, 0, 0);
                    controls.zoomTo(2);
                    controls.setLookAt(-4, -23, -36, 0, 0, 0, false);
                }
                setTimeout(() => {
                    this.cameraState = CameraState.RotateAroundWraiths;
                    controls.setTarget(0, 0, 0);
                    controls.zoomTo(2);
                    controls.setLookAt(_prevPosition.x, _prevPosition.y, _prevPosition.z, 0, 0, 0);
                }, 10000);
            }, 90000);


            return janitor;
        },
        update(delta: number, controls: CameraControls, normalizedAzimuthAngle: number, mouse: Vector3) {

            if (
                normalizedAzimuthAngle > (Math.PI * 4) / 3 &&
                normalizedAzimuthAngle < Math.PI * 2
            ) {
                _destCameraSpeed = CAMERA_ROTATE_SPEED / 4;
            } else {
                _destCameraSpeed = CAMERA_ROTATE_SPEED;

            }
            _destCameraSpeed * Math.sign(mouse.x)

            _polarAngle = MathUtils.damp(
                _polarAngle,
                _minPolarAngle + Math.sin(delta / 1000) * _polarAngleRange * Math.sign(mouse.y),
                0.001,
                delta
            );

            _cameraRotateSpeed = MathUtils.damp(
                _cameraRotateSpeed,
                _destCameraSpeed,
                0.0001,
                delta
            );

            if (this.cameraState === CameraState.RotateAroundWraiths) {

                controls.rotate(Math.PI / _cameraRotateSpeed, 0);
                controls.rotatePolarTo(_polarAngle);
            }
        }
    }
}