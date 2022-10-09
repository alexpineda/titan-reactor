import { ImageBase } from "@core/image-base";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
// import { ImageHDInstanced } from "@core/image-hd-instanced";
import { Unit } from "@core/unit";
import gameStore from "@stores/game-store";
import { isGltfAtlas } from "@utils/image-utils";
import { IndexedObjectPool } from "@utils/indexed-object-pool";
import { IterableMap } from "@utils/iteratible-map";
import { Janitor } from "three-janitor";
import { AnimAtlas } from "common/types";

export class ImageEntities {
    #freeImages = new IndexedObjectPool<ImageBase>();
    #freeImages3D = new IndexedObjectPool<ImageBase>();
    #units: Map<ImageBase, Unit> = new Map()
    #images: IterableMap<number, ImageBase> = new IterableMap();

    use3dImages = true;
    #janitor = new Janitor("ImageEntities", true);

    onCreateImage?: (image: ImageBase) => void;
    onFreeImage?: (image: ImageBase) => void;

    constructor() {
        this.#janitor.mop(() => this.#janitor.dispose(this.#freeImages.all()), "freeImages");
        this.#janitor.mop(() => this.#janitor.dispose(this.#freeImages3D.all()), "freeImages3D");
        this.#janitor.mop(this.#images, "images");
        this.#janitor.mop(() => {
            this.clear();
        }, "clear");
    }

    #create(imageTypeId: number, atlas: AnimAtlas) {

        if (isGltfAtlas(atlas) && this.use3dImages) {
            const freeImage = this.#freeImages3D.get(imageTypeId);
            if (freeImage) {
                return freeImage;
            }
            return new Image3D(atlas);
        } else {
            const freeImage = this.#freeImages.get(imageTypeId);
            if (freeImage) {
                return freeImage;
            }

            return (new ImageHD());
        }
    }

    [Symbol.iterator]() {
        return this.#images[Symbol.iterator]();
    }

    get(imageIndex: number) {
        return this.#images.get(imageIndex);
    }

    getOrCreate(imageIndex: number, imageTypeId: number) {
        const assets = gameStore().assets!;
        const atlas = assets.loadImageAtlas(imageTypeId);

        // atlas hasn't loaded yet
        if (!atlas) {
            return;
        }

        let image = this.#images.get(imageIndex);
        if (!image || (image.isImage3d !== this.use3dImages && isGltfAtlas(atlas))) {
            if (image) {
                this.#free(image);
            }
            image = this.#create(imageTypeId, atlas);
            this.onCreateImage?.(image);
            this.#images.set(imageIndex, image);

            image.updateImageType(gameStore().assets!.atlases[imageTypeId], true);

        } else {

            image.updateImageType(gameStore().assets!.atlases[imageTypeId]);

        }

        image.userData.imageIndex = imageIndex;

        return image;

    }

    free(imageIndex: number) {

        const image = this.#images.get(imageIndex);

        if (image) {
            this.#images.delete(imageIndex);
            this.#free(image);
        }

    }

    #free(image: ImageBase) {

        image.removeFromParent();
        this.#units.delete(image);

        if (image.isImage3d) {
            this.#freeImages3D.add(image.dat.index, image);
        } else {
            this.#freeImages.add(image.dat.index, image);
        }

        this.onFreeImage?.(image);

    }

    clear() {

        for (const image of this.#images) {

            this.#free(image);

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