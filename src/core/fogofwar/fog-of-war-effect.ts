import {
    Color,
    Matrix4,
    OrthographicCamera,
    PerspectiveCamera,
    Texture,
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
            blendFunction: BlendFunction.SUBTRACT,
            uniforms: new Map( [
                [ "fog", new Uniform( null ) ],
                [ "fogResolution", new Uniform( null ) ],
                [ "viewInverse", new Uniform( null ) ],
                [ "projectionInverse", new Uniform( null ) ],
                [ "color", new Uniform( null ) ],
                [ "fogUvTransform", new Uniform( null ) ],
            ] ),
        } );

        this.uniforms.set( "fogResolution", new Uniform( new Vector2() ) );
        this.uniforms.set( "viewInverse", new Uniform( new Matrix4() ) );
        this.uniforms.set( "projectionInverse", new Uniform( new Matrix4() ) );
        this.uniforms.set( "color", new Uniform( new Color( 0, 0, 0 ) ) );
        this.uniforms.set( "fogUvTransform", new Uniform( new Vector4() ) );
    }

    set opacity( value: number ) {
        this.blendMode.opacity.value = value;
    }

    get opacity() {
        return this.blendMode.opacity.value as number;
    }

    override set mainCamera( camera: PerspectiveCamera | OrthographicCamera ) {
        this.projectionInverse.copy( camera.projectionMatrixInverse );
        this.viewInverse.copy( camera.matrixWorld );
    }

    get fog() {
        return this.uniforms.get( "fog" )!.value as Texture;
    }

    set fog( value: Texture ) {
        this.uniforms.get( "fog" )!.value = value;
    }

    get fogResolution() {
        return this.uniforms.get( "fogResolution" )!.value as Vector2;
    }

    set fogResolution( value: Vector2 ) {
        this.uniforms.get( "fogResolution" )!.value = value;
    }

    get viewInverse() {
        return this.uniforms.get( "viewInverse" )!.value as Matrix4;
    }

    set viewInverse( value: Matrix4 ) {
        this.uniforms.get( "viewInverse" )!.value = value;
    }

    get projectionInverse() {
        return this.uniforms.get( "projectionInverse" )!.value as Matrix4;
    }

    set projectionInverse( value: Matrix4 ) {
        this.uniforms.get( "projectionInverse" )!.value = value;
    }

    get color() {
        return this.uniforms.get( "color" )!.value as Color;
    }

    set color( value: Color ) {
        this.uniforms.get( "color" )!.value = value;
    }

    get fogUvTransform() {
        return this.uniforms.get( "fogUvTransform" )!.value as Vector4;
    }

    set fogUvTransform( value: Vector4 ) {
        this.uniforms.get( "fogUvTransform" )!.value = value;
    }
}
