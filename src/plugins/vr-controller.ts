

import { NativePlugin } from "common/types";
import {
    Group,
    Quaternion,
    Vector3,
    WebXRManager,
    XRTargetRaySpace,
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { SceneController } from "./scene-controller";

const _va = new Vector3(),
    _vb = new Vector3(),
    _qa = new Quaternion();
    
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
            }
        );
        this.controller1.addEventListener("disconnected", () => {
            this.input1 = undefined;
            this.parent.remove(this.controller1.children[0]);
            
        });
        this.parent.add(this.controller1);

        // this.controller2.addEventListener("selectstart", onSelectStart);
        // this.controller2.addEventListener("selectend", onSelectEnd);
        this.controller2.addEventListener(
            "connected",
            ({ data }: { data: XRInputSource }) => {
                this.input2 = data;
            }
        );
        this.controller2.addEventListener("disconnected", () => {
            this.input2 = undefined;
            this.parent.remove(this.controller1.children[0])
        });
        this.parent.add(this.controller2);

        // this.getPoseWorldPosition();
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
