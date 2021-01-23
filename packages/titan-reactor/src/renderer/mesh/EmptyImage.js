import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

class EmptyImage {
  constructor() {}

  _load(image) {
    const colors = [
      0xf94144,
      0xf3722c,
      0xf8961e,
      0xf9c74f,
      0x90be6d,
      0x43aa8b,
      0x577590,
    ];
    var geometry = new SphereGeometry(1, 10);
    var material = new MeshBasicMaterial({
      color: colors[image % colors.length],
    });

    return new Mesh(geometry, material);
  }

  instance(runner, parent, image) {
    const mesh = this._load(image);
    mesh.position.x = runner.state.offset.x;
    mesh.position.y = runner.state.offset.y;
    parent.add(mesh);

    return {
      add: (child, p = mesh) => p.add(child),
      assign: () => {},
      update: () => {},
      remove: () => parent.remove(mesh),
    };
  }

  update(mesh, runner) {}
}

export default EmptyImage;
