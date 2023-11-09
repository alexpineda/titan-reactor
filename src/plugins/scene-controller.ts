import { GameTimeApi } from "@core/world/game-time-api";
import { renderComposer } from "@render/render-composer";
import {  NativePlugin } from "common/types";
import { Quaternion, Vector2, Vector3, Vector4 } from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { PluginBase } from "./plugin-base";

/**
 * @public
 */
export interface SceneController
    extends Omit<NativePlugin, "config">,
        GameTimeApi {
    /**
     * Updates every frame with the current mouse data.
     *
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param scrollY - Mouse wheel scroll delta
     * @param screenDrag - Screen scroll delta
     * @param lookAt - pointerLock delta
     * @param mouse - x,y mouse position in NDC + z = button state
     * @param clientX mouse clientX value
     * @param clientY mouse clientY value
     * @param clicked - x,y mouse position in NDC + z = button state
     */
    onCameraMouseUpdate?(
        delta: number,
        elapsed: number,
        scrollY: number,
        screenDrag: Vector2,
        lookAt: Vector2,
        mouse: Vector3,
        clientX: number,
        clientY: number,
        clicked: Vector3 | undefined,
        modifiers: Vector3
    ): void;

    /**
     * Updates every frame with the current keyboard data.
     *
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param truck - x,y movement deltas
     */
    onCameraKeyboardUpdate?( delta: number, elapsed: number, truck: Vector2 ): void;

    /**
     * An optional override for the position of the audio listener.
     *
     * @param target - Vector3 of the current camera target
     * @param position - Vector 3 of the current camera position
     */
    onUpdateAudioMixerLocation( target: Vector3, position: Vector3 ): Vector3;

    /**
     * Updates when the minimap is clicked and dragged.
     *
     * @param pos - Vector3 of the map coordinates.
     * @param isDragStart - Did the user just start dragging
     * @param mouseButton - The button the user is using.
     */
    onMinimapDragUpdate?(
        pos: Vector2,
        isDragStart: boolean,
        mouseButton?: number
    ): void;
}

const _va = new Vector3(),
    _vb = new Vector3(),
    _qa = new Quaternion();

/**
 * @public
 */
export class SceneController extends PluginBase implements NativePlugin, SceneController {
    override isSceneController = true;
    isWebXR = false;
    viewportsCount = 1;

    override onEnterScene( prevData: unknown ) {
        return Promise.resolve( prevData );
    }

    //TODO: change to globalThis
    onUpdateAudioMixerLocation( target: Vector3, position: Vector3 ) {
        return position.lerp(
            target,
            this.settings.session.audioListenerDistance() as number
        );
    }

    onUpdateAudioMixerOrientation() {
        this.viewport.camera.matrixWorld.decompose( _va, _qa, _vb );
        return _qa;
    }
}

const _v3 = new Vector3(), _v4 = new Vector4();

export class VRSceneController extends SceneController implements NativePlugin, SceneController {
    override isSceneController = true;
    override isWebXR = true;
    override viewportsCount = 1;

    get xr(){
        return renderComposer.glRenderer.xr;
    }
    baseReferenceSpace = this.xr.getReferenceSpace()!;
    controllerModelFactory = new XRControllerModelFactory()
    controller1 = this.xr.getController( 0 );
    controller2 = this.xr.getController( 1 );
    lastWorldPosition = new Vector3();

    constructor( ...args: ConstructorParameters<typeof SceneController>) {
        super(...args);
        this.getPoseWorldPosition();
    }

    override onEnterScene( prevData: unknown ) {
        return Promise.resolve( prevData );
    }

    moveLocal( targetPosition: Vector3 ) {
        _v4.set( targetPosition.x, targetPosition.y, targetPosition.z, 1 );
        const offsetRotation = new Quaternion();
        const transform = new XRRigidTransform( _v4, offsetRotation );
        const teleportSpaceOffset = this.baseReferenceSpace.getOffsetReferenceSpace( transform );
        this.xr.setReferenceSpace( teleportSpaceOffset );
    }

    moveWorld( targetPosition: Vector3 ) {
        const currentPosition = this.lastWorldPosition;
        _v3.copy( targetPosition ).sub( currentPosition );
        _v4.set( _v3.x, _v3.y, _v3.z, 1 );
    
        const offsetRotation = new Quaternion();
        const transform = new XRRigidTransform( _v4, offsetRotation );
    
        const newReferenceSpace = this.baseReferenceSpace.getOffsetReferenceSpace(transform);
    
        this.xr.setReferenceSpace(newReferenceSpace);
    }


    getPoseWorldPosition() {
        const pose = this.xr.getFrame().getViewerPose( this.baseReferenceSpace );
        if (pose) {
            this.lastWorldPosition.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            return this.lastWorldPosition;
        }
        return this.lastWorldPosition;
    }

    //TODO: change to globalThis
    override onUpdateAudioMixerLocation( ) {
        return this.getPoseWorldPosition();
    }

    override onUpdateAudioMixerOrientation() {
        this.viewport.camera.matrixWorld.decompose( _va, _qa, _vb );
        return _qa;
    }

}