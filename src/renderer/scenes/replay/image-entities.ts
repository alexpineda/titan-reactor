import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { Unit } from "@core/unit";
import gameStore from "@stores/game-store";
import { isGltfAtlas } from "@utils/image-utils";
import { IndexedObjectPool } from "@utils/indexed-object-pool";
import { IterableMap } from "@utils/iteratible-map";
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
    #freeImages3D = new IndexedObjectPool<ImageBase>();
    #units: Map<ImageBase, Unit> = new Map()

    // always 2d
    #images: IterableMap<number, ImageBase> = new IterableMap();
    #upgradeHDImageQueue = new Map<number, UpgradeHDImageStatus>();

    // always 3d
    // static meshes
    // #instances = new IterableMap<number, InstancedMesh>();
    // animated meshes
    // #skinnedInstances = new IterableMap<number, SkinnedMesh>();
    use3dImages = true;

    #janitor = new Janitor;

    onCreateImage?: (image: ImageBase) => void;
    onFreeImage?: (image: ImageBase) => void;

    constructor() {
        this.#janitor.add(() => this.#janitor.dispose(this.#freeImages.all()));
        this.#janitor.add(() => this.#janitor.dispose(this.#freeImages3D.all()));
        this.#janitor.add(this.#images);
    }

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

        if (isGltfAtlas(atlas) && this.use3dImages) {
            const freeImage = this.#freeImages3D.get(imageTypeId);
            if (freeImage) {
                return freeImage;
            }
            return new Image3D(atlas);
        } else {
            const freeImage = this.#freeImages.get(imageTypeId);
            if (freeImage) {
                return freeImage.updateImageType(atlas, true);
            }

            if (imageDef.index === -1) {
                return (new ImageHDInstanced(atlas, 1)).updateImageType(atlas, true);
            }

            return (new ImageHD(atlas)).updateImageType(atlas, true);
        }
    }

    [Symbol.iterator]() {
        return this.#images[Symbol.iterator]();
    }

    get(imageIndex: number) {
        return this.#images.get(imageIndex);
    }

    getOrCreate(imageIndex: number, imageTypeId: number) {
        let image = this.#images.get(imageIndex);
        if (!image || (image.isImage3d !== this.use3dImages && isGltfAtlas(image.atlas))) {
            if (image) {
                this.free(imageIndex);
            }
            image = this.#create(imageTypeId);
            if (!image) {
                return
            }
            this.onCreateImage?.(image);
            this.#images.set(imageIndex, image);
        }
        image.userData.imageIndex = imageIndex;
        return image;
    }

    free(imageIndex: number) {
        const image = this.#images.get(imageIndex);
        if (image) {
            image.removeFromParent();
            this.#images.delete(imageIndex);
            if (image.isImage3d) {
                this.#freeImages3D.add(image.dat.index, image);
            } else {
                this.#freeImages.add(image.dat.index, image);
            }
            this.#units.delete(image);
            this.onFreeImage?.(image);
        }
    }

    clear() {
        for (const image of this.#images) {
            image.removeFromParent();
        }
        this.#images.clear();
    }

    dispose() {
        this.#janitor.dispose();
    }

    setUnit(image: ImageBase, unit: Unit) {
        this.#units.set(image, unit);
    }

    getUnit(image: ImageBase) {
        return this.#units.get(image);
    }
}