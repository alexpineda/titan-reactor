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
            builds: [ unitTypes.scv, unitTypes.comsatStation, unitTypes.nuclearSilo ],
            unlocks: [ unitTypes.barracks, unitTypes.engineeringBay ],
        },
    },
    [unitTypes.comsatStation]: {
        tech: {
            builds: [ techTypes.scannerSweep ],
        },
    },
    [unitTypes.nuclearSilo] : {
        units: {
            builds: [ unitTypes.nuclearMissile ],
        }
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
                unitTypes.academy,
                unitTypes.engineeringBay,
                unitTypes.factory,
                unitTypes.bunker,
            ],
        },
    },
    [unitTypes.academy]: {
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
        upgrades: {
            unlocks: [ upgrades.u238Shells ],
        },
    },

    [unitTypes.engineeringBay]: {
        upgrades: {
            builds: [ upgrades.terranInfantryArmor, upgrades.terranInfantryWeapons ],
        },
        units: {
            unlocks: [ unitTypes.missileTurret ],
        }
    },
    [unitTypes.factory]: {
        units: {
            builds: [
                unitTypes.vulture,
                unitTypes.siegeTankTankMode,
                unitTypes.goliath,
                unitTypes.machineShop,
            ],
            unlocks: [ unitTypes.armory, unitTypes.starport ],
        },
    },
    [unitTypes.machineShop]: {
        tech: {
            builds: [ techTypes.tankSiegeMode, techTypes.spiderMines ],
        },
        upgrades: {
            builds: [ upgrades.ionThrusters, upgrades.charonBooster ]
        },
        units: {
            unlocks: [ unitTypes.goliath ],
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
            unlocks: [ unitTypes.scienceFacility ],
        },
    },
    [unitTypes.controlTower]: {
        tech: {
            builds: [ techTypes.cloakingField ],
        },
        upgrades: {
            builds: [ upgrades.apolloReactor ],
        }
    },
    [unitTypes.scienceFacility]: {
        units: {
            unlocks: [
                unitTypes.scienceVessel,
                unitTypes.physicsLab,
                unitTypes.covertOps,
            ],
        },
        tech: {
            builds: [ techTypes.irradiate, techTypes.empShockwave ],
        },
        upgrades: {
            builds: [ upgrades.titanReactor ]
        }
    },
    [unitTypes.physicsLab]: {
        units: {
            unlocks: [ unitTypes.battleCruiser ],
        },
        tech: {
            builds: [ techTypes.yamatoGun ],
        },
        upgrades: {
            builds: [ upgrades.colossusReactor ]
        }
    },
    [unitTypes.covertOps]: {
        tech: {
            builds: [ techTypes.personnelCloaking, techTypes.lockdown ],
        },
        units: {
            unlocks: [ unitTypes.ghost, unitTypes.nuclearSilo ],
        },
        upgrades: {
            unlocks: [ upgrades.ocularImplants, upgrades.moebiusReactor ],
        },
    },
    // ZERG ----------------------------------------------
    [unitTypes.creepColony]: {
        units: {
            builds: [ unitTypes.sunkenColony, unitTypes.sporeColony ],
        },
    },
    [unitTypes.hatchery]: {
        units: {
            builds: [ unitTypes.drone, unitTypes.overlord, unitTypes.zergling , unitTypes.lair ],
            unlocks: [  unitTypes.spawningPool , unitTypes.evolutionChamber ],
        },
        tech: {
            builds: [ techTypes.burrowing ],
        },
    },
    [unitTypes.evolutionChamber] : {
        units: {
            unlocks: [ unitTypes.sporeColony ]
        },
        upgrades: {
            builds: [ upgrades.zergMeleeAttacks, upgrades.zergMissileAttacks, upgrades.zergCarapace ],
        }
    },
    [unitTypes.spawningPool]: {
        units: {
            unlocks: [ unitTypes.zergling , unitTypes.sunkenColony ],
        },
        upgrades: {
            builds: [ upgrades.metabolicBoost, upgrades.adrenalGlands ],
        }
    },
    [unitTypes.hydraliskDen]: {
        units: {
            unlocks: [ unitTypes.hydralisk ],
        },
        upgrades: {
            builds: [ upgrades.groovedSpines, upgrades.muscularAugments ],
        },
        tech: {
            builds: [ techTypes.lurkerAspect ],
        }
    },
    [unitTypes.lair]: {
        units: {
            unlocks: [
                unitTypes.spire,
                unitTypes.queensNest,
            ],
            builds: [ unitTypes.hive, unitTypes.mutalisk, unitTypes.queen ],
        },
        upgrades: {
            builds: [ upgrades.ventralSacs, upgrades.antennae, upgrades.pneumatizedCarapace ],
        },
        tech: {
            unlocks: [ techTypes.lurkerAspect ],
        }
    },
    [unitTypes.spire]: {
        units: {
            unlocks: [ unitTypes.greaterSpire, unitTypes.mutalisk ],
        },
        upgrades: {
            builds: [ upgrades.zergFlyerAttacks, upgrades.zergFlyerCarapace ],
        }
    },
    [unitTypes.queensNest]: {
        units: {
            unlocks: [ unitTypes.queen, unitTypes.hive ],
        },
        tech: {
            builds: [ techTypes.ensnare, techTypes.spawnBroodlings ],
        },
        upgrades: {
            builds: [ upgrades.gameteMeiosis ],
        }
    },
    [unitTypes.queen]: {
        units: {
            unlocks: [ unitTypes.infestedCommandCenter ],
        },
    },
    [unitTypes.infestedCommandCenter]: {
        units: {
            builds: [ unitTypes.infestedTerran ],
        }
    },
    [unitTypes.hive]: {
        units: {
            unlocks: [
                unitTypes.greaterSpire,
                unitTypes.ultraliskCavern,
                unitTypes.defilerMound,
                unitTypes.nydusCanal,
            ],
            builds: [ unitTypes.ultralisk, unitTypes.defiler ],
        },
    },
    [unitTypes.ultraliskCavern]: {
        units: {
            unlocks: [ unitTypes.ultralisk ],
        },
        upgrades: {
            builds: [ upgrades.chitinousPlating , upgrades.anabolicSynthesis ],
        }
    },
    
    [unitTypes.greaterSpire]: {
        units: {
            unlocks: [ unitTypes.guardian, unitTypes.devourer ],
        },
    },
    
    [unitTypes.mutalisk]: {
        units: {
            builds: [ unitTypes.guardian, unitTypes.devourer ],
        }
    },
    [unitTypes.defilerMound]: {
        units: {
            unlocks: [ unitTypes.defiler ],
        },
        tech: {
            builds: [ techTypes.plague, techTypes.consume ],
        },
        upgrades: {
            builds: [ upgrades.metasynapticNode ],
        }
    },
    
    // PROTOSS ----------------------------------------------
    [unitTypes.assimilator]: {},
    [unitTypes.pylon]: {},
    [unitTypes.nexus]: {
        units: {
            builds: [ unitTypes.probe ],
            unlocks: [ unitTypes.gateway, unitTypes.forge ],
        },
    },
    [unitTypes.forge]: {
        upgrades: {
            builds: [
                upgrades.protossGroundWeapons,
                upgrades.protossArmor,
                upgrades.protossPlasmaShields,
            ],
        },
        units: {
            unlocks: [ unitTypes.photonCannon ],
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
            unlocks: [ unitTypes.cyberneticsCore, unitTypes.shieldBattery ],
        },
    },
    [unitTypes.cyberneticsCore]: {
        units: {
            unlocks: [
                unitTypes.dragoon,
                unitTypes.citadelOfAdun,
                unitTypes.roboticsFacility,
                unitTypes.stargate,
            ],
        },
        tech: {
            builds: [
                upgrades.singularityCharge,
                upgrades.protossAirWeapons,
                upgrades.protossPlating,
            ],
        },
    },
    [unitTypes.roboticsFacility]: {
        units: {
            builds: [ unitTypes.reaver, unitTypes.observer, unitTypes.shuttle ],
            unlocks: [
                unitTypes.roboticsSupportBay,
                unitTypes.observatory,
                unitTypes.shuttle,
            ],
        },
    },
    [unitTypes.observatory]: {
        units: {
            unlocks: [ unitTypes.observer ],
        },
        upgrades: {
            builds: [ upgrades.graviticDrive, upgrades.sensorArray ],
        },
    },
    [unitTypes.roboticsSupportBay]: {
        units: {
            unlocks: [ unitTypes.reaver ],
        },
        upgrades: {
            builds: [
                upgrades.reaverCapacity,
                upgrades.scarabDamage,
                upgrades.graviticDrive,
            ],
        },
    },
    [unitTypes.stargate]: {
        units: {
            builds: [
                unitTypes.corsair,
                unitTypes.arbiter,
                unitTypes.carrier,
                unitTypes.scout,
            ],
            unlocks: [ -1, unitTypes.fleetBeacon ],
        },
    },
    [unitTypes.fleetBeacon]: {
        units: {
            unlocks: [ unitTypes.carrier ],
        },
        upgrades: {
            builds: [
                upgrades.carrierCapacity,
                upgrades.apialSensors,
                upgrades.graviticThrusters,
                upgrades.argusJewel,
            ],
        },
        tech: {
            builds: [ techTypes.disruptionWeb ],
        },
    },
    [unitTypes.arbitalTribunal]: {
        units: {
            unlocks: [ unitTypes.arbiter ],
        },
        tech: {
            builds: [ techTypes.recall, techTypes.stasisField ],
        },
        upgrades: {
            builds: [ upgrades.khaydarinCore ],
        },
    },
    [unitTypes.citadelOfAdun]: {
        units: {
            unlocks: [ unitTypes.templarArchives ],
        },
        tech: {
            builds: [ upgrades.legEnhancements ],
        },
    },
    [unitTypes.templarArchives]: {
        units: {
            unlocks: [ unitTypes.highTemplar, unitTypes.darkTemplar ],
        },
        upgrades: {
            builds: [ upgrades.khaydarinAmulet, upgrades.argusTalisman ],
        },
        tech: {
            builds: [
                techTypes.mindControl,
                techTypes.feedback,
                techTypes.psionicStorm,
                techTypes.hallucination,
                techTypes.maelstrom,
            ],
        },
    },
    [unitTypes.highTemplar]: {
        units: {
            builds: [ unitTypes.archon, unitTypes.darkArchon ],
        },
    },
};
