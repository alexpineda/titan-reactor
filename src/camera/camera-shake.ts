import shuffle from "lodash.shuffle";
import { Camera, Vector3 } from "three";

const ONE_SECOND = 1000;
const FPS = 60;
let _remap = [0, 1, 2] as ( 0 | 1 | 2 )[];
class CameraShake {
    #noise: number[][] = [];

    #offset = new Vector3();

    #enabled = true;

    _duration = new Vector3();
    _startTime = [0, 0, 0];
    _strength = new Vector3();

    #prevCameraPosition = new Vector3();

    maxShakeDistance = 30;

    set enabled( val: boolean ) {
        this.#enabled = val;
        this._strength.setScalar( 0 );
    }

    get enabled() {
        return this.#enabled;
    }

    constructor( duration = ONE_SECOND, frequency = 10, strength = 1 ) {
        this.setParams( 0, duration, frequency, strength );
        this.setParams( 1, duration, frequency, strength );
        this.setParams( 2, duration, frequency, strength );
    }

    setParams(
        component: 0 | 1 | 2,
        duration: number,
        frequency: number,
        strength: number
    ) {
        this._strength.setComponent( component, strength );
        this._duration.setComponent( component, duration );
        this.#noise[component] = makePNoise1D(
            ( duration / ONE_SECOND ) * frequency,
            ( duration / ONE_SECOND ) * FPS
        );
    }

    _update( component: 0 | 1 | 2, elapsed: number ) {
        if ( this._strength.getComponent( component ) === 0 ) return;
        const elapsedTime = elapsed - this._startTime[component];
        const frameNumber = ( ( elapsedTime / ONE_SECOND ) * FPS ) | 0;
        const progress = elapsedTime / this._duration.getComponent( component );
        const ease = sineOut( 1 - progress );

        if ( progress >= 1 ) {
            this.#offset.setComponent( component, 0 );
            this._strength.setComponent( component, 0 );
            if ( this._strength.length() === 0 ) {
                _remap = shuffle( _remap );
            }
            return 0;
        }

        const offset =
            this.#noise[component][frameNumber] *
            this._strength.getComponent( component ) *
            ease;
        this.#offset.setComponent( component, offset );
        return offset;
    }

    _shake(
        component: 0 | 1 | 2,
        elapsed: number,
        duration: number,
        frequency: number,
        strength: number
    ) {
        // don't shake if we're already shaking or if the new shake value is 0
        if ( this._strength.getComponent( component ) ) return;
        this._startTime[component] = elapsed;
        this.setParams( component, duration, frequency, strength );
    }

    shake( elapsed: number, duration: Vector3, frequency: Vector3, strength: Vector3 ) {
        if ( !this.enabled ) return;

        strength.getComponent( 0 ) &&
            this._shake(
                _remap[0],
                elapsed,
                duration.getComponent( 0 ),
                frequency.getComponent( 0 ),
                strength.getComponent( 0 )
            );
        strength.getComponent( 1 ) &&
            this._shake(
                _remap[1],
                elapsed,
                duration.getComponent( 1 ),
                frequency.getComponent( 1 ),
                strength.getComponent( 1 )
            );
        strength.getComponent( 2 ) &&
            this._shake(
                _remap[2],
                elapsed,
                duration.getComponent( 2 ),
                frequency.getComponent( 2 ),
                strength.getComponent( 2 )
            );
    }

    update( elapsed: number, camera: Camera ) {
        if ( !this.enabled ) return;
        this._update( _remap[0], elapsed );
        this._update( _remap[1], elapsed );
        this._update( _remap[2], elapsed );
        this.#prevCameraPosition.copy( camera.position );
        camera.position.add( this.#offset );
    }

    restore( camera: Camera ) {
        if ( !this.enabled ) return;
        camera.position.copy( this.#prevCameraPosition );
    }
}

function makePNoise1D( length: number, step: number ) {
    const noise = [];
    const gradients = [];

    for ( let i = 0; i < length; i++ ) {
        gradients[i] = Math.random() * 2 - 1;
    }

    for ( let t = 0; t < step; t++ ) {
        const x = ( ( length - 1 ) / ( step - 1 ) ) * t;

        const i0 = x | 0;
        const i1 = ( i0 + 1 ) | 0;

        const g0 = gradients[i0];
        const g1 = gradients[i1] || gradients[i0];

        const u0 = x - i0;
        const u1 = u0 - 1;

        const n0 = g0 * u0;
        const n1 = g1 * u1;

        noise.push( n0 * ( 1 - fade( u0 ) ) + n1 * fade( u0 ) );
    }

    return noise;
}

function fade( t: number ) {
    return t * t * t * ( t * ( 6 * t - 15 ) + 10 );
}

const HALF_PI = Math.PI * 0.5;

function sineOut( t: number ) {
    return Math.sin( t * HALF_PI );
}

export default CameraShake;
