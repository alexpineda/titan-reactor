import { GetTerrainY } from "@image/generate-map/get-terrain-y";
import { GeometryOptions, TerrainQuartile } from "common/types";
import { Group, Mesh, MeshStandardMaterial } from "three";


export class Terrain extends Group {

    override children: TerrainQuartile[] = [];
    override userData: {
        quartileWidth: number,
        quartileHeight: number,
        tilesX: number,
        tilesY: number,
    } = {
            quartileWidth: 0,
            quartileHeight: 0,
            tilesX: 0,
            tilesY: 0,
        }
    readonly getTerrainY: GetTerrainY;
    readonly geomOptions: GeometryOptions;
    #setCreepAnisotropy: (anisotropy: number) => void;

    constructor(geomOptions: GeometryOptions, getTerrainY: GetTerrainY, setCreepAnisotropy: (anisotropy: number) => void) {

        super();

        this.geomOptions = geomOptions;
        this.getTerrainY = getTerrainY;
        this.#setCreepAnisotropy = setCreepAnisotropy;
        this.name = "terrain";

    }

    set shadowsEnabled(val: boolean) {

        this.#applyToQuartile(o => {
            o.castShadow = val;
            o.receiveShadow = val;
        });

    }

    #applyToQuartile(fn: (mat: TerrainQuartile) => void) {

        for (const c of this.children) {
            if (c instanceof Mesh) {
                fn(c);
            }
        }

    }

    #applyToStandardMaterial(fn: (mat: MeshStandardMaterial) => void) {

        for (const mesh of this.children) {
            if (mesh instanceof Mesh) {
                if (mesh.material instanceof MeshStandardMaterial) {
                    fn(mesh.material);
                }
            }
        }

    }

    #changeToStandardMaterial() {

        this.#applyToQuartile(mesh => {
            mesh.material = mesh.userData.standardMaterial;
        });

    }

    #changeToBasicMaterial() {

        this.#applyToQuartile(mesh => {
            mesh.material = mesh.userData.basicMaterial;
        });

    }

    #setAnisotropy(anisotropy: number) {

        this.#applyToQuartile(mesh => mesh.material.map!.anisotropy = anisotropy);
        this.#setCreepAnisotropy(anisotropy);

    }

    #setBumpScale(value: number) {

        this.#applyToStandardMaterial(material => material.bumpScale = value);

    }

    set envMapIntensity(intensity: number) {

        this.#applyToStandardMaterial(m => m.envMapIntensity = intensity);

    }

    setTerrainQuality(highDefinition: boolean, anisotropy: number) {

        this.shadowsEnabled = highDefinition;

        if (highDefinition) {
            this.#changeToStandardMaterial();
            this.#setBumpScale(0);
            this.#setAnisotropy(anisotropy);
        } else {
            this.#changeToBasicMaterial();
            this.#setAnisotropy(1);
        }

    }

}