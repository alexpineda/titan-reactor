/* A custom representation of the entire brood war tech tree. */

import { unitTypes } from "./unit-types";
import { techTypes } from "./tech-types";
import { upgrades } from "./upgrades";

export type TechTreeType = {
    builds?: number[];
    unlocks?: number[];
};

export type TechTreeUnit = {
    units?: TechTreeType;
    upgrades?: TechTreeType;
    tech?: TechTreeType;
};

export type TechTree = Record<number, TechTreeUnit | undefined>;

export const techTree: TechTree = {
    [unitTypes.supplyDepot]: {},
    [unitTypes.refinery]: {},
    [unitTypes.commandCenter]: {
        units: {
            builds: [ unitTypes.scv, unitTypes.comsatStation ],
        },
    },
    [unitTypes.comsatStation]: {
        tech: {
            unlocks: [ techTypes.scannerSweep ],
        },
    },
    [unitTypes.barracks]: {
        units: {
            builds: [
                unitTypes.marine,
                unitTypes.firebat,
                unitTypes.medic,
                unitTypes.ghost,
            ],
            unlocks: [
                unitTypes.marine,
                unitTypes.acadamy,
                unitTypes.engineeringBay,
                unitTypes.factory,
            ],
        },
    },
    [unitTypes.acadamy]: {
        units: {
            unlocks: [ unitTypes.firebat, unitTypes.medic ],
        },
        tech: {
            builds: [
                techTypes.stimPacks,
                techTypes.opticalFlare,
                techTypes.healing,
                techTypes.restoration,
            ],
        },
    },

    [unitTypes.engineeringBay]: {
        upgrades: {
            builds: [ upgrades.terranInfantryArmor, upgrades.terranInfantryWeapons ],
        },
    },
    [unitTypes.factory]: {
        units: {
            builds: [
                unitTypes.vulture,
                unitTypes.siegeTankTankMode,
                unitTypes.goliath,
                unitTypes.machineShop,
            ],
            unlocks: [ -1, unitTypes.armory ],
        },
    },
    [unitTypes.machineShop]: {
        tech: {
            builds: [ techTypes.tankSiegeMode, techTypes.spiderMines ],
        },
        units: {
            unlocks: [ -1, unitTypes.goliath ],
        },
    },
    [unitTypes.armory]: {
        upgrades: {
            builds: [
                upgrades.terranVehiclePlating,
                upgrades.terranVehicleWeapons,
                upgrades.terranShipPlating,
                upgrades.terranShipWeapons,
            ],
            unlocks: [ upgrades.terranVehiclePlating, upgrades.terranVehicleWeapons ],
        },
    },
    [unitTypes.starport]: {
        units: {
            builds: [
                unitTypes.wraith,
                unitTypes.valkryie,
                unitTypes.dropship,
                unitTypes.scienceVessel,
                unitTypes.controlTower,
                unitTypes.battleCruiser,
            ],
            unlocks: [ -1, unitTypes.scienceFacility ],
        },
    },
    [unitTypes.controlTower]: {
        tech: {
            builds: [ techTypes.yamatoGun, techTypes.cloakingField ],
        },
    },
    [unitTypes.scienceFacility]: {
        units: {
            unlocks: [
                unitTypes.scienceVessel,
                unitTypes.physicsLab,
                unitTypes.covertOps,
                techTypes.defensiveMatrix,
            ],
        },
    },
    [unitTypes.physicsLab]: {
        units: {
            unlocks: [ unitTypes.battleCruiser ],
        },
        tech: {
            builds: [ techTypes.yamatoGun ],
        },
    },
    [unitTypes.covertOps]: {
        tech: {
            builds: [ techTypes.personnelCloaking, techTypes.lockdown ],
        },
        units: {
            unlocks: [ unitTypes.ghost, unitTypes.nuclearSilo ],
        },
        upgrades: {
            unlocks: [ upgrades.u238Shells, upgrades.ocularImplants ],
        },
    },
    // ZERG ----------------------------------------------
    [unitTypes.hatchery]: {
        units: {
            builds: [ unitTypes.drone, unitTypes.overlord, unitTypes.zergling ],
            unlocks: [ unitTypes.drone, unitTypes.lair, unitTypes.hydraliskDen ],
        },
        tech: {
            unlocks: [ techTypes.burrowing ],
        },
    },
    [unitTypes.lair]: {
        units: {
            unlocks: [
                unitTypes.hive,
                unitTypes.spire,
                unitTypes.lurker,
                unitTypes.queensNest,
            ],
            builds: [ unitTypes.hive, unitTypes.mutalisk, unitTypes.queen ],
        },
    },
    [unitTypes.hive]: {
        units: {
            unlocks: [
                unitTypes.greaterSpire,
                unitTypes.ultraliskCavern,
                unitTypes.defilerMound,
            ],
            builds: [ unitTypes.ultralisk, unitTypes.defiler ],
        },
    },
    [unitTypes.hydraliskDen]: {
        units: {
            unlocks: [ unitTypes.hydralisk ],
        },
    },
    [unitTypes.spire]: {
        units: {
            unlocks: [ unitTypes.greaterSpire, unitTypes.mutalisk ],
        },
    },
    [unitTypes.greaterSpire]: {
        units: {
            unlocks: [ unitTypes.guardian ],
        },
    },
    [unitTypes.ultraliskCavern]: {
        units: {
            unlocks: [ unitTypes.ultralisk ],
        },
    },
    [unitTypes.defilerMound]: {
        units: {
            unlocks: [ unitTypes.defiler ],
        },
    },
    [unitTypes.queensNest]: {
        units: {
            unlocks: [ unitTypes.queen ],
        },
    },
    // PROTOSS ----------------------------------------------
    [unitTypes.assimilator]: {},
    [unitTypes.pylon]: {},
    [unitTypes.nexus]: {
        units: {
            builds: [ unitTypes.probe ],
            unlocks: [ -1, unitTypes.gateway ],
        },
    },
    [unitTypes.gateway]: {
        units: {
            builds: [
                unitTypes.zealot,
                unitTypes.dragoon,
                unitTypes.highTemplar,
                unitTypes.darkTemplar,
            ],
            unlocks: [ -1, unitTypes.cyberneticsCore ],
        },
    },
    [unitTypes.cyberneticsCore]: {
        units: {
            unlocks: [
                unitTypes.dragoon,
                unitTypes.roboticsFacility,
                unitTypes.stargate,
            ],
        },
    },
    [unitTypes.citadelOfAdun]: {
        units: {
            unlocks: [ unitTypes.templarArchives ],
        },
    },
    [unitTypes.templarArchives]: {
        units: {
            unlocks: [ unitTypes.highTemplar, unitTypes.darkTemplar ],
        },
    },
    [unitTypes.roboticsFacility]: {
        units: {
            unlocks: [
                unitTypes.roboticsSupportBay,
                unitTypes.shuttle,
                unitTypes.observer,
            ],
        },
    },
    [unitTypes.roboticsSupportBay]: {
        units: {
            unlocks: [ unitTypes.reaver, unitTypes.scarab ],
        },
    },
    [unitTypes.stargate]: {
        units: {
            builds: [ unitTypes.corsair, unitTypes.arbiter, unitTypes.carrier ],
            unlocks: [ -1, unitTypes.fleetBeacon ],
        },
    },
    [unitTypes.fleetBeacon]: {
        units: {
            unlocks: [ unitTypes.carrier ],
        },
    },
    [unitTypes.forge]: {
        upgrades: {
            builds: [ upgrades.protossGroundWeapons, upgrades.protossArmor ],
        },
        units: {
            unlocks: [ unitTypes.photonCannon ],
        },
    },
};
