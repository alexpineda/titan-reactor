import {
    AnimationClip,
    AnimationMixer,
    Box3,
    BufferAttribute,
    Matrix4,
    Object3D,
    SkinnedMesh,
    Vector3,
    Vector4,
} from "three";

export function parallelTraverse(
    a: Object3D,
    b: Object3D,
    callback: ( a: Object3D, b: Object3D ) => void
) {
    callback( a, b );

    for ( let i = 0; i < a.children.length; i++ ) {
        parallelTraverse( a.children[i], b.children[i], callback );
    }
}

//https://jsfiddle.net/v02kLhsm/2/
function expandAABB( skinnedMesh: SkinnedMesh, aabb: Box3 ) {
    const vertex = new Vector3();
    const temp = new Vector3();
    const skinned = new Vector3();
    const skinIndices = new Vector4();
    const skinWeights = new Vector4();
    const boneMatrix = new Matrix4();

    const skeleton = skinnedMesh.skeleton;
    const boneMatrices = skeleton.boneMatrices;
    const geometry = skinnedMesh.geometry;

    const index = geometry.index;
    const position = geometry.attributes.position;
    const skinIndex = geometry.attributes.skinIndex as BufferAttribute;
    const skinWeigth = geometry.attributes.skinWeight as BufferAttribute;

    const bindMatrix = skinnedMesh.bindMatrix;
    const bindMatrixInverse = skinnedMesh.bindMatrixInverse;

    let i = 0;

    skeleton.update();

    //

    if ( index !== null ) {
        // indexed geometry

        for ( i = 0; i < index.count; i++ ) {
            vertex.fromBufferAttribute( position, index.array[i] );
            skinIndices.fromBufferAttribute( skinIndex, index.array[i] );
            skinWeights.fromBufferAttribute( skinWeigth, index.array[i] );

            expand();
        }
    } else {
        // non-indexed geometry

        for ( i = 0; i < position.count; i++ ) {
            vertex.fromBufferAttribute( position, i );
            skinIndices.fromBufferAttribute( skinIndex, i );
            skinWeights.fromBufferAttribute( skinWeigth, i );

            expand();
        }
    }

    function expand() {
        // the following code section is normally implemented in the vertex shader

        vertex.applyMatrix4( bindMatrix ); // transform to bind space
        skinned.set( 0, 0, 0 );

        for ( let j = 0; j < 4; j++ ) {
            const si = skinIndices.getComponent( j );
            const sw = skinWeights.getComponent( j );
            boneMatrix.fromArray( boneMatrices, si * 16 );

            // weighted vertex transformation

            temp.copy( vertex ).applyMatrix4( boneMatrix ).multiplyScalar( sw );
            skinned.add( temp );
        }

        skinned.applyMatrix4( bindMatrixInverse ); // back to local space

        // expand aabb

        aabb.expandByPoint( skinned );
    }

    return aabb;
}

export function calculateAABB(
    root: Object3D,
    skinnedMesh: SkinnedMesh,
    clip: AnimationClip,
    samplings: number
) {
    const aabb = new Box3();
    const tracks = clip.tracks;
    let duration = 0;

    // determine duration of clip by searching for the longest track

    for ( let i = 0, il = tracks.length; i < il; ++i ) {
        const track = tracks[i];

        duration = Math.max( duration, track.times[track.times.length - 1] );
    }

    //

    const animationMixer = new AnimationMixer( root );
    const action = animationMixer.clipAction( clip );
    action.play();

    const stride = duration / samplings;

    // start animating the bones and expand the AABB for each sampling

    for ( let t = 0, tl = duration; t < tl; t += stride ) {
        animationMixer.update( t );

        // ensure world matrices are up to date

        root.updateMatrixWorld( true );

        // expand AABB

        expandAABB( skinnedMesh, aabb );
    }

    action.stop();

    // transform AABB into world space

    aabb.applyMatrix4( skinnedMesh.matrixWorld );

    return aabb;
}
