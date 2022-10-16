import {
    Color,
    Matrix4,
    OrthographicCamera,
    PerspectiveCamera,
    Uniform,
    Vector2,
    Vector4,
} from "three";

import { Effect, EffectAttribute, BlendFunction } from "postprocessing";
import fragmentShader from "./fog-of-war.frag?raw";

export class FogOfWarEffect extends Effect {
    constructor() {
        super( "FogOfWarEffect", fragmentShader, {
            attributes: EffectAttribute.DEPTH,
            blendFunction: BlendFunction.ALPHA,
            uniforms: new Map( [
                ["fog", new Uniform( null )],
                ["fogResolution", new Uniform( new Vector2() )],
                ["viewInverse", new Uniform( new Matrix4() )],
                ["projectionInverse", new Uniform( new Matrix4() )],
                ["color", new Uniform( new Color( 0, 0, 0 ) )],
                ["fogUvTransform", new Uniform( new Vector4() )],
            ] ),
        } );
    }

    set opacity( value: number ) {
        this.blendMode.opacity.value = value;
    }

    get opacity() {
        return this.blendMode.opacity.value;
    }

    set camera( camera: PerspectiveCamera | OrthographicCamera ) {
        this.projectionInverse.copy( camera.projectionMatrixInverse );
        this.viewInverse.copy( camera.matrixWorld );
    }

    get fog() {
        return this.uniforms.get( "fog" )!.value;
    }

    set fog( value ) {
        this.uniforms.get( "fog" )!.value = value;
    }

    get fogResolution() {
        return this.uniforms.get( "fogResolution" )!.value;
    }

    set fogResolution( value ) {
        this.uniforms.get( "fogResolution" )!.value = value;
    }

    get viewInverse() {
        return this.uniforms.get( "viewInverse" )!.value;
    }

    set viewInverse( value ) {
        this.uniforms.get( "viewInverse" )!.value = value;
    }

    get projectionInverse() {
        return this.uniforms.get( "projectionInverse" )!.value;
    }

    set projectionInverse( value ) {
        this.uniforms.get( "projectionInverse" )!.value = value;
    }

    get color() {
        return this.uniforms.get( "color" )!.value;
    }

    set color( value ) {
        this.uniforms.get( "color" )!.value = value;
    }

    get fogUvTransform() {
        return this.uniforms.get( "fogUvTransform" )!.value;
    }

    set fogUvTransform( value ) {
        this.uniforms.get( "fogUvTransform" )!.value = value;
    }
}
