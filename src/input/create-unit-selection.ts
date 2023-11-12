import { Unit } from "@core/unit";
import { inverse } from "@utils/function-utils";
import { canOnlySelectOne } from "@utils/unit-utils";
import { Camera, Object3D, PerspectiveCamera, Raycaster, Vector2 } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import BaseScene from "@render/base-scene";
import { ImageBase } from "@core/image-base";
import { ProjectedCameraView } from "../camera/projected-camera-view";
import { InputsComposer } from "@core/world/input-composer";
import { SimpleQuadtree } from "@utils/data-structures/simple-quadtree";
import { TypeEmitter } from "@utils/type-emitter";
import { WorldEvents } from "@core/world/world-events";

const MIN_DRAG_SIZE = 0.01;

const typeIdSort = ( a: Unit, b: Unit ) => {
    return a.typeId - b.typeId;
};
const _hasAnyUnit = ( unit: Unit ) => !unit.extras.dat.isBuilding;
const _selectRayCaster = new Raycaster();
let _unit: Unit | null;

const _mouseV = new Vector2();

export enum UnitSelectionStatus {
    None,
    Dragging,
    Hovering,
}

export const createUnitSelectionBox = (
    events: TypeEmitter<WorldEvents>,
    mouse: InputsComposer["mouse"],
    scene: BaseScene,
    imageQuadtree: SimpleQuadtree<ImageBase>,
    onGetUnit: ( objects: Object3D ) => Unit | null
) => {
    const selectionBox = new SelectionBox( new PerspectiveCamera(), scene );

    let _selectActivated = false;
    let _enabled = true;
    let _status = UnitSelectionStatus.None;
    let _selectBoxStarted = false;

    const _selectDown = () => {
        if ( mouse.move.z !== 0 ) return;
        _selectActivated = true;
        _selectBoxStarted = false;

        selectionBox.startPoint.set( mouse.move.x, mouse.move.y, 0.5 );

        events.emit( "box-selection-start" );
    };

    const largerThanMinDrag = () => {
        return (
            Math.abs( mouse.move.x - selectionBox.startPoint.x ) > MIN_DRAG_SIZE &&
            Math.abs( mouse.move.y - selectionBox.startPoint.y ) > MIN_DRAG_SIZE
        );
    };

    const _selectMove = () => {
        if ( _selectActivated ) {
            selectionBox.endPoint.set( mouse.move.x, mouse.move.y, 0.5 );

            if ( !_selectBoxStarted ) {
                if ( largerThanMinDrag() ) {
                    _selectBoxStarted = true;
                }
            } else {
                events.emit( "box-selection-move" );

                _status = UnitSelectionStatus.Dragging;
            }
        } else {
            const intersection = ProjectedCameraView.mouseOnWorldPlane(
                mouse.move,
                selectionBox.camera
            ); /// RaycastHelper.intersectObject(scene.terrain, true, selectionBox.camera, mouse.move);

            if ( intersection ) {
                const images = imageQuadtree.getNearby(intersection.x, intersection.z);

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if ( images && images.length ) {
                    const unit = getUnitFromMouseIntersect(
                        _mouseV.set( mouse.move.x, mouse.move.y ),
                        images
                    );

                    selectionBox.startPoint.set(
                        mouse.move.x - 0.1,
                        mouse.move.y - 0.1,
                        0.5
                    );
                    selectionBox.endPoint.set(
                        mouse.move.x + 0.1,
                        mouse.move.y + 0.1,
                        0.5
                    );

                    if ( unit ) {
                        _status = UnitSelectionStatus.Hovering;
                    }
                }
            }
        }
    };

    const getUnitFromMouseIntersect = ( clipV: Vector2, obj: Object3D[] ) => {
        _selectRayCaster.setFromCamera( clipV, selectionBox.camera );
        const intersects = _selectRayCaster.intersectObjects( obj, true );
        if ( intersects.length ) {
            let closestUnit: Unit | undefined;
            let closestRenderOrder = -1;

            for ( const intersect of intersects ) {
                _unit = onGetUnit( intersect.object );
                if ( _unit ) {
                    if ( intersect.object.renderOrder > closestRenderOrder ) {
                        closestRenderOrder = intersect.object.renderOrder;
                        closestUnit = _unit;
                    }
                }
            }

            return closestUnit;
        }
    };

    const _selectUp = () => {
        if ( !_selectActivated ) return;

        _selectActivated = false;

        _status = UnitSelectionStatus.None;

        let draft: Unit[] = [];

        if ( !_selectBoxStarted ) {
            const unit = getUnitFromMouseIntersect(
                _mouseV.set( mouse.move.x, mouse.move.y ),
                selectionBox.scene.children
            );

            if ( unit ) {
                draft.push( unit );
            } else {
                events.emit( "box-selection-end", [] );
                return;
            }
        } else {
            selectionBox.endPoint.set( mouse.move.x, mouse.move.y, 0.5 );

            const allSelected = selectionBox.select();

            for ( const obj of allSelected ) {
                _unit = onGetUnit( obj );

                if ( _unit && !draft.includes( _unit ) ) {
                    draft.push( _unit );
                }
            }

            const onlyUnits = draft.filter( _hasAnyUnit );

            if ( onlyUnits.length > 0 && onlyUnits.length !== draft.length ) {
                draft = onlyUnits;
            }

            // since egg has no cmd icon, dont allow multi select unless they are all the same in which case just select one
            if ( draft.length > 1 && draft.some( canOnlySelectOne ) ) {
                if ( draft.every( ( unit ) => unit.typeId === draft[0].typeId ) ) {
                    draft = draft.slice( -1 );
                } else {
                    draft = draft.filter( inverse( canOnlySelectOne ) );
                }
            }
        }

        draft.sort( typeIdSort ).splice( 12 );

        events.emit( "box-selection-end", draft );
    };

    return {
        get status() {
            return _status;
        },
        set camera( camera: Camera ) {
            selectionBox.camera = camera;
        },
        set enabled( value: boolean ) {
            if ( value !== _enabled ) {
                events.emit( "box-selection-enabled", value );
            }
            _enabled = value;
            _selectActivated = value && _selectActivated;
        },
        get enabled() {
            return _enabled;
        },
        get isActive() {
            return _selectActivated;
        },
        update() {
            if ( !_enabled ) return;

            if ( mouse.clicked ) {
                _selectDown();
            } else if ( mouse.released ) {
                _selectUp();
            } else {
                if ( !_selectActivated ) {
                    _status = UnitSelectionStatus.None;
                }
                _selectMove();
            }
        },
        getHoveredUnit() {
            return getUnitFromMouseIntersect(
                _mouseV.set( mouse.move.x, mouse.move.y ),
                selectionBox.scene.children
            );
        },
    };
};
