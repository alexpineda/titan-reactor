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
  private _intersect = [
    new Vector3(),
    new Vector3(),
    new Vector3(),
    new Vector3(),
  ];

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

  constructor(camera: Camera) {
    this.camera = camera;
  }

  update() {

    for (let i = 0; i < 4; i++) {
      _vector.set(_points[i][0], _points[i][1], 1).unproject(this.camera);
      if (
        !_plane.intersectLine(
          new Line3(this.camera.position, _vector),
          this._intersect[i]
        )
      ) {
        this._intersect[0] = new Vector3(
          this.camera.position.x - 16,
          0,
          this.camera.position.z + 16
        );
        this._intersect[1] = new Vector3(
          this.camera.position.x + 16,
          0,
          this.camera.position.z - 16
        );
        break;
      }
    }

    this.bl[0] = this._intersect[0].x;
    this.bl[1] = this._intersect[0].z;

    this.tr[0] = this._intersect[1].x;
    this.tr[1] = this._intersect[1].z;

    this.br[0] = this._intersect[2].x;
    this.br[1] = this._intersect[2].z;

    this.tl[0] = this._intersect[3].x;
    this.tl[1] = this._intersect[3].z;

    this.left = this._intersect[0].x;
    this.top = this._intersect[1].z;
    this.right = this._intersect[1].x;
    this.bottom = this._intersect[0].z;
    this.width = this._intersect[1].x - this._intersect[0].x;
    this.height = this._intersect[0].z - this._intersect[1].z;

  }
}
