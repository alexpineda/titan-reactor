import { Group, Vector3  } from "three";
import { GameViewPort } from "./game-viewport";

// import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
// import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory';

const _target = new Vector3();

/**
 * @public
 * A "view" into the game. Every viewport contains it's own camera, dimensions, and additional properties.
 */
export class WebXRGameViewPort extends GameViewPort {

    user = new Group();
    override name = "WebXRGameViewPort";

    constructor( ...args: ConstructorParameters<typeof GameViewPort>) {
        super(...args);
    }

    override update( targetDamping: number, delta: number ) {
        super.update( targetDamping, delta );

        this.projectedView.update(
            this.camera,
            this.orbit.getTarget( _target )
        );
    }

    override dispose(): void {
        super.dispose();
        this.user.removeFromParent();
    }

    // initXR(xr: WebXRManager) {
    //     const controller1 = xr.getController( 0 );
    //     scene.add( controller1 );

    //     const controller2 = xr.getController( 1 );
    //     scene.add( controller2 );

    //     const controllerModelFactory = new XRControllerModelFactory();
    //     const handModelFactory = new XRHandModelFactory();

    //     // Hand 1
    //     const  controllerGrip1 = xr.getControllerGrip( 0 );
    //     controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    //     scene.add( controllerGrip1 );

    //     const hand1 = xr.getHand( 0 );
    //     hand1.add( handModelFactory.createHandModel( hand1 ) );

    //     scene.add( hand1 );

    //     // Hand 2
    //     const  controllerGrip2 = xr.getControllerGrip( 1 );
    //     controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    //     scene.add( controllerGrip2 );

    //     const  hand2 = xr.getHand( 1 );
    //     hand2.add( handModelFactory.createHandModel( hand2 ) );
    //     scene.add( hand2 );
    // }

}
