import { Line3, Plane, Vector3 } from "three";

const _points = [
  [-1, -1],
  [1, 1],
];

const _plane = new Plane(new Vector3(0, 1, 0));
const _vector = new Vector3();

export default class ProjectedCameraView {
  constructor(camera) {
    this.camera = camera;
    this._lastFrame = null;
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

    const view = {
      left: _intersect[0].x,
      top: _intersect[1].z,
      right: _intersect[1].x,
      bottom: _intersect[0].z,
      width: _intersect[1].x - _intersect[0].x,
      height: _intersect[0].z - _intersect[1].z,
    };

    view.viewBW = {
      left: (view.left + this.mapWidth / 2) * 32,
      top: (view.top + this.mapHeight / 2) * 32,
      right: (view.right + this.mapWidth / 2) * 32,
      bottom: (view.bottom + this.mapHeight / 2) * 32,
    };

    this.view = view;
  }
}
