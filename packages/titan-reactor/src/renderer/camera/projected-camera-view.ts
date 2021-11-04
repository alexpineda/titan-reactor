import { Camera, Line3, Plane, Vector3 } from "three";

const _points = [
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
];

const _plane = new Plane(new Vector3(0, 1, 0));
const _vector = new Vector3();

/**
 * World position for the four corners of our view
 */
export default class ProjectedCameraView {
  readonly camera: Camera;
  readonly mapWidth: number;
  readonly mapHeight: number;
  private _lastFrame: number | null = null;

  left = 0;
  top = 0;
  right = 0;
  bottom = 0;
  width = 0;
  height = 0;

  bl: [number, number] = [0, 0];
  tr: [number, number] = [0, 0];
  br: [number, number] = [0, 0];
  tl: [number, number] = [0, 0];

  viewBW: { left: number; top: number; right: number; bottom: number } = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };

  constructor(camera: Camera, mapWidth: number, mapHeight: number) {
    this.camera = camera;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  update() {
    const _intersect = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ];

    for (let i = 0; i < 4; i++) {
      _vector.set(_points[i][0], _points[i][1], 1).unproject(this.camera);
      if (
        !_plane.intersectLine(
          new Line3(this.camera.position, _vector),
          _intersect[i]
        )
      ) {
        _intersect[0] = new Vector3(
          this.camera.position.x - 16,
          0,
          this.camera.position.z + 16
        );
        _intersect[1] = new Vector3(
          this.camera.position.x + 16,
          0,
          this.camera.position.z - 16
        );
        break;
      }
    }

    this.bl = [_intersect[0].x, _intersect[0].z];
    this.tr = [_intersect[1].x, _intersect[1].z];
    this.br = [_intersect[2].x, _intersect[2].z];
    this.tl = [_intersect[3].x, _intersect[3].z];

    this.left = _intersect[0].x;
    this.top = _intersect[1].z;
    this.right = _intersect[1].x;
    this.bottom = _intersect[0].z;
    this.width = _intersect[1].x - _intersect[0].x;
    this.height = _intersect[0].z - _intersect[1].z;

    this.viewBW.left = (this.left + this.mapWidth / 2) * 32;
    this.viewBW.top = (this.top + this.mapHeight / 2) * 32;
    this.viewBW.right = (this.right + this.mapWidth / 2) * 32;
    this.viewBW.bottom = (this.bottom + this.mapHeight / 2) * 32;
  }
}
