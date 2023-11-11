import { GameTimeApi } from "@core/world/game-time-api";
import { NativePlugin } from "common/types";
import {
    Group,
    Quaternion,
    Vector2,
    Vector3,
    Vector4,
    WebXRManager,
    XRTargetRaySpace,
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { PluginBase } from "./plugin-base";

/**
 * @public
 */
export type PrevSceneData = {
    position: Vector3;
    target: Vector3;
    data?: any;
};

/**
 * @public
 */
export interface SceneController extends Omit<NativePlugin, "config">, GameTimeApi {
    /**
     * When a scene is entered and nearly initialized.
     */
    onEnterScene(prevData: PrevSceneData): Promise<void> | void;

    /**
     * When a scene has exited. Dispose resources here.
     */
    onExitScene?(currentData: PrevSceneData): PrevSceneData;

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
    onCameraKeyboardUpdate?(delta: number, elapsed: number, truck: Vector2): void;

    /**
     * An optional override for the position of the audio listener.
     *
     * @param target - Vector3 of the current camera target
     * @param position - Vector 3 of the current camera position
     */
    onUpdateAudioMixerLocation(target: Vector3, position: Vector3): Vector3;

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
export class SceneController
    extends PluginBase
    implements NativePlugin, SceneController
{
    override isSceneController = true;
    isWebXR = false;
    viewportsCount = 1;
    parent = new Group();

    //TODO: change to globalThis
    onUpdateAudioMixerLocation(target: Vector3, position: Vector3) {
        return position.lerp(
            target,
            this.settings.session.audioListenerDistance() as number
        );
    }

    onUpdateAudioMixerOrientation() {
        this.viewport.camera.matrixWorld.decompose(_va, _qa, _vb);
        return _qa;
    }
}

const _a = new Vector3();

/**
 * @public
 */
export class VRSceneController
    extends SceneController
    implements NativePlugin, SceneController
{
    override isSceneController = true;
    override isWebXR = true;
    override viewportsCount = 1;

    xr!: WebXRManager;
    baseReferenceSpace!: XRReferenceSpace;
    controllerModelFactory = new XRControllerModelFactory();
    controller1!: XRTargetRaySpace;
    controller2!: XRTargetRaySpace;
    input1?: XRInputSource;
    input2?: XRInputSource;
    lastWorldPosition = new Vector3();
    viewerPosition = new Group();

    constructor(...args: ConstructorParameters<typeof SceneController>) {
        super(...args);
    }

    setupXR(xr: WebXRManager) {
        this.xr = xr;
        this.baseReferenceSpace = this.xr.getReferenceSpace()!;
        this.controller1 = this.xr.getController(0);
        this.controller2 = this.xr.getController(1);

        this.controller1.addEventListener(
            "connected",
            ({ data }: { data: XRInputSource }) => {
                this.input1 = data;
                console.log("controller1 connected", data);
            }
        );
        this.controller1.addEventListener("disconnected", () => {
            this.input1 = undefined;
            this.parent.remove(this.controller1.children[0]);
            console.log("controller1 disconnected");
            
        });
        this.parent.add(this.controller1);

        // this.controller2.addEventListener("selectstart", onSelectStart);
        // this.controller2.addEventListener("selectend", onSelectEnd);
        this.controller2.addEventListener(
            "connected",
            ({ data }: { data: XRInputSource }) => {
                this.input2 = data;
                console.log("controller2 connected", data);
            }
        );
        this.controller2.addEventListener("disconnected", () => {
            this.input2 = undefined;
            this.parent.remove(this.controller1.children[0])
            console.log("controller2 disconnected");
        });
        this.parent.add(this.controller2);

        // this.getPoseWorldPosition();
    }

    override onTick(delta: number) {

        if (this.input1 && this.input1.gamepad) {
            // oculus joystick input
            // [0,0,horizon,vertical]
            //   -1
            // -1   1
            //    1
            const axes = this.input1!.gamepad!.axes;
            _a.set(0, axes[3], 0);
            this.moveLocal(_a);
  
        }

        if (this.input2 && this.input2.gamepad) {
            // oculus joystick input
            // [0,0,horizon,vertical]
            //   -1
            // -1   1
            //    1
            const axes = this.input2!.gamepad!.axes;
            _a.set(axes[2], 0, axes[3]);
            this.moveLocal(_a);
  
        }
          
    }

    moveLocal(targetPosition: Vector3) {
        // _v4.set( targetPosition.x, targetPosition.y, targetPosition.z, 1 );
        this.viewerPosition.position.add(targetPosition);
        // const offsetRotation = new Quaternion();
        // const transform = new XRRigidTransform( _v4, offsetRotation );
        // const teleportSpaceOffset = this.xr.getReferenceSpace()!.getOffsetReferenceSpace( transform );
        // this.xr.setReferenceSpace( teleportSpaceOffset );
    }

    moveWorld(targetPosition: Vector3) {
        // _v4.set( targetPosition.x, targetPosition.y, targetPosition.z, 1 );
        this.viewerPosition.position.copy(targetPosition);

        // const currentPosition = this.lastWorldPosition;
        // _v3.copy( targetPosition ).sub( currentPosition );
        // _v4.set( _v3.x, _v3.y, _v3.z, 1 );

        // const offsetRotation = new Quaternion();
        // const transform = new XRRigidTransform( _v4, offsetRotation );

        // const newReferenceSpace = this.xr.getReferenceSpace()!.getOffsetReferenceSpace(transform);

        // this.xr.setReferenceSpace(newReferenceSpace);
    }

    getPoseWorldPosition() {
        const pose = this.xr.getFrame()?.getViewerPose(this.baseReferenceSpace);
        if (pose) {
            this.lastWorldPosition.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
            );
            return this.lastWorldPosition;
        }
        return this.lastWorldPosition;
    }

    override onUpdateAudioMixerLocation() {
        return this.viewerPosition.position;
    }

    override onUpdateAudioMixerOrientation() {
        this.viewport.camera.matrixWorld.decompose(_va, _qa, _vb);
        return _qa;
    }
}
