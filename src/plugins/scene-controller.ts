import { GameTimeApi } from "@core/world/game-time-api";
import { NativePlugin } from "common/types";
import {
    Group,
    Quaternion,
    Vector2,
    Vector3,
} from "three";
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
    onExitScene?(currentData: PrevSceneData): PrevSceneData | void;

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


