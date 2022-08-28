import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import gameStore from "@stores/game-store";
import { isGltfAtlas } from "@utils/image-utils";
import { IndexedObjectPool } from "@utils/indexed-object-pool";
import Janitor from "@utils/janitor";
import { UnitTileScale } from "common/types";

enum UpgradeHDImageStatus {
    Loading,
    Loaded,
}

export class ImageEntities {
    #freeImages = new IndexedObjectPool<ImageBase>();
    #images: Map<number, ImageHD | Image3D> = new Map();
    #upgradeHDImageQueue = new Map<number, UpgradeHDImageStatus>();

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
            freeImage.changeImageType(atlas, imageDef);
            return freeImage;
        }
        if (isGltfAtlas(atlas)) {
            return new Image3D(atlas, imageDef)
        } else {
            return new ImageHD(
                atlas,
                imageDef
            );
        }
    }

    constructor() {
        for (const image of this.#freeImages.all()) {
            this.#janitor.add(image);
        }
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
        this.#janitor.mopUp();
    }
}