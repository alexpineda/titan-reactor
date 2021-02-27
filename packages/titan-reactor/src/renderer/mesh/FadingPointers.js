import { Mesh, ConeGeometry, Group, MeshBasicMaterial, Color } from "three";
import { easeElasticOut, easeExpOut } from "d3-ease";
import { framesBySeconds } from "titan-reactor-shared/utils/conversions";

//@todo refactor with pooling + ClockMs()
class FadingPointers extends Group {
  constructor() {
    super();
    this.lifespan = framesBySeconds(7);
    this.maxOpacity = 0.8;
    this.bounceEnd = framesBySeconds(2);
    this.bounceEndT = this.bounceEnd / this.lifespan;
    this.dropHeight = 3;
  }

  addPointer(x, y, z, color, time, meta) {
    const geo = new ConeGeometry(0.5, 1, 5);
    geo.rotateX(Math.PI);
    geo.translate(0, 0, 0);
    const mat = new MeshBasicMaterial({
      color: new Color(color),
    });
    mat.transparent = true;
    mat.opacity = this.maxOpacity;
    const mesh = new Mesh(geo, mat);

    mesh.position.x = x;
    mesh.position.z = z;
    mesh.position.y = y + this.dropHeight;
    mesh.name = "FadingPointer";

    mesh.userData = {
      time,
      destY: y,
      ...meta,
    };
    this.add(mesh);
  }

  update(time) {
    this.children
      .filter((c) => c.name == "FadingPointer" && c.visible)
      .forEach((o) => {
        const lifetime = time - o.userData.time;

        try {
          if (lifetime < this.bounceEnd) {
            o.position.y =
              o.userData.destY +
              (1 - easeElasticOut(lifetime / this.bounceEnd)) *
                this.dropHeight +
              0.5;
          } else {
            const opacity = easeExpOut(
              1 - lifetime / (this.lifespan - this.bounceEnd)
            );
            o.material.opacity = opacity * this.maxOpacity;
          }
        } catch (e) {}
        if (lifetime > this.lifespan) {
          this.remove(o);
        }
      });
  }
}
export default FadingPointers;
