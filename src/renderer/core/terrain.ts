import { GetTerrainY, getTerrainY } from "@image/generate-map";
import { GeometryOptions, TerrainQuartile, WrappedQuartileTextures } from "common/types";
import { anisotropyOptions } from "@utils/renderer-utils";
import { Group, Mesh } from "three";

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
    #textures: WrappedQuartileTextures;

    constructor({ geomOptions, mapHeight, mapWidth, displacementImage, textures }: { geomOptions: GeometryOptions, mapWidth: number, mapHeight: number, displacementImage: ImageData, textures: WrappedQuartileTextures }) {
        super();

        this.geomOptions = geomOptions;
        this.getTerrainY = getTerrainY(
            displacementImage,
            geomOptions.maxTerrainHeight,
            mapWidth,
            mapHeight
        );
        this.#textures = textures;

    }

    set shadowsEnabled(val: boolean) {
        this.traverse(o => {
            if (o instanceof Mesh) {
                o.castShadow = val;
                o.receiveShadow = val;
            }
        });
    }

    setAnisotropy(anisotropy: string) {
        const value = anisotropyOptions[anisotropy as keyof typeof anisotropyOptions];

        for (const row of this.#textures.mapQuartiles) {
            for (const texture of row) {
                texture.anisotropy = value;
            }
        }
    }

}