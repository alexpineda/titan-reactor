import { GetTerrainY, getTerrainY } from "@image/generate-map";
import { GeometryOptions, TerrainQuartile } from "common/types";
import { anisotropyOptions } from "@utils/renderer-utils";
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

    constructor({ geomOptions, mapHeight, mapWidth, displacementImage }: { geomOptions: GeometryOptions, mapWidth: number, mapHeight: number, displacementImage: ImageData }) {
        super();

        this.geomOptions = geomOptions;
        this.getTerrainY = getTerrainY(
            displacementImage,
            geomOptions.maxTerrainHeight,
            mapWidth,
            mapHeight
        );
    }

    set shadowsEnabled(val: boolean) {
        this.traverse(o => {
            if (o instanceof Mesh) {
                o.castShadow = val;
                o.receiveShadow = val;
            }
        });
    }

    #applyToMaterial(fn: (mat: MeshStandardMaterial) => void) {
        for (const c of this.children) {
            if (c instanceof Mesh) {
                const material = c.material as MeshStandardMaterial;
                fn(material);
            }
        }

    }

    setAnisotropy(anisotropy: string) {
        const value = anisotropyOptions[anisotropy as keyof typeof anisotropyOptions];

        this.#applyToMaterial(mat => {
            mat.map!.anisotropy = value;
        });
    }

    setBumpScale(value: number | null) {
        this.#applyToMaterial(mat => {
            mat.bumpScale = value ?? this.geomOptions.bumpScale;
        });
    }

    setHighDetailStyle(value: boolean) {
        this.setBumpScale(value ? this.geomOptions.bumpScale : null);
        this.shadowsEnabled = value;

        // TODO: other things
    }

}