import { Line3, Plane, Vector3 } from "three";

const _points = [
  [-1, -1],
  [1, 1],
];

const _plane = new Plane(new Vector3(0, 1, 0));
const _vector = new Vector3();

/**
 * World position for the four corners of our view
 */
export default class ProjectedCameraView {
  constructor(camera) {
    this.camera = camera;
    this._lastFrame = null;
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
    this.width = 0;
    this.height = 0;
    this.viewBW = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
  }

  update() {
    const _intersect = [new Vector3(), new Vector3()];

    for (let i = 0; i < 2; i++) {
      _vector.set(_points[i][0], _points[i][1], 1).unproject(this.camera);
      if (
        !_plane.intersectLine(
          new Line3(this.camera.position, _vector),
          _intersect[i]
        )
      ) {
        _intersect[0] = {
          x: this.camera.position.x - 16,
          z: this.camera.position.z + 16,
        };
        _intersect[1] = {
          x: this.camera.position.x + 16,
          z: this.camera.position.z - 16,
        };
        break;
      }
    }

    this.left = _intersect[0].x;
    this.top = _intersect[1].z;
    this.right = _intersect[1].x;
    this.bottom = _intersect[0].z;
    this.width = _intersect[1].x - _intersect[0].x;
    this.height = _intersect[0].z - _intersect[1].z;

    this.viewBW = {
      left: (this.left + this.mapWidth / 2) * 32,
      top: (this.top + this.mapHeight / 2) * 32,
      right: (this.right + this.mapWidth / 2) * 32,
      bottom: (this.bottom + this.mapHeight / 2) * 32,
    };
  }
}