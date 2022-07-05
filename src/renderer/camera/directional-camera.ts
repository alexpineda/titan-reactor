import { PerspectiveCamera } from "three";

/*
 * A THREE.PerspectiveCamera that also contains 32 directional values for openbw
 */
export default class DirectionalCamera extends PerspectiveCamera {
    override userData = {
        direction: 0,
        prevDirection: -1,
    }
}