import { UnitsBufferView } from "@buffer-view/units-buffer-view";
import { OpenBW, UnitStruct } from "common/types";
import { PxToWorld } from "common/utils/conversions";

const identityPxToWorld: PxToWorld = {
    x: a => a,
    y: a => a,
    xy: (x, y, v) => v.set(x, y),
    xyz: (x, z, v) => v.set(x, 0, z)
}

export const createSandboxApi = (openBW: OpenBW, pxToWorldInverse: PxToWorld) => {

    const sandBoxBufferViews = {
        units: new UnitsBufferView(openBW)
    };

    const getUnitId = (unitOrId: UnitStruct | number) => typeof unitOrId === "number" ? unitOrId : unitOrId.id;

    let _useWorldCoordinates = true;
    const coords = () => _useWorldCoordinates ? pxToWorldInverse : identityPxToWorld;

    return ({

        get useWorldCoordinates() {
            return _useWorldCoordinates;
        },

        set useWorldCoordinates(value: boolean) {
            _useWorldCoordinates = value;
        },

        createUnit(unitTypeId: number, playerId: number, x: number, y: number) {

            if (!openBW.isSandboxMode()) {
                return null;
            }

            console.log(unitTypeId, playerId, coords().x(x), coords().y(y));
            const unitAddress = openBW._create_unit(unitTypeId, playerId, coords().x(x), coords().y(y));
            if (unitAddress === 0) {

                if (openBW.getLastErrorMessage()) {
                    console.error(openBW.getLastErrorMessage());
                }

                return null;
            }

            return sandBoxBufferViews.units.get(unitAddress);

        },

        killUnit(unitOrId: UnitStruct | number) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            return openBW.get_util_funcs().kill_unit(getUnitId(unitOrId));

        },

        removeUnit(unitOrId: UnitStruct | number) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().remove_unit(getUnitId(unitOrId));

        },

        orderUnitAttackMove(unitOrId: UnitStruct | number, targetUnitOrId?: UnitStruct | number | null, x: number = 0, y: number = 0) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 0, targetUnitOrId ? getUnitId(targetUnitOrId) : 0, coords().x(x), coords().y(y), 0);

        },

        orderUnitAttackUnit(unitOrId: UnitStruct | number, targetUnitOrId: UnitStruct | number | null, x: number = 0, y: number = 0) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 1, targetUnitOrId ? getUnitId(targetUnitOrId) : 0, coords().x(x), coords().y(y), 0);

        },

        orderUnitMove(unitOrId: UnitStruct | number, x: number = 0, y: number = 0) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 2, 0, coords().x(x), coords().y(y), 0);

        },

        orderUnitBuild(unitOrId: UnitStruct | number, unitType: number, x: number, y: number) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 3, 0, coords().x(x), coords().y(y), unitType);

        },

        orderUnitTrain(unitOrId: UnitStruct | number, unitType: number) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 4, 0, 0, 0, unitType);

        },

        orderUnitRightClick(unitOrId: UnitStruct | number, targetUnitOrId: UnitStruct | number | null, x: number = 0, y: number = 0) {

            if (!openBW.isSandboxMode()) {
                return;
            }

            openBW.get_util_funcs().issue_command(getUnitId(unitOrId), 5, targetUnitOrId ? getUnitId(targetUnitOrId) : 0, coords().x(x), coords().y(y), 0);

        },
    })
}