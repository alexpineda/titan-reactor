import { Terrain } from "@core/terrain";
import { TerrainQuartile } from "common/types";
import { Color, Group, Material, Mesh, MeshBasicMaterial } from "three";

export class BorderTiles extends Group {

    set color(value: number) {
        for (const child of this.children) {
            if (child instanceof Mesh) {
                const mat = child.material as MeshBasicMaterial;
                mat.color.set(value);
            }
        }
    }

    constructor(terrain: Terrain) {
        super();
        const tx = terrain.userData.tilesX;
        const ty = terrain.userData.tilesY;
        const qw = terrain.userData.quartileWidth;
        const qh = terrain.userData.quartileHeight;

        const createMesh = (q: TerrainQuartile, edgeMaterial: Material) => {
            const mesh = new Mesh();
            mesh.geometry = q.geometry;
            mesh.material = edgeMaterial;
            mesh.position.copy(q.position);
            return mesh;
        }

        for (let i = 0; i < terrain.children.length; i++) {
            const q = terrain.children[i];
            const qx = q.userData.qx;
            const qy = q.userData.qy;

            const edgeMaterial = new MeshBasicMaterial({
                map: q.material.map,
                color: new Color(0x999999)
            });

            if (qx === 0 && qy === 0) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y + qh);
                mesh.position.setX(mesh.position.x - qw);
                mesh.scale.setY(-1);
                mesh.scale.setX(-1);
                this.add(mesh);
            }

            if (qx === tx - 1 && qy === 0) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y + qh);
                mesh.position.setX(mesh.position.x + qw);
                mesh.scale.setY(-1);
                mesh.scale.setX(-1);
                this.add(mesh);
            }

            if (qx === tx - 1 && qy === ty - 1) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y - qh);
                mesh.position.setX(mesh.position.x + qw);
                mesh.scale.setY(-1);
                mesh.scale.setX(-1);
                this.add(mesh);
            }

            if (qx === 0 && qy === ty - 1) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y - qh);
                mesh.position.setX(mesh.position.x - qw);
                mesh.scale.setY(-1);
                mesh.scale.setX(-1);
                this.add(mesh);
            }

            if (qy === 0) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y + qh);
                mesh.scale.setY(-1);
                this.add(mesh);
            }
            if (qx === 0) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setX(mesh.position.x - qw);
                mesh.scale.setX(-1);
                this.add(mesh);
            }
            if (qy === ty - 1) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setY(mesh.position.y - qh);
                mesh.scale.setY(-1);
                this.add(mesh);
            }
            if (qx === tx - 1) {
                const mesh = createMesh(q, edgeMaterial);
                mesh.position.setX(mesh.position.x + qw);
                mesh.scale.setX(-1);
                this.add(mesh);
            }

        }
    }
}