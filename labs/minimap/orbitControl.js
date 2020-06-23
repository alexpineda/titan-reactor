import { Vector3, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const initOrbitControls = (camera, element) => {
  const orbitControl = new OrbitControls(camera, element);
  orbitControl.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  orbitControl.panSpeed = 2;
  orbitControl.rotateSpeed = 0.4;
  orbitControl.maxDistance = 120;
  orbitControl.minDistance = 20;
  orbitControl.enableDamping = true;
  orbitControl.dampingFactor = 0.2;
  orbitControl.keyPanSpeed = 50;
  orbitControl.zoomSpeed = 1;

  orbitControl.maxPolarAngle = Math.PI / 3;
  // option to disable for 360 view
  orbitControl.maxAzimuthAngle = Math.PI / 4;
  orbitControl.minAzimuthAngle = -Math.PI / 4;
  return orbitControl;
};
