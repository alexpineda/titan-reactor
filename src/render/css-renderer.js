import * as THREE from "three";
/**
 * Modified to avoid cache bug
 */

const _vector = new THREE.Vector3();

const _viewMatrix = new THREE.Matrix4();

const _viewProjectionMatrix = new THREE.Matrix4();

const _a = new THREE.Vector3();

const _b = new THREE.Vector3();

export class CSS2DRenderer {
    constructor( parameters = {} ) {
        const _this = this;

        let _width, _height;

        let _widthHalf, _heightHalf;

        const domElement =
            parameters.element !== undefined
                ? parameters.element
                : document.createElement( "div" );
        domElement.style.overflow = "hidden";
        this.domElement = domElement;

        this.getSize = function () {
            return {
                width: _width,
                height: _height,
            };
        };

        this.render = function ( scene, camera ) {
            if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
            if ( camera.parent === null ) camera.updateMatrixWorld();

            _viewMatrix.copy( camera.matrixWorldInverse );

            _viewProjectionMatrix.multiplyMatrices(
                camera.projectionMatrix,
                _viewMatrix
            );

            renderObject( scene, scene, camera );
            zOrder( scene );
        };

        this.setSize = function ( width, height ) {
            _width = width;
            _height = height;
            _widthHalf = _width / 2;
            _heightHalf = _height / 2;
            domElement.style.width = width + "px";
            domElement.style.height = height + "px";
        };

        function renderObject( object, scene, camera ) {
            if ( object.isCSS2DObject ) {
                _vector.setFromMatrixPosition( object.matrixWorld );

                _vector.applyMatrix4( _viewProjectionMatrix );

                const visible =
                    object.visible === true &&
                    _vector.z >= -1 &&
                    _vector.z <= 1 &&
                    object.layers.test( camera.layers ) === true;
                object.element.style.display = visible ? "" : "none";

                if ( visible ) {
                    object.onBeforeRender( _this, scene, camera );
                    const element = object.element;

                    if ( /apple/i.test( navigator.vendor ) ) {
                        // https://github.com/mrdoob/three.js/issues/21415
                        element.style.transform =
                            "translate(-50%,-50%) translate(" +
                            Math.round( _vector.x * _widthHalf + _widthHalf ) +
                            "px," +
                            Math.round( -_vector.y * _heightHalf + _heightHalf ) +
                            "px)";
                    } else {
                        element.style.transform =
                            "translate(-50%,-50%) translate(" +
                            ( _vector.x * _widthHalf + _widthHalf ) +
                            "px," +
                            ( -_vector.y * _heightHalf + _heightHalf ) +
                            "px)";
                    }

                    if ( element.parentNode !== domElement ) {
                        domElement.appendChild( element );
                    }

                    object.onAfterRender( _this, scene, camera );
                }

                object.userData.distanceToCameraSquared = getDistanceToSquared(
                    camera,
                    object
                );
            }

            for ( let i = 0, l = object.children.length; i < l; i++ ) {
                renderObject( object.children[i], scene, camera );
            }
        }

        function getDistanceToSquared( object1, object2 ) {
            _a.setFromMatrixPosition( object1.matrixWorld );

            _b.setFromMatrixPosition( object2.matrixWorld );

            return _a.distanceToSquared( _b );
        }

        function filterAndFlatten( scene ) {
            const result = [];
            scene.traverse( function ( object ) {
                if ( object.isCSS2DObject ) result.push( object );
            } );
            return result;
        }

        function zOrder( scene ) {
            const sorted = filterAndFlatten( scene ).sort( function ( a, b ) {
                if ( a.renderOrder !== b.renderOrder ) {
                    return b.renderOrder - a.renderOrder;
                }

                const distanceA = a.userData.distanceToCameraSquared;
                const distanceB = b.userData.distanceToCameraSquared;
                return distanceA - distanceB;
            } );
            const zMax = sorted.length;

            for ( let i = 0, l = sorted.length; i < l; i++ ) {
                sorted[i].element.style.zIndex = zMax - i;
            }
        }
    }
}
