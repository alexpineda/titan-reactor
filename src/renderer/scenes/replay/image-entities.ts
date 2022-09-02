import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import gameStore from "@stores/game-store";
import { isGltfAtlas } from "@utils/image-utils";
import { IndexedObjectPool } from "@utils/indexed-object-pool";
// import { IterableMap } from "@utils/iteratible-map";
import Janitor from "@utils/janitor";
import { UnitTileScale } from "common/types";
// import { InstancedMesh, SkinnedMesh } from "three";

enum UpgradeHDImageStatus {
    Loading,
    Loaded,
}

export class ImageEntities {
    #freeImages = new IndexedObjectPool<ImageBase>();

    // always 2d
    #images: Map<number, ImageBase> = new Map();
    #upgradeHDImageQueue = new Map<number, UpgradeHDImageStatus>();

    // always 3d
    // static meshes
    // #instances = new IterableMap<number, InstancedMesh>();
    // animated meshes
    // #skinnedInstances = new IterableMap<number, SkinnedMesh>();
    use3dAssets = true;

    #janitor = new Janitor;

    #create(imageTypeId: number) {
        const assets = gameStore().assets!;
        const atlas = assets.grps[imageTypeId];
        if (!atlas) {
            assets.loadImageAtlas(imageTypeId, UnitTileScale.HD2);
            this.#upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loading);
            requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
                this.#upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
            }));
            return;
        } else {
            if (atlas.unitTileScale === UnitTileScale.HD2 && !this.#upgradeHDImageQueue.has(imageTypeId)) {
                requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
                    this.#upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
                }));
            }
        }

        const imageDef = assets.bwDat.images[imageTypeId];

        const freeImage = this.#freeImages.get(imageTypeId);
        if (freeImage && freeImage instanceof ImageHD) {
            return freeImage;
        }
        if (isGltfAtlas(atlas)) {
            const freeImage = this.#freeImages.get(imageTypeId);
            if (freeImage && freeImage instanceof Image3D) {
                return freeImage;
            }
            return new Image3D(atlas);
            // if (atlas.model instanceof SkinnedMesh) {
            //     if (this.#skinnedInstances.has(imageTypeId)) {
            //         return this.#skinnedInstances.get(imageTypeId);
            //     } else {
            //         this.#skinnedInstances.set(imageTypeId, atlas.model);
            //         return atlas.model;
            //     }
            // } else if (atlas.model instanceof InstancedMesh) {
            //     if (this.#instances.has(imageTypeId)) {
            //         return this.#instances.get(imageTypeId);
            //     } else {
            //         this.#instances.set(imageTypeId, atlas.model);
            //         return atlas.model;
            //     }
            // }
        } else {
            const freeImage = this.#freeImages.get(imageTypeId);
            if (freeImage && freeImage instanceof ImageHD) {
                return freeImage;
            }

            if (imageDef.index === -1) {
                return (new ImageHDInstanced(atlas, 1)).updateImageType(atlas, true);
            }

            return (new ImageHD(atlas)).updateImageType(atlas, true);
        }
    }

    constructor() {
        for (const image of this.#freeImages.all()) {
            this.#janitor.add(image);
        }
    }

    get(imageIndex: number) {
        return this.#images.get(imageIndex);
    }

    getOrCreate(imageIndex: number, imageTypeId: number) {
        let image = this.#images.get(imageIndex);
        if (!image) {
            image = this.#create(imageTypeId);
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
            this.#freeImages.add(image.dat.index, image);
        }
    }

    clear() {
        this.#images.clear();
    }

    dispose() {
        this.#janitor.dispose();
    }
}