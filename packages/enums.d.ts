declare module "tech-types" {
    export enum techTypes {
        stimPacks = 0,
        lockdown = 1,
        empShockwave = 2,
        spiderMines = 3,
        scannerSweep = 4,
        tankSiegeMode = 5,
        defensiveMatrix = 6,
        irradiate = 7,
        yamatoGun = 8,
        cloakingField = 9,
        personnelCloaking = 10,
        burrowing = 11,
        infestation = 12,
        spawnBroodlings = 13,
        darkSwarm = 14,
        plague = 15,
        consume = 16,
        ensnare = 17,
        parasite = 18,
        psionicStorm = 19,
        hallucination = 20,
        recall = 21,
        stasisField = 22,
        archonWarp = 23,
        restoration = 24,
        disruptionWeb = 25,
        unk26 = 26,
        mindControl = 27,
        darkArchonMeld = 28,
        feedback = 29,
        opticalFlare = 30,
        maelstorm = 31,
        lurkerAspect = 32,
        unk33 = 33,
        healing = 34
    }
}
declare module "unit-types" {
    export enum unitTypes {
        marine = 0,
        ghost = 1,
        vulture = 2,
        goliath = 3,
        goliathTurret = 4,
        siegeTankTankMode = 5,
        siegeTurretTankMode = 6,
        scv = 7,
        wraith = 8,
        scienceVessel = 9,
        dropship = 11,
        battleCruiser = 12,
        spiderMine = 13,
        nuclearMissile = 14,
        siegeTankSiegeMode = 30,
        siegeTurretSiegeMode = 31,
        firebat = 32,
        scannerSweep = 33,
        medic = 34,
        larva = 35,
        zergEgg = 36,
        zergling = 37,
        hydralisk = 38,
        ultralisk = 39,
        broodling = 40,
        drone = 41,
        overlord = 42,
        mutalisk = 43,
        guardian = 44,
        queen = 45,
        defiler = 46,
        scourge = 47,
        infestedTerran = 50,
        valkryie = 58,
        mutaliskCocoon = 59,
        corsair = 60,
        darkTemplar = 61,
        devourer = 62,
        darkArchon = 63,
        probe = 64,
        zealot = 65,
        dragoon = 66,
        highTemplar = 67,
        archon = 68,
        shuttle = 69,
        scout = 70,
        arbiter = 71,
        carrier = 72,
        interceptor = 73,
        reaver = 83,
        observer = 84,
        scarab = 85,
        rhynadon = 89,
        bengalaas = 90,
        scantid = 93,
        kakaru = 94,
        ragnasaur = 95,
        ursadon = 96,
        lurkerEgg = 97,
        lurker = 103,
        disruptionWeb = 105,
        commandCenter = 106,
        comsatStation = 107,
        nuclearSilo = 108,
        supplyDepot = 109,
        refinery = 110,
        barracks = 111,
        acadamy = 112,
        factory = 113,
        starport = 114,
        controlTower = 115,
        scienceFacility = 116,
        covertOps = 117,
        physicsLab = 118,
        machineShop = 120,
        engineeringBay = 122,
        armory = 123,
        missileTurret = 124,
        bunker = 125,
        infestedCommandCenter = 130,
        hatchery = 131,
        lair = 132,
        hive = 133,
        nydusCanal = 134,
        hydraDen = 135,
        defilerMound = 136,
        greaterSpire = 137,
        queensNest = 138,
        evolutionChamber = 139,
        ultraliskCavern = 140,
        spire = 141,
        spawningPool = 142,
        creepColony = 143,
        sporeColony = 144,
        sunkenColony = 146,
        zergOvermindWithShell = 147,
        zergOvermind = 148,
        extractor = 149,
        nexus = 154,
        roboticsFacility = 155,
        pylon = 156,
        assimilator = 157,
        observatory = 159,
        gateway = 160,
        photonCannon = 162,
        citadelOfAdun = 163,
        cyberneticsCore = 164,
        templarArchives = 165,
        forge = 166,
        stargate = 167,
        fleetBeacon = 169,
        arbitalTribunal = 170,
        roboticsSupportBay = 171,
        shieldBattery = 172,
        khaydarinCrystalFormation = 173,
        protossTemple = 174,
        xelNagaTemple = 175,
        mineral1 = 176,
        mineral2 = 177,
        mineral3 = 178,
        vespeneGeyser = 188,
        darkSwarm = 202,
        overmindCocoon = 201,
        startLocation = 214,
        none = 228
    }
}
declare module "upgrades" {
    export enum upgrades {
        terranInfantryArmor = 0,
        terranVehiclePlating = 1,
        terranShipPlating = 2,
        zergCarapace = 3,
        zergFlyerCarapace = 4,
        protossArmor = 5,
        protossPlating = 6,
        terranInfantryWeapons = 7,
        terranVehicleWeapons = 8,
        terranShipWeapons = 9,
        zergMeleeAttacks = 10,
        zergMissileAttacks = 11,
        zergFlyerAttacks = 12,
        protossGroundWeapons = 13,
        protossAirWeapons = 14,
        protossPlasmaShields = 15,
        u238Shells = 16,
        ionThrusters = 17,
        burstLasers = 18,
        titanReactor = 19,
        ocularImplants = 20,
        moebiusReactor = 21,
        apolloReactor = 22,
        colossusReactor = 23,
        ventralSacs = 24,
        antennae = 25,
        pneumatizedCarapace = 26,
        metabolicBoost = 27,
        adrenalGlands = 28,
        muscularAugments = 29,
        groovedSpines = 30,
        gameteMeiosis = 31,
        metasynapticNode = 32,
        singularityCharge = 33,
        legEnhancements = 34,
        scarabDamage = 35,
        reaverCapacity = 36,
        graviticDrive = 37,
        sensorArray = 38,
        graviticBoosters = 39,
        khaydarinAmulet = 40,
        apialSensors = 41,
        graviticThrusters = 42,
        carrierCapacity = 43,
        khaydarinCore = 44,
        unk45 = 45,
        unk46 = 46,
        argusJewel = 47,
        unk48 = 48,
        argusTalisman = 49,
        unk50 = 50,
        caduceusReactor = 51,
        chitinousPlating = 52,
        anabolicSynthesis = 53,
        charonBooster = 54
    }
}
declare module "abilities-map" {
    import { unitTypes } from "unit-types";
    export const unitsByUpgradeType: {
        0: unitTypes[];
        1: unitTypes[];
        2: unitTypes[];
        3: unitTypes[];
        4: unitTypes[];
        5: unitTypes[];
        6: unitTypes[];
        7: unitTypes[];
        8: unitTypes[];
        9: unitTypes[];
        10: unitTypes[];
        12: unitTypes[];
        13: unitTypes[];
        14: unitTypes[];
        15: unitTypes[];
        16: unitTypes[];
        17: unitTypes[];
        19: unitTypes[];
        21: unitTypes[];
        20: unitTypes[];
        22: unitTypes[];
        23: unitTypes[];
        24: unitTypes[];
        25: unitTypes[];
        26: unitTypes[];
        27: unitTypes[];
        28: unitTypes[];
        29: unitTypes[];
        30: unitTypes[];
        31: unitTypes[];
        32: unitTypes[];
        33: unitTypes[];
        34: unitTypes[];
        35: unitTypes[];
        36: unitTypes[];
        37: unitTypes[];
        39: unitTypes[];
        38: unitTypes[];
        40: unitTypes[];
        41: unitTypes[];
        42: unitTypes[];
        43: unitTypes[];
        44: unitTypes[];
        47: unitTypes[];
        49: unitTypes[];
        51: unitTypes[];
        53: unitTypes[];
        52: unitTypes[];
        54: unitTypes[];
    };
    export const upgradesByUnitType: Record<number, number[]>;
    export const unitsByTechType: {
        0: unitTypes[];
        1: unitTypes[];
        2: unitTypes[];
        3: unitTypes[];
        4: unitTypes[];
        5: unitTypes[];
        6: unitTypes[];
        7: unitTypes[];
        8: unitTypes[];
        9: unitTypes[];
        10: unitTypes[];
        11: unitTypes[];
        12: unitTypes[];
        13: unitTypes[];
        17: unitTypes[];
        18: unitTypes[];
        14: unitTypes[];
        15: unitTypes[];
        16: unitTypes[];
        19: unitTypes[];
        20: unitTypes[];
        21: unitTypes[];
        22: unitTypes[];
        23: unitTypes[];
        24: unitTypes[];
        30: unitTypes[];
        25: unitTypes[];
        27: unitTypes[];
        28: unitTypes[];
        29: unitTypes[];
        31: unitTypes[];
        32: unitTypes[];
        34: unitTypes[];
    };
    export const techTypesByUnitType: Record<number, number[]>;
}
declare module "behaviours" {
    export enum behaviours {
        flyAndDontFollowTarget = 0,
        flyAndFollowTarget = 1,
        appearOnTargetUnit = 2,
        persistOnTargetSite = 3,
        appearOnTargetSite = 4,
        appearOnAttacker = 5,
        attackAndSelfDestruct = 6,
        bounce = 7,
        attackTarget3x3Area = 8,
        goToMaxRange = 9
    }
}
declare module "commands" {
    export enum Commands {
        keepAlive = 5,
        saveGame = 6,
        loadGame = 7,
        restartGame = 8,
        select = 9,
        selectAdd = 10,
        selectRemove = 11,
        build = 12,
        vision = 13,
        alliance = 14,
        gameSpeed = 15,
        pause = 16,
        resume = 17,
        cheat = 18,
        hotkey = 19,
        rightClick = 20,
        targetedOrder = 21,
        cancelBuild = 24,
        cancelMorph = 25,
        stop = 26,
        carrierStop = 27,
        reaverStop = 28,
        orderNothing = 29,
        returnCargo = 30,
        train = 31,
        cancelTrain = 32,
        cloak = 33,
        decloak = 34,
        unitMorph = 35,
        unsiege = 37,
        siege = 38,
        trainFighter = 39,
        unloadAll = 40,
        unload = 41,
        mergeArchon = 42,
        holdPosition = 43,
        burrow = 44,
        unburrow = 45,
        cancelNuke = 46,
        liftOff = 47,
        tech = 48,
        cancelTech = 49,
        upgrade = 50,
        cancelUpgrade = 51,
        cancelAddon = 52,
        buildingMorph = 53,
        stim = 54,
        sync = 55,
        voiceEnable = 56,
        voiceDisable = 57,
        voiceSquelch = 58,
        voiceUnsquelch = 59,
        lobbyStartGame = 60,
        lobbyDownloadPercentage = 61,
        lobbyChangeGameSlot = 62,
        lobbyNewNetPlayer = 63,
        lobbyJoinedGame = 64,
        lobbyChangeRace = 65,
        lobbyTeamGameTeam = 66,
        lobbyUMSTeam = 67,
        lobbyMeleeTeam = 68,
        lobbySwapPlayers = 69,
        lobbySavedData = 72,
        briefingStart = 84,
        latency = 85,
        replaySpeed = 86,
        leaveGame = 87,
        miniMapPing = 88,
        mergeDarkArchon = 90,
        makeGamePublic = 91,
        chat = 92,
        rightClickRemastered = 96,
        targetedOrderRemastered = 97,
        unloadRemastered = 98,
        selectRemastered = 99,
        selectAddRemastered = 100,
        selectRemoveRemastered = 101
    }
}
declare module "damage-ratios" {
    export const damageRatios: number[][];
}
declare module "char-color" {
    export const charColor: Map<number, string>;
}
declare module "damages-types" {
    export enum DamageType {
        Independent = 0,
        Explosive = 1,
        Concussive = 2,
        Normal = 3,
        IgnoreArmor = 4
    }
}
declare module "draw-functions" {
    export enum drawFunctions {
        normal = 0,
        overlayOnTarget = 1,
        enemyUnitCloak = 2,
        ownUnitCloak = 3,
        allyUnitCloak = 4,
        ownUnitCloak2 = 5,
        ownUnitCloakDrawOnly = 6,
        crash = 7,
        empShockwave = 8,
        useRemapping = 9,
        rleShadow = 10,
        rleHpFloatDraw = 11,
        warpFlash = 12,
        rleOutline = 13,
        rlePlayerSide = 14,
        boundingRect = 15,
        hallucination = 16,
        warpFlash2 = 17
    }
}
declare module "explosions" {
    export enum Explosion {
        None = 0,
        Normal = 1,
        Splash_Radial = 2,
        Splash_Enemy = 3,
        Lockdown = 4,
        NuclearMissile = 5,
        Parasite = 6,
        Broodlings = 7,
        EmpShockwave = 8,
        Irradiate = 9,
        Ensnare = 10,
        Plague = 11,
        StasisField = 12,
        DarkSwarm = 13,
        Consume = 14,
        YamatoGun = 15,
        Restoration = 16,
        DisruptionWeb = 17,
        CorrosiveAcid = 18,
        MindControl = 19,
        Feedback = 20,
        OpticalFlare = 21,
        Maelstrom = 22,
        Unknown = 23,
        SplashAir = 24
    }
}
declare module "flingy-control" {
    export enum flingyControl {
        flingy = 0,
        partiallyMobile = 1,
        iscript = 2
    }
}
declare module "image-types" {
    export enum imageTypes {
        siegeTankTankTurret = 251,
        siegeTankSiegeTurret = 254,
        gasOverlay = 430,
        depletedGasOverlay = 435,
        haloRocketTrail = 960
    }
}
declare module "iscript-headers" {
    export enum iscriptHeaders {
        init = 0,
        death = 1,
        gndAttkInit = 2,
        airAttkInit = 3,
        unused1 = 4,
        gndAttkRpt = 5,
        airAttkRpt = 6,
        castSpell = 7,
        gndAttkToIdle = 8,
        airAttkToIdle = 9,
        unused2 = 10,
        walking = 11,
        walkingToIdle = 12,
        specialState1 = 13,
        specialState2 = 14,
        almostBuilt = 15,
        built = 16,
        landing = 17,
        liftOff = 18,
        working = 19,
        workingToIdle = 20,
        warpIn = 21,
        unused3 = 22,
        starEditInit = 23,
        disable = 24,
        burrow = 25,
        unBurrow = 26,
        enable = 27
    }
}
declare module "orders" {
    export enum orders {
        die = 0,
        stop = 1,
        gaurd = 2,
        playerGaurd = 3,
        turretGaurd = 4,
        bunkerGaurd = 5,
        move = 6,
        stopReaver = 7,
        attack1 = 8,
        attack2 = 9,
        attackUnit = 10,
        attackFixedRange = 11,
        attackTile = 12,
        hover = 13,
        attackMove = 14,
        infestedCommandCenter = 15,
        unusedNothing = 16,
        unusedPowerup = 17,
        towerGaurd = 18,
        towerAttack = 19,
        vultureMine = 20,
        stayInRange = 21,
        turretAttack = 22,
        nothing = 23,
        unused24 = 24,
        droneStartBuild = 25,
        droneBuild = 26,
        castInfestation = 27,
        moveToInfest = 28,
        infestingCommandCenter = 29,
        placeBuilding = 30,
        placeProtossBuilding = 31,
        createProtossBuilding = 32,
        constructingBuilding = 33,
        repair = 34,
        moveToRepair = 35,
        placeAddOn = 36,
        buildAddOn = 37,
        train = 38,
        rallyPointUnit = 39,
        rallyPointTile = 40,
        zergBirth = 41,
        zergUnitMorph = 42,
        zergBuildingMorph = 43,
        incompleteBuilding = 44,
        incompleteMorphing = 45,
        buildNydusExit = 46,
        enterNydusCanal = 47,
        incompleteWarping = 48,
        follow = 49,
        carrier = 50,
        reaverCarrierMove = 51,
        carrierStop = 52,
        carrierAttack = 53,
        carrierMoveToAttack = 54,
        carrierIgnore2 = 55,
        carrierFight = 56,
        carrierHoldPosition = 57,
        reaver = 58,
        reaverAttack = 59,
        reaverMoveToAttack = 60,
        reaverFight = 61,
        reaverHoldPosition = 62,
        trainFighter = 63,
        interceptorAttack = 64,
        scarabAttack = 65,
        rechargeShieldsUnit = 66,
        rechargeShieldsBattery = 67,
        shieldBattery = 68,
        interceptorReturn = 69,
        droneLand = 70,
        buildingLand = 71,
        buildingLiftOff = 72,
        droneLiftOff = 73,
        liftingOff = 74,
        researchTech = 75,
        upgrade = 76,
        larva = 77,
        spawningLarva = 78,
        harvest1 = 79,
        harvest2 = 80,
        moveToGas = 81,
        waitForGas = 82,
        harvestGas = 83,
        returnGas = 84,
        moveToMinerals = 85,
        waitForMinerals = 86,
        miningMinerals = 87,
        harvest3 = 88,
        harvest4 = 89,
        returnMinerals = 90,
        interrupted = 91,
        enterTransport = 92,
        pickupIdle = 93,
        pickupTransport = 94,
        pickupBunker = 95,
        pickup4 = 96,
        powerupIdle = 97,
        sieging = 98,
        unsieging = 99,
        watchTarget = 100,
        initCreepGrowth = 101,
        spreadCreep = 102,
        stoppingCreepGrowth = 103,
        guardianAspect = 104,
        archonWarp = 105,
        completingArchonSummon = 106,
        holdPosition = 107,
        queenHoldPosition = 108,
        cloak = 109,
        decloak = 110,
        unload = 111,
        moveUnload = 112,
        fireYamatoGun = 113,
        moveToFireYamatoGun = 114,
        castLockdown = 115,
        burrowing = 116,
        burrowed = 117,
        unburrowing = 118,
        castDarkSwarm = 119,
        castParasite = 120,
        castSpawnBroodlings = 121,
        castEmpShockwave = 122,
        nukeWait = 123,
        nukeTrain = 124,
        nukeLaunch = 125,
        nukePaint = 126,
        nukeUnit = 127,
        castNuclearStrike = 128,
        nukeTrack = 129,
        initializeArbiter = 130,
        cloakNearbyUnits = 131,
        placeSpiderMine = 132,
        rightClickAction = 133,
        suicideUnit = 134,
        suicideTile = 135,
        suicideHoldPosition = 136,
        castRecall = 137,
        teleport = 138,
        castScannerSweep = 139,
        scanner = 140,
        castDefensiveMatrix = 141,
        castPsionicStorm = 142,
        castIrradiate = 143,
        castPlague = 144,
        castConsume = 145,
        castEnsnare = 146,
        castStasisField = 147,
        castHallucination = 148,
        hallucination2 = 149,
        resetCollision = 150,
        resetHarvestCollision = 151,
        patrol = 152,
        CTFCOPInit = 153,
        CTFCOPStarted = 154,
        CTFCOP2 = 155,
        computerAI = 156,
        atkMoveEp = 157,
        harrassMove = 158,
        AIPatrol = 159,
        guardPost = 160,
        rescuePassive = 161,
        neutral = 162,
        computerReturn = 163,
        InitializePsiProvider = 164,
        scarabSelfDestructing = 165,
        critter = 166,
        hiddenGun = 167,
        openDoor = 168,
        closeDoor = 169,
        hideTrap = 170,
        revealTrap = 171,
        enableDoodad = 172,
        disableDoodad = 173,
        warpIn = 174,
        medic = 175,
        medicHeal = 176,
        medicHealMove = 177,
        medicHoldPosition = 178,
        medicHealToIdle = 179,
        castRestoration = 180,
        castDisruptionWeb = 181,
        castMindControl = 182,
        darkArchonMeld = 183,
        castFeedback = 184,
        castOpticalFlare = 185,
        castMaelstrom = 186,
        junkYardDog = 187,
        fatal = 188,
        none = 189
    }
}
declare module "overlay-types" {
    export enum overlayTypes {
        attackOverlay = 0,
        damageOverlay = 1,
        specialOverlay = 2,
        landingDust = 3,
        liftOffDust = 4,
        shieldOverlay = 5
    }
}
declare module "player-colors" {
    export const playerColors: {
        name: string;
        id: number;
        rgb: number;
        hex: string;
    }[];
}
declare module "player-palette" {
    export const playerPallete: number[][][];
}
declare module "races" {
    export enum races {
        zerg = 0,
        terran = 1,
        protoss = 2,
        all = 3
    }
}
declare module "right-click-actions" {
    export enum rightClickActions {
        noCommandsAutoAttack = 0,
        normalMovementNormalAttack = 1,
        normalMovementNoAttack = 2,
        noMovementNormalAttack = 3,
        harvest = 4,
        harvestAndRepair = 5,
        nothing = 6
    }
}
declare module "selection-circle-size" {
    export const selectionCircleSize: ({
        size: number;
        index: number;
        dashed?: undefined;
    } | {
        size: number;
        dashed: boolean;
        index: number;
    })[];
}
declare module "shield-size" {
    export enum shieldSize {
        none = 0,
        small = 1,
        medium = 2,
        large = 3
    }
}
declare module "tileset-names" {
    export enum tilesetNames {
        badlands = 0,
        platform = 1,
        install = 2,
        ashworld = 3,
        jungle = 4,
        desert = 5,
        ice = 6,
        twilight = 7
    }
}
declare module "unit-size" {
    export enum unitSize {
        Independent = 0,
        small = 1,
        medium = 2,
        large = 3
    }
}
declare module "unit-flags" {
    export enum UnitFlags {
        Completed = 1,
        GroundedBuilding = 2,
        Flying = 4,
        Burrowed = 16,
        InBunker = 32,
        Loaded = 64,
        Cloaked = 512,
        PassivelyCloaked = 2048,
        CanTurn = 65536,
        CanMove = 131072,
        Gathering = 8388608
    }
}
declare module "image-flags" {
    export enum ImageFlags {
        Redraw = 1,
        Flipped = 2,
        Frozen = 4,
        Directional = 8,
        Iscript = 16,
        Clickable = 32,
        Hidden = 64,
        SpecialOffset = 128
    }
}
declare module "sprite-flags" {
    export enum SpriteFlags {
        Selected = 8,
        Turret = 16,
        Hidden = 32,
        Burrowed = 64,
        IscriptNoBrk = 128
    }
}
declare module "bullet-state" {
    export enum BulletState {
        Init = 0,
        Move = 1,
        Follow = 2,
        Bounce = 3,
        DamageOverTime = 4,
        Dying = 5,
        HitNearTarget = 6
    }
}
declare module "weapon-types" {
    export enum WeaponType {
        GaussRifle = 0,
        GaussRifle_JimRaynorMarine = 1,
        C10ConcussionRifle = 2,
        C10ConcussionRifle_SarahKerrigan = 3,
        FragmentationGrenade = 4,
        FragmentationGrenade_JimRaynor_Vulture = 5,
        SpiderMines = 6,
        TwinAutocannons = 7,
        HellfireMissilePack = 8,
        TwinAutocannons_AlanSchezar = 9,
        HellfireMissilePack_AlanSchezar = 10,
        ArcliteCannon = 11,
        ArcliteCannon_EdmundDuke = 12,
        FusionCutter = 13,
        FusionCutter_Harvest = 14,
        GeminiMissiles = 15,
        BurstLasers = 16,
        GeminiMissiles_TomKazansky = 17,
        BurstLasers_TomKazansky = 18,
        ATSLaserBattery = 19,
        ATALaserBattery = 20,
        ATSLaserBattery_NoradIIMengskDuGalle = 21,
        ATALaserBattery_NoradIIMengskDuGalle = 22,
        ATSLaserBattery_Hyperion = 23,
        ATALaserBattery_Hyperion = 24,
        FlameThrower = 25,
        FlameThrower_GuiMontag = 26,
        ArcliteShockCannon = 27,
        ArcliteShockCannon_EdmundDuke = 28,
        LongboltMissiles = 29,
        YamatoGun = 30,
        NuclearMissile = 31,
        Lockdown = 32,
        EMPShockwave = 33,
        Irradiate = 34,
        Claws = 35,
        Claws_DevouringOne = 36,
        Claws_InfestedKerrigan = 37,
        NeedleSpines = 38,
        NeedleSpines_HunterKiller = 39,
        KaiserBlades = 40,
        KaiserBlades_Torrasque = 41,
        ToxicSpores_Broodling = 42,
        Spines = 43,
        Spines_Harvest = 44,
        AcidSpray_Unused = 45,
        AcidSpore = 46,
        AcidSpore_KukulzaGuardian = 47,
        GlaveWurm = 48,
        GlaveWurm_KukulzaMutalisk = 49,
        Venom_UnusedDefiler = 50,
        Venom_UnusedDefiler_Hero = 51,
        SeekerSpores = 52,
        SubterraneanTentacle = 53,
        Suicide_InfestedTerran = 54,
        Suicide_Scourge = 55,
        Parasite = 56,
        SpawnBroodlings = 57,
        Ensnare = 58,
        DarkSwarm = 59,
        Plague = 60,
        Consume = 61,
        ParticleBeam = 62,
        ParticleBeam_Harvest = 63,
        PsiBlades = 64,
        PsiBlades_FenixZealot = 65,
        PhaseDisruptor = 66,
        PhaseDisruptor_FenixDragoon = 67,
        PsiAssault_Unused = 68,
        PsiAssault_TassadarAldaris = 69,
        PsionicShockwave = 70,
        PsionicShockwave_TassadarZeratul_Archon = 71,
        Unknown72 = 72,
        DualPhotonBlasters = 73,
        AntiMatterMissiles = 74,
        DualPhotonBlasters_Mojo = 75,
        AntiMatterMissiles_Mojo = 76,
        PhaseDisruptorCannon = 77,
        PhaseDisruptorCannon_Danimoth = 78,
        PulseCannon = 79,
        STSPhotonCannon = 80,
        STAPhotonCannon = 81,
        Scarab = 82,
        StasisField = 83,
        PsiStorm = 84,
        WarpBlades_Zeratul = 85,
        WarpBlades_DarkTemplarHero = 86,
        Missiles_Unused = 87,
        LaserBattery1_Unused = 88,
        TormentorMissiles_Unused = 89,
        Bombs_Unused = 90,
        RaiderGun_Unused = 91,
        LaserBattery2_Unused = 92,
        LaserBattery3_Unused = 93,
        DualPhotonBlasters_Unused = 94,
        FlechetteGrenade_Unused = 95,
        TwinAutocannons_FloorTrap = 96,
        HellfireMissilePack_WallTrap = 97,
        FlameThrower_WallTrap = 98,
        HellfireMissilePack_FloorTrap = 99,
        NeutronFlare = 100,
        DisruptionWeb = 101,
        Restoration = 102,
        HaloRockets = 103,
        CorrosiveAcid = 104,
        MindControl = 105,
        Feedback = 106,
        OpticalFlare = 107,
        Maelstrom = 108,
        SubterraneanSpines = 109,
        GaussRifle0_Unused = 110,
        WarpBlades = 111,
        C10ConcussionRifle_SamirDuran = 112,
        C10ConcussionRifle_InfestedDuran = 113,
        DualPhotonBlasters_Artanis = 114,
        AntimatterMissiles_Artanis = 115,
        C10ConcussionRifle_AlexeiStukov = 116,
        Unknown117 = 117,
        Unknown118 = 118,
        Unknown119 = 119,
        Unknown120 = 120,
        Unknown121 = 121,
        Unknown122 = 122,
        Unknown123 = 123,
        Unknown124 = 124,
        Unknown125 = 125,
        Unknown126 = 126,
        Unknown127 = 127,
        Unknown128 = 128,
        Unknown129 = 129,
        None = 130
    }
}
declare module "weapon-behavior" {
    export enum WeaponBehavior {
        FlyAndDontFollowTarget = 0,
        FlyAndFollowTarget = 1,
        AppearOnTargetUnit = 2,
        PersistOnTargetPos = 3,
        AppearOnTargetPos = 4,
        AppearOnAttacker = 5,
        SelfDestruct = 6,
        Bounce = 7,
        AttackTarget_3x3Area = 8,
        ExtendToMaxRange = 9
    }
}
declare module "sprite-types" {
    export const spriteTypes: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        "6": string;
        "7": string;
        "8": string;
        "9": string;
        "10": string;
        "11": string;
        "12": string;
        "13": string;
        "14": string;
        "15": string;
        "16": string;
        "17": string;
        "18": string;
        "19": string;
        "20": string;
        "21": string;
        "22": string;
        "23": string;
        "24": string;
        "25": string;
        "26": string;
        "27": string;
        "28": string;
        "29": string;
        "30": string;
        "31": string;
        "32": string;
        "33": string;
        "34": string;
        "35": string;
        "36": string;
        "37": string;
        "38": string;
        "39": string;
        "40": string;
        "41": string;
        "42": string;
        "43": string;
        "44": string;
        "45": string;
        "46": string;
        "47": string;
        "48": string;
        "49": string;
        "50": string;
        "51": string;
        "52": string;
        "53": string;
        "54": string;
        "55": string;
        "56": string;
        "57": string;
        "58": string;
        "59": string;
        "60": string;
        "61": string;
        "62": string;
        "63": string;
        "64": string;
        "65": string;
        "66": string;
        "67": string;
        "68": string;
        "69": string;
        "70": string;
        "71": string;
        "72": string;
        "73": string;
        "74": string;
        "75": string;
        "76": string;
        "77": string;
        "78": string;
        "79": string;
        "80": string;
        "81": string;
        "82": string;
        "83": string;
        "84": string;
        "85": string;
        "86": string;
        "87": string;
        "88": string;
        "89": string;
        "90": string;
        "91": string;
        "92": string;
        "93": string;
        "94": string;
        "95": string;
        "96": string;
        "97": string;
        "98": string;
        "99": string;
        "100": string;
        "101": string;
        "102": string;
        "103": string;
        "104": string;
        "105": string;
        "106": string;
        "107": string;
        "108": string;
        "109": string;
        "110": string;
        "111": string;
        "112": string;
        "113": string;
        "114": string;
        "115": string;
        "116": string;
        "117": string;
        "118": string;
        "119": string;
        "120": string;
        "121": string;
        "122": string;
        "123": string;
        "124": string;
        "125": string;
        "126": string;
        "127": string;
        "128": string;
        "129": string;
        "130": string;
        "131": string;
        "132": string;
        "133": string;
        "134": string;
        "135": string;
        "136": string;
        "137": string;
        "138": string;
        "139": string;
        "140": string;
        "141": string;
        "142": string;
        "143": string;
        "144": string;
        "145": string;
        "146": string;
        "147": string;
        "148": string;
        "149": string;
        "150": string;
        "151": string;
        "152": string;
        "153": string;
        "154": string;
        "155": string;
        "156": string;
        "157": string;
        "158": string;
        "159": string;
        "160": string;
        "161": string;
        "162": string;
        "163": string;
        "164": string;
        "165": string;
        "166": string;
        "167": string;
        "168": string;
        "169": string;
        "170": string;
        "171": string;
        "172": string;
        "173": string;
        "174": string;
        "175": string;
        "176": string;
        "177": string;
        "178": string;
        "179": string;
        "180": string;
        "181": string;
        "182": string;
        "183": string;
        "184": string;
        "185": string;
        "186": string;
        "187": string;
        "188": string;
        "189": string;
        "190": string;
        "191": string;
        "192": string;
        "193": string;
        "194": string;
        "195": string;
        "196": string;
        "197": string;
        "198": string;
        "199": string;
        "200": string;
        "201": string;
        "202": string;
        "203": string;
        "204": string;
        "205": string;
        "206": string;
        "207": string;
        "208": string;
        "209": string;
        "210": string;
        "211": string;
        "212": string;
        "213": string;
        "214": string;
        "215": string;
        "216": string;
        "217": string;
        "218": string;
        "219": string;
        "220": string;
        "221": string;
        "222": string;
        "223": string;
        "224": string;
        "225": string;
        "226": string;
        "227": string;
        "228": string;
        "229": string;
        "230": string;
        "231": string;
        "232": string;
        "233": string;
        "234": string;
        "235": string;
        "236": string;
        "237": string;
        "238": string;
        "239": string;
        "240": string;
        "241": string;
        "242": string;
        "243": string;
        "244": string;
        "245": string;
        "246": string;
        "247": string;
        "248": string;
        "249": string;
        "250": string;
        "251": string;
        "252": string;
        "253": string;
        "254": string;
        "255": string;
        "256": string;
        "257": string;
        "258": string;
        "259": string;
        "260": string;
        "261": string;
        "262": string;
        "263": string;
        "264": string;
        "265": string;
        "266": string;
        "267": string;
        "268": string;
        "269": string;
        "270": string;
        "271": string;
        "272": string;
        "273": string;
        "274": string;
        "275": string;
        "276": string;
        "277": string;
        "278": string;
        "279": string;
        "280": string;
        "281": string;
        "282": string;
        "283": string;
        "284": string;
        "285": string;
        "286": string;
        "287": string;
        "288": string;
        "289": string;
        "290": string;
        "291": string;
        "292": string;
        "293": string;
        "294": string;
        "295": string;
        "296": string;
        "297": string;
        "298": string;
        "299": string;
        "300": string;
        "301": string;
        "302": string;
        "303": string;
        "304": string;
        "305": string;
        "306": string;
        "307": string;
        "308": string;
        "309": string;
        "310": string;
        "311": string;
        "312": string;
        "313": string;
        "314": string;
        "315": string;
        "316": string;
        "317": string;
        "318": string;
        "319": string;
        "320": string;
        "321": string;
        "322": string;
        "323": string;
        "324": string;
        "325": string;
        "326": string;
        "327": string;
        "328": string;
        "329": string;
        "330": string;
        "331": string;
        "332": string;
        "333": string;
        "334": string;
        "335": string;
        "336": string;
        "337": string;
        "338": string;
        "339": string;
        "340": string;
        "341": string;
        "342": string;
        "343": string;
        "344": string;
        "345": string;
        "346": string;
        "347": string;
        "348": string;
        "349": string;
        "350": string;
        "351": string;
        "352": string;
        "353": string;
        "354": string;
        "355": string;
        "356": string;
        "357": string;
        "358": string;
        "359": string;
        "360": string;
        "361": string;
        "362": string;
        "363": string;
        "364": string;
        "365": string;
        "366": string;
        "367": string;
        "368": string;
        "369": string;
        "370": string;
        "371": string;
        "372": string;
        "373": string;
        "374": string;
        "375": string;
        "376": string;
        "377": string;
        "378": string;
        "379": string;
        "380": string;
        "381": string;
        "382": string;
        "383": string;
        "384": string;
        "385": string;
        "386": string;
        "387": string;
        "388": string;
        "389": string;
        "390": string;
        "391": string;
        "392": string;
        "393": string;
        "394": string;
        "395": string;
        "396": string;
        "397": string;
        "398": string;
        "399": string;
        "400": string;
        "401": string;
        "402": string;
        "403": string;
        "404": string;
        "405": string;
        "406": string;
        "407": string;
        "408": string;
        "409": string;
        "410": string;
        "411": string;
        "412": string;
        "413": string;
        "414": string;
        "415": string;
        "416": string;
        "417": string;
        "418": string;
        "419": string;
        "420": string;
        "421": string;
        "422": string;
        "423": string;
        "424": string;
        "425": string;
        "426": string;
        "427": string;
        "428": string;
        "429": string;
        "430": string;
        "431": string;
        "432": string;
        "433": string;
        "434": string;
        "435": string;
        "436": string;
        "437": string;
        "438": string;
        "439": string;
        "440": string;
        "441": string;
        "442": string;
        "443": string;
        "444": string;
        "445": string;
        "446": string;
        "447": string;
        "448": string;
        "449": string;
        "450": string;
        "451": string;
        "452": string;
        "453": string;
        "454": string;
        "455": string;
        "456": string;
        "457": string;
        "458": string;
        "459": string;
        "460": string;
        "461": string;
        "462": string;
        "463": string;
        "464": string;
        "465": string;
        "466": string;
        "467": string;
        "468": string;
        "469": string;
        "470": string;
        "471": string;
        "472": string;
        "473": string;
        "474": string;
        "475": string;
        "476": string;
        "477": string;
        "478": string;
        "479": string;
        "480": string;
        "481": string;
        "482": string;
        "483": string;
        "484": string;
        "485": string;
        "486": string;
        "487": string;
        "488": string;
        "489": string;
        "490": string;
        "491": string;
        "492": string;
        "493": string;
        "494": string;
        "495": string;
        "496": string;
        "497": string;
        "498": string;
        "499": string;
        "500": string;
        "501": string;
        "502": string;
        "503": string;
        "504": string;
        "505": string;
        "506": string;
        "507": string;
        "508": string;
        "509": string;
        "510": string;
        "511": string;
        "512": string;
        "513": string;
        "514": string;
        "515": string;
        "516": string;
        "2_39Ash": number;
        "2_41Ash": number;
        "2_40Ash": number;
        "2_42Ash": number;
        "2_43Ash": number;
        "2_44Ash": number;
        "2_1Ash": number;
        "2_4Ash": number;
        "2_5Ash": number;
        "2_30Ash": number;
        "2_28Ash": number;
        "2_29Ash": number;
        "4_1Ash": number;
        "4_2Ash": number;
        "4_3Ash": number;
        "4_56Jungle": number;
        "4_57Jungle": number;
        "4_58Jungle": number;
        "4_59Jungle": number;
        "9_5Jungle": number;
        "9_6Jungle": number;
        "9_7Jungle": number;
        "4_51Jungle": number;
        "4_52Jungle": number;
        "4_54Jungle": number;
        "4_53Jungle": number;
        "9_1Jungle": number;
        "9_2Jungle": number;
        "9_3Jungle": number;
        "9_4Jungle": number;
        "4_12Jungle": number;
        "4_13Jungle": number;
        "4_1Jungle": number;
        "4_3Jungle": number;
        "4_2Jungle": number;
        "4_5Jungle": number;
        "4_4Jungle": number;
        "4_9Jungle": number;
        "4_10Jungle": number;
        "5_5Jungle": number;
        "5_7Jungle": number;
        "5_6Jungle": number;
        "5_9Jungle": number;
        "5_8Jungle": number;
        "4_6Jungle": number;
        "4_7Jungle": number;
        "4_17Jungle": number;
        "13_4Jungle": number;
        "11_5Jungle": number;
        "11_6Jungle": number;
        "11_7Jungle": number;
        "11_8Jungle": number;
        "11_10Jungle": number;
        "11_11Jungle": number;
        "11_12Jungle": number;
        "7_4Platform": number;
        "7_5Platform": number;
        "7_6Platform": number;
        "7_1Platform": number;
        "7_2Platform": number;
        "7_3Platform": number;
        "7_9Platform": number;
        "7_10Platform": number;
        "7_8Platform": number;
        "7_7Platform": number;
        "7_26Platform": number;
        "7_24Platform": number;
        "7_28Platform": number;
        "7_27Platform": number;
        "7_25Platform": number;
        "7_29Platform": number;
        "7_30Platform": number;
        "7_31Platform": number;
        "12_1Platform": number;
        "9_27Platform": number;
        "5_54Badlands": number;
        "5_55Badlands": number;
        "5_56Badlands": number;
        "5_57Badlands": number;
        "6_16Badlands": number;
        "6_17Badlands": number;
        "6_20Badlands": number;
        "6_21Badlands": number;
        "5_10Badlands": number;
        "5_50Badlands": number;
        "5_52Badlands": number;
        "5_53Badlands": number;
        "5_51Badlands": number;
        "6_3Badlands": number;
        "11_3Badlands": number;
        "11_8Badlands": number;
        "11_6Badlands": number;
        "11_7Badlands": number;
        "11_9Badlands": number;
        "11_10Badlands": number;
        "11_11Badlands": number;
        "11_12Badlands": number;
        "11_13Badlands": number;
        "11_14Badlands": number;
        "1_13Badlands": number;
        "1_9Badlands": number;
        "1_11Badlands": number;
        "1_14Badlands": number;
        "1_10Badlands": number;
        "1_12Badlands": number;
        "1_15Badlands": number;
        "1_7Badlands": number;
        "1_5Badlands": number;
        "1_16Badlands": number;
        "1_8Badlands": number;
        "1_6Badlands1": number;
        "1_6Badlands2": number;
        "1_6Badlands3": number;
        "1_6Badlands4": number;
        "1_6Badlands5": number;
        "1_6Badlands6": number;
        "1_6Badlands7": number;
        "1_6Badlands8": number;
        "4_15Installation1": number;
        "4_15Installation2": number;
        "3_9Installation": number;
        "3_10Installation": number;
        "3_11Installation": number;
        "3_12Installation": number;
        "1_6Badlands9": number;
        "1_6Badlands10": number;
        "3_1Installation": number;
        "3_2Installation": number;
        "1_6Badlands11": number;
        scourge: number;
        scourgeDeath: number;
        scourgeExplosion: number;
        broodling: number;
        broodlingRemnants: number;
        infestedTerran: number;
        infestedTerranExplosion: number;
        guardianCocoon: number;
        defiler: number;
        defilerRemnants: number;
        drone: number;
        droneRemnants: number;
        egg: number;
        eggRemnants: number;
        guardian: number;
        guardianDeath: number;
        hydralisk: number;
        hydraliskRemnants: number;
        infestedKerrigan: number;
        larva: number;
        larvaRemnants: number;
        mutalisk: number;
        mutaliskDeath: number;
        overlord: number;
        overlordDeath: number;
        queen: number;
        queenDeath: number;
        ultralisk: number;
        ultraliskRemnants: number;
        zergling: number;
        zerglingRemnants: number;
        cerebrate: number;
        infestedCommandCenter: number;
        spawningPool: number;
        matureChrysalis: number;
        evolutionChamber: number;
        creepColony: number;
        hatchery: number;
        hive: number;
        lair: number;
        sunkenColony: number;
        greaterSpire: number;
        defilerMound: number;
        "queen'sNest": number;
        nydusCanal: number;
        overmindWithShell: number;
        overmindWithoutShell: number;
        ultraliskCavern: number;
        extractor: number;
        hydraliskDen: number;
        spire: number;
        sporeColony: number;
        zergBuildingSpawnSmall: number;
        zergBuildingSpawnMedium: number;
        zergBuildingSpawnLarge: number;
        zergBuildingExplosion: number;
        zergBuildingRubbleSmall: number;
        zergBuildingRubbleLarge: number;
        arbiter: number;
        archonEnergy: number;
        carrier: number;
        dragoon: number;
        dragoonRemnants: number;
        interceptor: number;
        probe: number;
        scout: number;
        shuttle: number;
        highTemplar: number;
        darkTemplarHero: number;
        reaver: number;
        scarab: number;
        zealot: number;
        observer: number;
        templarArchives: number;
        assimilator: number;
        observatory: number;
        citadelofAdun: number;
        forge: number;
        gateway: number;
        cyberneticsCore: number;
        khaydarinCrystalFormation: number;
        nexus: number;
        photonCannon: number;
        arbiterTribunal: number;
        pylon: number;
        roboticsFacility: number;
        shieldBattery: number;
        stargate: number;
        stasisCell_Prison: number;
        roboticsSupportBay: number;
        protossTemple: number;
        fleetBeacon: number;
        explosionLarge: number;
        protossBuildingRubbleSmall: number;
        protossBuildingRubbleLarge: number;
        battlecruiser: number;
        civilian: number;
        dropship: number;
        firebat: number;
        ghost: number;
        ghostRemnants: number;
        nukeTargetDot: number;
        goliathBase: number;
        goliathTurret: number;
        sarahKerrigan: number;
        marine: number;
        marineRemnants: number;
        scannerSweep: number;
        wraith: number;
        sCV: number;
        siegeTankTankBase: number;
        siegeTankTankTurret: number;
        siegeTankSiegeBase: number;
        siegeTankSiegeTurret: number;
        vulture: number;
        spiderMine: number;
        scienceVesselBase: number;
        scienceVesselTurret: number;
        terranAcademy: number;
        barracks: number;
        armory: number;
        comsatStation: number;
        commandCenter: number;
        supplyDepot: number;
        controlTower: number;
        factory: number;
        covertOps: number;
        ionCannon: number;
        machineShop: number;
        missileTurretBase: number;
        crashedBatlecruiser: number;
        physicsLab: number;
        bunker: number;
        refinery: number;
        scienceFacility: number;
        nuclearSilo: number;
        nuclearMissile: number;
        nukeHit: number;
        starport: number;
        engineeringBay: number;
        terranConstructionLarge: number;
        terranConstructionSmall: number;
        buildingExplosionLarge: number;
        terranBuildingRubbleSmall: number;
        terranBuildingRubbleLarge: number;
        vespeneGeyser: number;
        ragnasaurAsh: number;
        rhynadonBadlands: number;
        bengalaasJungle: number;
        mineralFieldType1: number;
        mineralFieldType2: number;
        mineralFieldType3: number;
        independentStarportUnused: number;
        zergBeacon: number;
        terranBeacon: number;
        protossBeacon: number;
        darkSwarm: number;
        flag: number;
        youngChrysalis: number;
        psiEmitter: number;
        dataDisc: number;
        khaydarinCrystal: number;
        mineralChunkType1: number;
        mineralChunkType2: number;
        protossGasOrbType1: number;
        protossGasOrbType2: number;
        zergGasSacType1: number;
        zergGasSacType2: number;
        terranGasTankType1: number;
        terranGasTankType2: number;
        whiteCircleInvisible: number;
        startLocation: number;
        mapRevealer: number;
        floorGunTrap: number;
        wallMissileTrap: number;
        wallMissileTrap2: number;
        wallFlameTrap: number;
        wallFlameTrap2: number;
        floorMissileTrap: number;
        longbolt_GeminiMissilesTrail: number;
        grenadeShotSmoke: number;
        vespeneGeyserSmoke1: number;
        vespeneGeyserSmoke2: number;
        vespeneGeyserSmoke3: number;
        vespeneGeyserSmoke4: number;
        vespeneGeyserSmoke5: number;
        smallExplosionUnused: number;
        doubleExplosion: number;
        cursorMarker: number;
        eggSpawn: number;
        highTemplarGlow: number;
        psiFieldRightUpper: number;
        burrowingDust: number;
        buildingLandingDustType1: number;
        buildingLandingDustType2: number;
        buildingLandingDustType3: number;
        buildingLandingDustType4: number;
        buildingLandingDustType5: number;
        buildingLiftingDustType1: number;
        buildingLiftingDustType2: number;
        buildingLiftingDustType3: number;
        buildingLiftingDustType4: number;
        needleSpines: number;
        dualPhotonBlastersHit: number;
        particleBeamHit: number;
        "anti-MatterMissile": number;
        pulseCannon: number;
        phaseDisruptor: number;
        sTA_STSPhotonCannonOverlay: number;
        psionicStorm: number;
        fusionCutterHit: number;
        gaussRifleHit: number;
        geminiMissiles: number;
        fragmentationGrenade: number;
        magnaPulseUnused: number;
        "lockdown_LongBolt/HellfireMissile": number;
        "c-10CanisterRifleHit": number;
        aTS_ATALaserBattery: number;
        burstLasers: number;
        arcliteShockCannonHit: number;
        yamatoGun: number;
        yamatoGunTrail: number;
        eMPShockwaveMissile: number;
        needleSpineHit: number;
        plasmaDripHitUnused: number;
        sunkenColonyTentacle: number;
        venomUnusedZergWeapon: number;
        acidSpore: number;
        glaveWurm: number;
        seekerSpores: number;
        queenSpellHolder: number;
        stasisFieldHit: number;
        plagueCloud: number;
        consume: number;
        ensnare: number;
        glaveWurm_SeekerSporesHit: number;
        psionicShockwaveHit: number;
        glaveWurmTrail: number;
        seekerSporesOverlay: number;
        phaseDisruptorUnused: number;
        whiteCircle: number;
        acidSprayUnused: number;
        plasmaDripUnused: number;
        "scarab_Anti-MatterMissileOverlay": number;
        hallucinationDeath1: number;
        hallucinationDeath2: number;
        hallucinationDeath3: number;
        bunkerOverlay: number;
        flameThrower: number;
        recallField: number;
        scannerSweepHit: number;
        leftUpperLevelDoor: number;
        rightUpperLevelDoor: number;
        substructureLeftDoor: number;
        substructureRightDoor: number;
        substructureOpeningHole: number;
        "7_13Twilight": number;
        "7_14Twilight": number;
        "7_16Twilight": number;
        "7_15Twilight": number;
        "7_19Twilight": number;
        "7_20Twilight": number;
        "7_21Twilight": number;
        unknownTwilight: number;
        "7_17Twilight": number;
        "6_1Twilight": number;
        "6_2Twilight": number;
        "6_3Twilight": number;
        "6_4Twilight": number;
        "6_5Twilight": number;
        "8_3Twilight": number;
        "9_29Ice": number;
        "9_28Ice": number;
        "12_38Ice": number;
        "12_37Ice": number;
        "12_33Ice": number;
        "9_21Ice": number;
        "9_15Ice": number;
        "9_16Ice": number;
        unknown410: number;
        unknown411: number;
        "12_9Ice1": number;
        "12_10Ice": number;
        "9_24Ice": number;
        "9_23Ice": number;
        unknown416: number;
        "12_7Ice": number;
        "12_8Ice": number;
        "12_9Ice2": number;
        "12_40Ice": number;
        "12_41Ice": number;
        "12_42Ice": number;
        "12_5Ice": number;
        "12_6Ice": number;
        "12_36Ice": number;
        "12_32Ice": number;
        "12_34Ice": number;
        "12_24Ice": number;
        "12_25Ice": number;
        "9_22Ice": number;
        "12_31Ice": number;
        "12_20Ice": number;
        "12_30Ice": number;
        unknown439: number;
        "4_1Ice": number;
        "6_1Ice": number;
        "5_6Ice": number;
        "5_7Ice": number;
        "5_8Ice": number;
        "5_9Ice": number;
        "10_10Desert1": number;
        "10_12Desert1": number;
        "10_8Desert": number;
        "10_9Desert1": number;
        "6_10Desert": number;
        "6_13Desert": number;
        unknownDesert: number;
        "10_12Desert2": number;
        "10_9Desert2": number;
        "10_10Desert2": number;
        "10_11Desert": number;
        "10_14Desert": number;
        "10_41Desert": number;
        "10_39Desert": number;
        "10_6Desert": number;
        "10_7Desert": number;
        "4_6Desert": number;
        "4_11Desert": number;
        "4_10Desert": number;
        "4_9Desert": number;
        "4_7Desert": number;
        "4_12Desert": number;
        "4_8Desert": number;
        "4_13Desert": number;
        "4_17Desert": number;
        "6_20Desert": number;
        "4_15Desert1": number;
        "4_15Desert2": number;
        "10_23Desert": number;
        "8_23Desert": number;
        "10_5Desert": number;
        "12_1DesertOverlay": number;
        "11_3Desert": number;
        lurkerEgg: number;
        devourer: number;
        devourerDeath: number;
        lurkerRemnants: number;
        lurker: number;
        darkArchonEnergy: number;
        corsair: number;
        darkTemplarUnit: number;
        medic: number;
        medicRemnants: number;
        valkyrie: number;
        scantidDesert: number;
        kakaruTwilight: number;
        ursadonIce: number;
        overmindCocoon: number;
        powerGenerator: number;
        "xel'NagaTemple": number;
        psiDisrupter: number;
        warpGate: number;
        feedbackHitSmall: number;
        feedbackHitMedium: number;
        feedbackHitLarge: number;
        disruptionWeb: number;
        haloRocketsTrail: number;
        neutronFlare: number;
        neutronFlareOverlayUnused: number;
        opticalFlareGrenade: number;
        haloRockets: number;
        subterraneanSpinesHit: number;
        subterraneanSpines: number;
        corrosiveAcidShot: number;
        corrosiveAcidHit: number;
        maelstromHit: number;
        uraj: number;
        khalis: number;
    };
}
declare module "unit-type-flags" {
    export enum UnitTypeFlags {
        isBuilding = 0,
        isAddon = 1,
        isFlyer = 2,
        isResourceMine = 3,
        isTurret = 4,
        isFlyingBuilding = 5,
        isHero = 6,
        regenerates = 7,
        animatedIdle = 8,
        cloakable = 9,
        twoUnitsInOneEgg = 10,
        singleEntity = 11,
        isResourceDepot = 12,
        isResourceContainer = 13,
        isRobotic = 14,
        isDetector = 15,
        isOrganic = 16,
        requiresCreep = 17,
        unusedFlag = 18,
        requiresPsi = 19,
        burrowable = 20,
        isSpellcaster = 21,
        permanentCloak = 22,
        pickupItem = 23,
        ignoreSupplyCheck = 24,
        useMediumOverlays = 25,
        useLargeOverlays = 26,
        battleReactions = 27,
        fullAutoAttack = 28,
        invincible = 29,
        isMechanical = 30,
        producesUnits = 31
    }
}
declare module "game-types" {
    export enum GameTypes {
        None = 0,
        Melee = 2,
        FFA = 3,
        OneVersusOne = 4,
        CTF = 5,
        Greed = 6,
        Slaughter = 7,
        SuddenDeath = 8,
        Ladder = 9,
        UMS = 10,
        TeamMelee = 11,
        TeamCTF = 12,
        TVB = 15,
        IronManLadder = 16
    }
}
declare module "index" {
    export * from "abilities-map";
    export * from "behaviours";
    export * from "commands";
    export * from "damage-ratios";
    export * from "char-color";
    export * from "damages-types";
    export * from "draw-functions";
    export * from "explosions";
    export * from "flingy-control";
    export * from "image-types";
    export * from "iscript-headers";
    export * from "orders";
    export * from "overlay-types";
    export * from "player-colors";
    export * from "player-palette";
    export * from "races";
    export * from "right-click-actions";
    export * from "selection-circle-size";
    export * from "shield-size";
    export * from "tech-types";
    export * from "tileset-names";
    export * from "unit-size";
    export * from "unit-types";
    export * from "unit-flags";
    export * from "upgrades";
    export * from "image-flags";
    export * from "sprite-flags";
    export * from "bullet-state";
    export * from "weapon-types";
    export * from "weapon-behavior";
    export * from "sprite-types";
    export * from "unit-type-flags";
    export * from "game-types";
}
