import { DirectionalLight, Object3D, Color, Vector3 } from "three";

const createDirectional = (mapWidth: number, mapHeight: number) => {
    const light = new DirectionalLight(0xffffff, 2.5);
    light.position.set(-32, 13, -26);
    light.target = new Object3D();
    light.castShadow = true;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.shadow.normalBias = 0;
    light.shadow.radius = 2;

    const sizeW = mapWidth * 1.5;
    const sizeh = mapHeight * 1.5;

    light.shadow.camera.left = -sizeW;
    light.shadow.camera.right = sizeW;
    light.shadow.camera.top = sizeh;
    light.shadow.camera.bottom = -sizeh;
    light.shadow.mapSize.width = 512 * 8;
    light.shadow.mapSize.height = 512 * 8;
    light.shadow.autoUpdate = true;
    light.shadow.needsUpdate = true;
    light.layers.enableAll();

    return light;
}
export class Sunlight {
    #light: DirectionalLight;
    shadowIntensity = 1;
    #quality = 1;

    constructor(mapWidth: number, mapHeight: number) {
        this.#light = createDirectional(mapWidth, mapHeight);
    }

    get children() {
        return [this.#light, this.target];
    }

    set enabled(val: boolean) {
        this.#light.visible = val;
    }

    set intensity(value: number) {
        this.#light.intensity = value * this.shadowIntensity;
    }

    get target() {
        return this.#light.target;
    }

    setPosition(...args: Parameters<Vector3["set"]>) {
        this.#light.position.set(...args);
    }

    getPosition() {
        return this.#light.position.clone();
    }

    setColor(...args: Parameters<Color["set"]>) {
        this.#light.color.set(...args);
    }

    needsUpdate() {
        this.#light.shadow.needsUpdate = true;
        this.#light.updateMatrix();
        this.#light.updateMatrixWorld();
    }

    set shadowQuality(quality: number) {
        this.#light.castShadow = quality > 0;
        if (this.#light.castShadow === false) {
            return;
        }
        this.#quality = quality;
        this.#light.shadow.mapSize.width = 512 * quality;
        this.#light.shadow.mapSize.height = 512 * quality;
        this.#light.shadow.needsUpdate = true;
    }

    get shadowQuality() {
        return this.#quality;
    }

    dispose() {
        this.#light.dispose();
    }
}
