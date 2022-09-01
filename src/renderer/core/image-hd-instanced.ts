import { drawFunctions } from "common/enums";
import { AnimAtlas } from "common/types";
import { Color, DynamicDrawUsage, InstancedBufferAttribute, Matrix4 } from "three";
import { calculateFrame, ImageHD } from "./image-hd";
import { ImageHDInstancedMaterial } from "./image-hd-instanced-material";

const white = new Color(0xffffff);

const _instanceMatrix = new Matrix4;
const _instanceMatrixWorld = new Matrix4;

export class ImageHDInstanced extends ImageHD {
    readonly max: number;
    count: number;
    override isInstanced = true;
    isInstancedMesh = true;
    instanceMatrix: InstancedBufferAttribute;
    instanceColor = null;

    aTeamColor: InstancedBufferAttribute;
    aModifierType: InstancedBufferAttribute;
    aModifierData: InstancedBufferAttribute;
    aFrame: InstancedBufferAttribute;

    // posX, posY, U, V x 4 vertices
    aUvPos: InstancedBufferAttribute;

    imageIdToIndex: Map<number, number> = new Map();
    offset = 0;

    constructor(atlas: AnimAtlas, count: number) {
        super(atlas);
        this.frustumCulled = false;
        this.count = count;
        this.max = count;
        this.instanceMatrix = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
        this.instanceMatrix.setUsage(DynamicDrawUsage);
        // TODO: change to palette index
        this.aTeamColor = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
        this.aTeamColor.setUsage(DynamicDrawUsage);

        this.aModifierData = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
        this.aModifierData.setUsage(DynamicDrawUsage);

        this.aModifierType = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
        this.aModifierType.setUsage(DynamicDrawUsage);

        this.aFrame = new InstancedBufferAttribute(new Float32Array(count * 2), 2);

        this.aUvPos = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
        this.aUvPos.setUsage(DynamicDrawUsage);

        this.geometry.setAttribute("aTeamColor", this.aTeamColor);
        this.geometry.setAttribute("aModifierData", this.aModifierData);
        this.geometry.setAttribute("aModifierType", this.aModifierType);
        this.geometry.setAttribute("aUvPos", this.aUvPos);
        this.geometry.setAttribute("instanceMatrix", this.instanceMatrix);

    }

    override createMaterial() {
        return new ImageHDInstancedMaterial();
    }

    override setTeamColor(val: Color | undefined = white) {
        this.aTeamColor.setXYZ(this.offset, val.r, val.g, val.b);
        this.aTeamColor.needsUpdate = true;
    }

    override setModifiers(modifier: number, modifierData1: number, modifierData2: number) {
        this.aModifierData.setXY(this.offset, modifierData1, modifierData2);
        this.aModifierData.needsUpdate = true;

        this.aModifierType.setXYZ(this.offset, modifier === drawFunctions.warpFlash ? 1 : 0, modifier === drawFunctions.warpFlash2 ? 1 : 0, modifier === drawFunctions.hallucination ? 1 : 0);
        this.material.modifier = modifier;
        this.setOpacityFromModifiers(modifier, modifierData1);
    }

    override setOpacity(opacity: number) {
        this.aModifierData.setZ(this.offset, opacity);
        this.aModifierData.needsUpdate = true;
    }

    //TODO: move to gpu texture lookup
    override setFrame(frame: number, flip: boolean) {
        this.frame = frame;
        this.flip = flip;
        calculateFrame(this.atlas.frames[frame], flip, this.atlas.textureWidth, this.atlas.textureHeight, this.spriteWidth, this.spriteHeight, this.material.depthTest, this, this);
    }

    override get frame() {
        return this.aFrame.getX(this.offset);
    }

    override set frame(val: number) {
        this.aFrame.setX(this.offset, val);
        this.aFrame.needsUpdate = true;
    }

    override get flip() {
        return !!this.aFrame.getY(this.offset);
    }

    override set flip(val: boolean) {
        this.aFrame.setY(this.offset, val ? 1 : 0);
        this.aFrame.needsUpdate = true;
    }

    //pos
    setX(attrIndex: number, x: number) {
        this.aUvPos.setX(this.offset * 16 + attrIndex * 4, x);
        this.aUvPos.needsUpdate = true;
    }

    setY(attrIndex: number, y: number) {
        this.aUvPos.setX(this.offset * 16 + attrIndex * 4 + 1, y);
        this.aUvPos.needsUpdate = true;
    }

    //uv
    setXY(attrIndex: number, x: number, y: number) {
        this.aUvPos.setXY(this.offset * 16 + attrIndex * 4 + 2, x, y);
        this.aUvPos.needsUpdate = true;
    }

    getMatrixAt(index: number, matrix: Matrix4) {

        matrix.fromArray(this.instanceMatrix.array, index * 16);

    }

    // override update() {
    //     if (this.visible) {
    //         this.updateMatrixWorld();
    //     }
    // }

    override updateMatrix() {

    }

    updateInstanceMatrix(parentMatrix: Matrix4) {
        // this.#instanceMatrix.elements[12] = this.position.x;
        // this.#instanceMatrix.elements[13] = this.position.y;
        // this.#instanceMatrix.elements[14] = this.position.z;
        _instanceMatrix.compose(this.position, this.quaternion, this.scale);
        _instanceMatrixWorld.multiplyMatrices(parentMatrix, _instanceMatrix);
        _instanceMatrixWorld.toArray(this.instanceMatrix.array, this.offset * 16);
        this.instanceMatrix.needsUpdate = true;
        this.matrixWorldNeedsUpdate = false;
    }

    // will only need this on scaling differences for viewports
    override updateMatrixWorld() {
    }

    dispose() {

        this.dispatchEvent({ type: 'dispose' });

    }
}