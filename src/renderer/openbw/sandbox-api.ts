import { UnitsBufferView } from "@buffer-view/units-buffer-view";
import { World } from "@core/world/world";
import { borrow } from "@utils/object-utils";
import { UnitStruct } from "common/types";
import { PxToWorld } from "common/utils/conversions";

const identityPxToWorld: PxToWorld = {
    x: ( a ) => a,
    y: ( a ) => a,
    xy: ( x, y, v ) => v.set( x, y ),
    xyz: ( x, z, v ) => v.set( x, 0, z ),
};

export type SandboxAPI = ReturnType<typeof createSandboxApi>;

export const createSandboxApi = ( _world: World, pxToWorldInverse: PxToWorld ) => {
    const world = borrow( _world );

    const sandBoxBufferViews = {
        units: new UnitsBufferView( world.openBW! ),
    };

    const getUnitId = ( unitOrId: UnitStruct | number ) =>
        typeof unitOrId === "number" ? unitOrId : unitOrId.id;

    let _useWorldCoordinates = true;
    const coords = () => ( _useWorldCoordinates ? pxToWorldInverse : identityPxToWorld );

    const sandboxGaurd = () => !world.openBW!.isSandboxMode();

    return {
        get useWorldCoordinates() {
            return _useWorldCoordinates;
        },

        set useWorldCoordinates( value: boolean ) {
            _useWorldCoordinates = value;
        },

        createUnit( unitTypeId: number, playerId: number, x: number, y: number ) {
            if ( sandboxGaurd() ) {
                return null;
            }

            const unitAddress = world.openBW!._create_unit(
                unitTypeId,
                playerId,
                coords().x( x ),
                coords().y( y )
            );
            if ( unitAddress === 0 ) {
                if ( world.openBW!.getLastErrorMessage() ) {
                    console.error( world.openBW!.getLastErrorMessage() );
                }

                return null;
            }

            return sandBoxBufferViews.units.get( unitAddress );
        },

        killUnit( unitOrId: UnitStruct | number ) {
            if ( sandboxGaurd() ) {
                return;
            }

            return world.openBW!.get_util_funcs().kill_unit( getUnitId( unitOrId ) );
        },

        removeUnit( unitOrId: UnitStruct | number ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world.openBW!.get_util_funcs().remove_unit( getUnitId( unitOrId ) );
        },

        orderUnitAttackMove(
            unitOrId: UnitStruct | number,
            targetUnitOrId?: UnitStruct | number | null,
            x = 0,
            y = 0
        ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command(
                    getUnitId( unitOrId ),
                    0,
                    targetUnitOrId ? getUnitId( targetUnitOrId ) : 0,
                    coords().x( x ),
                    coords().y( y ),
                    0
                );
        },

        orderUnitAttackUnit(
            unitOrId: UnitStruct | number,
            targetUnitOrId: UnitStruct | number | null,
            x = 0,
            y = 0
        ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command(
                    getUnitId( unitOrId ),
                    1,
                    targetUnitOrId ? getUnitId( targetUnitOrId ) : 0,
                    coords().x( x ),
                    coords().y( y ),
                    0
                );
        },

        orderUnitMove( unitOrId: UnitStruct | number, x = 0, y = 0 ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command(
                    getUnitId( unitOrId ),
                    2,
                    0,
                    coords().x( x ),
                    coords().y( y ),
                    0
                );
        },

        orderUnitBuild(
            unitOrId: UnitStruct | number,
            unitType: number,
            x: number,
            y: number
        ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command(
                    getUnitId( unitOrId ),
                    3,
                    0,
                    coords().x( x ),
                    coords().y( y ),
                    unitType
                );
        },

        orderUnitTrain( unitOrId: UnitStruct | number, unitType: number ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command( getUnitId( unitOrId ), 4, 0, 0, 0, unitType );
        },

        orderUnitRightClick(
            unitOrId: UnitStruct | number,
            targetUnitOrId: UnitStruct | number | null,
            x = 0,
            y = 0
        ) {
            if ( sandboxGaurd() ) {
                return;
            }

            world
                .openBW!.get_util_funcs()
                .issue_command(
                    getUnitId( unitOrId ),
                    5,
                    targetUnitOrId ? getUnitId( targetUnitOrId ) : 0,
                    coords().x( x ),
                    coords().y( y ),
                    0
                );
        },
    };
};
