import CameraControls from "camera-controls";
import { MathUtils, PerspectiveCamera } from "three";

enum CameraState {
    RotateAroundWraiths,
    ManualOverride
}

export const CAMERA_ROTATE_SPEED = 10000;
let _cameraRotateSpeed = CAMERA_ROTATE_SPEED / 4;
let _destCameraSpeed = CAMERA_ROTATE_SPEED;

export const createCamera = () => {
    let cameraState = CameraState.RotateAroundWraiths;

    let _polarAngleRange = 0;
    let _minPolarAngle = 0;
    let _polarAngle = 0;

    const camera = new PerspectiveCamera(110, 1, 0.1, 100000);

    return {
        get() {
            return camera;
        },
        init(initPolarAngleRange: number) {
            _minPolarAngle = _polarAngle = initPolarAngleRange;
            _polarAngleRange = (Math.PI / 2 - _minPolarAngle) * 2;
        },
        update(delta: number, controls: CameraControls, normalizedAzimuthAngle: number) {

            if (
                normalizedAzimuthAngle > (Math.PI * 4) / 3 &&
                normalizedAzimuthAngle < Math.PI * 2
            ) {
                _destCameraSpeed = CAMERA_ROTATE_SPEED / 4;
            } else {
                _destCameraSpeed = CAMERA_ROTATE_SPEED;
            }

            // camera rotation
            if (cameraState === CameraState.RotateAroundWraiths) {
                _cameraRotateSpeed = MathUtils.damp(
                    _cameraRotateSpeed,
                    _destCameraSpeed,
                    0.00001,
                    delta
                );
                controls.rotate(Math.PI / _cameraRotateSpeed, 0);
                _polarAngle = MathUtils.damp(
                    _polarAngle,
                    _minPolarAngle + Math.sin(delta / 1000) * _polarAngleRange,
                    0.001,
                    delta
                );
                controls.rotatePolarTo(_polarAngle);
            }
        }
    }
}