import { Vector3, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//zoom in tighter allowed as teh angle is closer to 90deg above
// rotating angle will then zoom out if outside the limit

export const initOrbitControls = (camera, element, limitControl = true) => {
  const orbitControl = new OrbitControls(camera, element);
  orbitControl.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  if (limitControl) {
    orbitControl.panSpeed = 2;
    orbitControl.rotateSpeed = 0.4;
    orbitControl.maxDistance = 80;
    orbitControl.minDistance = 15;
    orbitControl.enableDamping = true;
    orbitControl.dampingFactor = 0.2;
    orbitControl.keyPanSpeed = 50;
    orbitControl.zoomSpeed = 1;

    orbitControl.maxPolarAngle = Math.PI / 3;
    // option to disable for 360 view
    orbitControl.maxAzimuthAngle = Math.PI / 5;
    orbitControl.minAzimuthAngle = -Math.PI / 5;
    // camera.position.clampLength(5, 60);
  }
  return orbitControl;
};
