import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import gameStore from "@stores/game-store";
import { isGltfAtlas } from "@utils/image-utils";
import Janitor from "@utils/janitor";
import { UnitTileScale } from "common/types";

enum UpgradeHDImageStatus {
    Loading,
    Loaded,
}

//      non-instanced   instanced         skinned       skinned-instance
// 2d   ImageHD         ImageHD
// 3d   Image3D

const upgradeHDImageQueue = new Map<number, UpgradeHDImageStatus>();

const retrieveAtlas = (imageTypeId: number) => {
    const assets = gameStore().assets!;
    const atlas = assets.grps[imageTypeId];
    if (!atlas) {
        assets.loadImageAtlas(imageTypeId, UnitTileScale.HD2);
        upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loading);
        requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
            upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
        }));
        return null;
    } else {
        if (atlas.unitTileScale === UnitTileScale.HD2 && !upgradeHDImageQueue.has(imageTypeId)) {
            requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
                upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
            }));
        }
    }
    return atlas;
}


export class ImagePool {
    // always 2d
    #images: Map<number, ImageBase> = new Map();

    // always 3d
    // static meshes
    // #instances = new IterableMap<number, InstancedMesh>();
    // animated meshes
    // #skinnedInstances = new IterableMap<number, SkinnedMesh>();
    use3dAssets = true;

    #janitor = new Janitor;

    #spawn(imageTypeId: number) {
        const assets = gameStore().assets!;
        const atlas = retrieveAtlas(imageTypeId);
        if (!atlas) return;

        const imageDef = assets.bwDat.images[imageTypeId];

        if (isGltfAtlas(atlas)) {
            return new Image3D(atlas, imageDef);
        } else {
            return new ImageHD(
                atlas,
            );
        }
    }

    recall(imageIndex: number) {
        return this.#images.get(imageIndex);
    }

    summon(imageIndex: number, imageTypeId: number) {
        let image = this.#images.get(imageIndex);
        if (!image) {
            image = this.#spawn(imageTypeId);
            if (!image) {
                return
            }
            this.#images.set(imageIndex, image);
        }
        return image;
    }

    free(imageIndex: number) {
        const image = this.#images.get(imageIndex);
        if (image) {
            image.removeFromParent();
            this.#images.delete(imageIndex);
        }
    }

    clear() {
        this.#images.clear();
    }

    dispose() {
        this.#janitor.dispose();
    }
}