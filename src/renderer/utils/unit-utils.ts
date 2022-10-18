import { BwDAT, UnitDAT, UnitStruct } from "common/types";
import { UnitFlags, unitTypes, iscriptHeaders, orders, upgrades } from "common/enums";
import { SpritesBufferView, UnitsBufferView } from "@buffer-view";
import { Unit } from "@core/unit";
import debounce from "lodash.debounce";
import { IterableSet } from "./data-structures/iterable-set";
import { PxToWorld } from "common/utils/conversions";
import { Vector3 } from "three";

export const unitIsCompleted = ( unit: UnitStruct ) => {
    return unit.statusFlags & UnitFlags.Completed;
};

export const canSelectUnit = ( unit: Unit | undefined ) => {
    if ( !unit ) return null;

    return unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb &&
        unit.order !== orders.die &&
        !unit.extras.dat.isTurret &&
        ( unit.statusFlags & UnitFlags.Loaded ) === 0 &&
        ( unit.statusFlags & UnitFlags.InBunker ) === 0 &&
        unit.order !== orders.harvestGas &&
        unit.typeId !== unitTypes.spiderMine &&
        ( unitIsCompleted( unit ) || unit.extras.dat.isZerg || unit.extras.dat.isBuilding )
        ? unit
        : null;
};

const _canOnlySelectOne = [
    unitTypes.larva,
    unitTypes.zergEgg,
    unitTypes.vespeneGeyser,
    unitTypes.mineral1,
    unitTypes.mineral2,
    unitTypes.mineral3,
    unitTypes.mutaliskCocoon,
    unitTypes.lurkerEgg,
];

export const canOnlySelectOne = ( unit: UnitStruct ) =>
    _canOnlySelectOne.includes( unit.typeId );

export const unitIsCloaked = ( unit: UnitStruct ) => {
    return (
        ( ( unit.statusFlags & UnitFlags.Cloaked ) != 0 ||
            ( unit.statusFlags & UnitFlags.PassivelyCloaked ) != 0 ) &&
        unit.typeId !== unitTypes.spiderMine &&
        !( unit.statusFlags & UnitFlags.Burrowed )
    );
};

export const unitIsFlying = ( unit: { statusFlags: number } ) => {
    return Boolean( unit.statusFlags & UnitFlags.Flying );
};

export const getAngle = ( direction: number ) => {
    direction -= 64;
    if ( direction < 0 ) direction += 256;
    return -( ( direction * Math.PI ) / 128.0 ) + Math.PI / 2.0;
};

export const unitIsAttacking = (
    u: UnitsBufferView,
    mainSprite: SpritesBufferView,
    bwDat: BwDAT
) => {
    if ( u.orderTargetAddr === 0 || u.orderTargetUnit === 0 ) return undefined;
    const unit = u.subunit && bwDat.units[u.subunit.typeId].isTurret ? u.subunit : u;
    switch ( mainSprite.mainImage.iscript.animation ) {
        case iscriptHeaders.gndAttkInit:
        case iscriptHeaders.gndAttkRpt:
            return bwDat.weapons[bwDat.units[unit.typeId].groundWeapon];
        case iscriptHeaders.airAttkInit:
        case iscriptHeaders.airAttkRpt:
            return bwDat.weapons[bwDat.units[unit.typeId].airWeapon];
        default:
            return undefined;
    }
};

// ported from BWAPI
export const getMaxUnitEnergy = ( unitType: UnitDAT, completedUpgrades: number[] ) => {
    if ( !unitType.isSpellcaster ) return 0;
    let energy = unitType.isHero ? 250 : 200;

    if (
        ( unitType.index === unitTypes.arbiter &&
            completedUpgrades.includes( upgrades.khaydarinCore ) ) ||
        ( unitType.index === unitTypes.corsair &&
            completedUpgrades.includes( upgrades.argusJewel ) ) ||
        ( unitType.index === unitTypes.darkArchon &&
            completedUpgrades.includes( upgrades.argusTalisman ) ) ||
        ( unitType.index === unitTypes.highTemplar &&
            completedUpgrades.includes( upgrades.khaydarinAmulet ) ) ||
        ( unitType.index === unitTypes.ghost &&
            completedUpgrades.includes( upgrades.moebiusReactor ) ) ||
        ( unitType.index === unitTypes.battleCruiser &&
            completedUpgrades.includes( upgrades.colossusReactor ) ) ||
        ( unitType.index === unitTypes.scienceVessel &&
            completedUpgrades.includes( upgrades.titanReactor ) ) ||
        ( unitType.index === unitTypes.wraith &&
            completedUpgrades.includes( upgrades.apolloReactor ) ) ||
        ( unitType.index === unitTypes.medic &&
            completedUpgrades.includes( upgrades.caduceusReactor ) ) ||
        ( unitType.index === unitTypes.defiler &&
            completedUpgrades.includes( upgrades.metasynapticNode ) ) ||
        ( unitType.index === unitTypes.queen &&
            completedUpgrades.includes( upgrades.gameteMeiosis ) )
    ) {
        energy = energy + 50;
    }

    return energy;
};

export class PlayerInfo {
    #structSize = 7;
    playerId: number;
    playerData: Uint32Array[];
    constructor() {
        this.playerId = 0;
        this.playerData = [];
    }

    get _offset() {
        return this.#structSize * this.playerId;
    }

    get minerals() {
        return this.playerData[this._offset + 0];
    }

    get vespeneGas() {
        return this.playerData[this._offset + 1];
    }
    get supply() {
        return this.playerData[this._offset + 2];
    }

    get supplyMax() {
        return this.playerData[this._offset + 3];
    }

    get workerSupply() {
        return this.playerData[this._offset + 4];
    }

    get armySupply() {
        return this.playerData[this._offset + 5];
    }

    get apm() {
        return this.playerData[this._offset + 6];
    }
}

const _followedUnitsPosition = new Vector3();

export const calculateFollowedUnitsTarget = debounce(
    ( set: IterableSet<Unit>, pxToGameUnit: PxToWorld ) => {
        const units = set._dangerousArray;

        if ( units.length === 0 ) {
            return;
        }

        _followedUnitsPosition.set(
            pxToGameUnit.x( units[0].x ),
            0,
            pxToGameUnit.y( units[0].y )
        );

        for ( let i = 1; i < units.length; i++ ) {
            _followedUnitsPosition.set(
                ( _followedUnitsPosition.x + pxToGameUnit.x( units[i].x ) ) / 2,
                0,
                ( _followedUnitsPosition.z + pxToGameUnit.y( units[i].y ) ) / 2
            );
        }
        return _followedUnitsPosition;
    },
    30
);
