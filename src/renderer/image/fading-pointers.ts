import { Mesh, ConeGeometry, Group, MeshBasicMaterial, Color } from "three";
import { easeElasticOut, easeExpOut } from "d3-ease";
import { framesBySeconds } from "common/utils/conversions";

class FadingPointers extends Group {
    #lifespan: number;
    #maxOpacity: number;
    #bounceEnd: number;
    #dropHeight: number;

    constructor() {
        super();
        this.#lifespan = framesBySeconds(7);
        this.#maxOpacity = 0.8;
        this.#bounceEnd = framesBySeconds(2);
        // this.#bounceEndT = this.#bounceEnd / this.#lifespan;
        this.#dropHeight = 3;
    }

    addPointer(x: number, y: number, z: number, color: Color, time: number, meta: any) {
        const geo = new ConeGeometry(0.5, 1, 5);
        geo.rotateX(Math.PI);
        geo.translate(0, 0, 0);
        const mat = new MeshBasicMaterial({
            color: new Color(color),
        });
        mat.transparent = true;
        mat.opacity = this.#maxOpacity;
        const mesh = new Mesh(geo, mat);

        mesh.position.x = x;
        mesh.position.z = z;
        mesh.position.y = y + this.#dropHeight;
        mesh.name = "FadingPointer";

        mesh.userData = {
            time,
            destY: y,
            ...meta,
        };
        this.add(mesh);
        return mesh;
    }

    update(elapsed: number) {
        this.children
            .filter((c) => c.visible && c instanceof Mesh)
            .forEach((o) => {
                const lifetime = elapsed - o.userData.time;

                try {
                    if (lifetime < this.#bounceEnd) {
                        o.position.y =
                            o.userData.destY +
                            (1 - easeElasticOut(lifetime / this.#bounceEnd)) *
                            this.#dropHeight +
                            0.5;
                    } else {
                        const opacity = easeExpOut(
                            1 - lifetime / (this.#lifespan - this.#bounceEnd)
                        );
                        const m = (o as Mesh).material as MeshBasicMaterial;
                        if (m) {
                            if (m.opacity) {
                                m.opacity = opacity * this.#maxOpacity;
                            }
                        }
                    }
                } catch (e) { }
                if (lifetime > this.#lifespan) {
                    this.remove(o);
                }
            });
    }
}
export default FadingPointers;
