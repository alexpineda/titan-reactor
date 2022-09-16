import { FogOfWar } from "@core/fogofwar";
import { Unit } from "@core/unit";
import { unitTypes } from "common/enums";
import { Settings, UnitDAT } from "common/types";
import { floor32 } from "common/utils/conversions";
import { Color, Euler, Matrix4, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Quaternion, Shader, ShaderChunk, ShaderMaterial, Texture, Vector2, Vector3 } from "three";
import fragmentShader from "./minimap-frag.glsl";
import vertexShader from "./minimap-vert.glsl";

if (module.hot) {
    module.hot.accept("./minimap-frag.glsl");
    module.hot.accept("./minimap-vert.glsl");
}

// I like opacity 0.7, scale 10, position -4,7, rotation -0.03,0,0

//TODO:change to fit in to 1:1 box
export class MinimapMaterial extends ShaderMaterial {

    #resourceColor = new Color(0, 55, 55);
    #flashColor = new Color(200, 200, 200);
    #mapWidth: number;
    #mapHeight: number;
    #modelMatrix = new Matrix4();

    #scale = new Vector3(1, 1);
    #position = new Vector3(0, 0);
    #rotation = new Euler();

    camera: PerspectiveCamera | OrthographicCamera = new PerspectiveCamera(45, 1, 0.1, 100);

    applyViewMatrix(out: Matrix4, scale: Vector3, position: Vector3, rotation: Euler) {

        this.camera.position.set(0, 0, 1);
        this.camera.updateProjectionMatrix();
        out.compose(position, (new Quaternion()).setFromEuler(rotation), scale);
        out.multiplyMatrices(this.camera.projectionMatrixInverse, out);

    }

    updateMatrix() {

        this.applyViewMatrix(this.#modelMatrix, this.#scale, this.#position, this.#rotation);
        // this.camera.position.set(0, 0, 1);
        // this.camera.updateProjectionMatrix();
        // this.#modelMatrix.compose(this.#position, (new Quaternion()).setFromEuler(this.#rotation), this.#scale);
        // this.#modelMatrix.multiplyMatrices(this.camera.projectionMatrixInverse, this.#modelMatrix);

    }

    get rotation() {
        return this.#rotation;
    }

    get scale() {
        return this.#scale;
    }

    get position() {
        return this.#position;
    }

    override uniforms = {
        fogBitmap: { value: new Texture() },
        unitsBitmap: { value: new Texture() },
        resourcesBitmap: { value: new Texture() },
        creepBitmap: { value: new Texture() },
        terrainBitmap: { value: new Texture() },
        fogOfWarOpacity: { value: 0 },
        uMapResolution: { value: new Vector2() },
        uResolution: { value: new Vector2() },
        uOpacity: { value: 1 },
        uSoftEdges: { value: 0 },
        uMatrix: { value: this.#modelMatrix },
    }

    constructor(mapWidth: number, mapHeight: number, terrain: Texture) {

        super();

        window.mini = this;
        console.log(mapWidth, mapHeight);

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.#mapWidth = mapWidth;
        this.#mapHeight = mapHeight;

        this.uniforms.terrainBitmap.value = terrain;
        this.uniforms.unitsBitmap.value.image = new ImageData(mapWidth, mapHeight);
        this.uniforms.resourcesBitmap.value.image = new ImageData(mapWidth, mapHeight);
        this.uniforms.fogBitmap.value.image = new ImageData(mapWidth, mapHeight);
        this.uniforms.uMapResolution.value.set(mapWidth, mapHeight);

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;


    }

    set mode(val: Settings["minimap"]["mode"]) {
        if (val === "3d") {
            this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
        } else {
            this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        }
        this.camera.position.set(0, 0, 1);
    }

    update(fogOfWarBuffer: Uint8Array, creepImage: ImageData, fogOfWarOpacity: number) {

        for (let i = 0; i < this.#mapWidth * this.#mapHeight; i = i + 1) {
            this.uniforms.fogBitmap.value.image.data[i * 4 - 1] = Math.max(50, 255 - fogOfWarBuffer[i]);
        }

        this.uniforms.unitsBitmap.value.image.data.fill(0);
        this.uniforms.resourcesBitmap.value.image.data.fill(0);

        this.uniforms.fogOfWarOpacity.value = fogOfWarOpacity;
        this.uniforms.unitsBitmap.value.needsUpdate = true;
        this.uniforms.resourcesBitmap.value.needsUpdate = true;
        this.uniforms.fogBitmap.value.needsUpdate = true;
        this.uniforms.creepBitmap.value.image = creepImage;

    }

    buildUnitMinimap(unit: Unit, unitType: UnitDAT, fogOfWar: FogOfWar, getPlayerColor: (id: number) => Color) {

        const isResourceContainer = unitType.isResourceContainer && unit.owner === 11;

        if (
            (!isResourceContainer &&
                !fogOfWar.isVisible(floor32(unit.x), floor32(unit.y)))
        ) {
            return;
        }
        if (unitType.index === unitTypes.scannerSweep) {
            return;
        }

        let color;

        if (isResourceContainer) {
            color = this.#resourceColor;
        } else if (unit.owner < 8) {
            color = unit.extras.recievingDamage & 1 ? this.#flashColor : getPlayerColor(unit.owner);
        } else {
            return;
        }

        let w = Math.floor(unitType.placementWidth / 32);
        let h = Math.floor(unitType.placementHeight / 32);

        if (unitType.isBuilding) {
            if (w > 4) w = 4;
            if (h > 4) h = 4;
        }
        if (w < 2) w = 2;
        if (h < 2) h = 2;

        const unitX = Math.floor(unit.x / 32);
        const unitY = Math.floor(unit.y / 32);
        const wX = Math.floor(w / 2);
        const wY = Math.floor(w / 2);

        const _out = isResourceContainer ? this.uniforms.resourcesBitmap.value.image : this.uniforms.unitsBitmap.value.image;
        const alpha = isResourceContainer ? 150 : 255;

        for (let x = -wX; x < wX; x++) {

            for (let y = -wY; y < wY; y++) {

                if (unitY + y < 0) continue;
                if (unitX + x < 0) continue;
                if (unitX + x >= this.#mapWidth) continue;
                if (unitY + y >= this.#mapHeight) continue;

                const pos = ((unitY + y) * this.#mapWidth + unitX + x) * 4;

                _out.data[pos] = Math.floor(color.r * 255);
                _out.data[pos + 1] = Math.floor(color.g * 255);
                _out.data[pos + 2] = Math.floor(color.b * 255);
                _out.data[pos + 3] = alpha;

            }

        }
    }

}

export class IgnoreCameraBasicMaterial extends MeshBasicMaterial {

    override onBeforeCompile(shader: Shader): void {
        shader.fragmentShader = shader.fragmentShader.replace("#include <project_vertex>", "gl_Position = modelMatrix * vec4( transformed, 1.0 );");
    }

}