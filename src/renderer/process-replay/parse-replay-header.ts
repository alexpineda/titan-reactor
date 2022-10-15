import cstring from "./util/cstring";

export interface ReplayPlayer {
    id: number;
    name: string;
    race: "zerg" | "terran" | "protoss" | "unknown";
    team: number;
    color: string;

    isComputer: boolean;
    isHuman: boolean;
    isActive: boolean;
}

const parseHeader = ( buf: Buffer ) => {
    let pos = 0;
    const nextUint8 = () => {
        const v = buf.readUInt8( pos );
        pos = pos + 1;
        return v;
    };
    const nextUint16 = () => {
        const v = buf.readInt16LE( pos );
        pos = pos + 2;
        return v;
    };
    const nextUint32 = () => {
        const v = buf.readUInt32LE( pos );
        pos = pos + 4;
        return v;
    };
    const next = ( n: number ) => {
        const v = buf.slice( pos, pos + n );
        pos = pos + n;
        return v;
    };

    const isBroodwar = nextUint8();
    const frameCount = nextUint32();
    const campaignId = nextUint16();
    const commandByte = nextUint8();

    const randomSeed = nextUint32();
    const playerBytes = next( 8 );
    const unk1 = nextUint32();
    const playerName = next( 24 );

    const gameFlags = nextUint32();
    const mapWidth = nextUint16();
    const mapHeight = nextUint16();
    const activePlayerCount = nextUint8();

    const slotCount = nextUint8();
    const gameSpeed = nextUint8();
    const gameState = nextUint8();
    const gameType = nextUint16();

    const gameSubtype = nextUint16();
    const unk2 = nextUint32();
    const tileset = nextUint16();
    const replayAutoSave = nextUint8();

    const computerPlayerCount = nextUint8();
    const gameName = cstring( next( 25 ) );
    const mapName = cstring( next( 32 ) );
    const unk3 = nextUint16();

    const unk4 = nextUint16();
    const unk5 = nextUint16();
    const unk6 = nextUint16();
    const victoryCondition = nextUint8();

    const resourceType = nextUint8();
    const useStandardUnitStats = nextUint8();
    const fogOfWarEnabled = nextUint8();
    const createInitialUnits = nextUint8();

    const useFixedPositions = nextUint8();
    const restrictionFlags = nextUint8();
    const alliesEnabled = nextUint8();
    const teamsEnabled = nextUint8();

    const cheatsEnabled = nextUint8();
    const tournamentMode = nextUint8();
    const victoryConditionValue = nextUint32();
    const startingMinerals = nextUint32();

    const startingGas = nextUint32();
    const unk7 = nextUint8();

    const raceStr = ( race: number ) => {
        switch ( race ) {
            case 0:
                return "zerg";
            case 1:
                return "terran";
            case 2:
                return "protoss";
            default:
                return "unknown";
        }
    };

    const playerColors = [
        "#f40404",
        "#0c48cc",
        "#2cb494",
        "#88409c",
        "#f88c14",
        "#703014",
        "#cce0d0",
        "#fcfc38",
        "#088008",
        "#fcfc7c",
        "#ecc4b0",
        "#4068d4",
        "#74a47c",
        "#9090b8",
        "#fcfc7c",
        "#00e4fc",
    ];

    const players: ReplayPlayer[] = [];
    const getPlayerColor = ( p: number ) => {
        if ( p < 8 ) {
            return playerColors[p]!;
        } else {
            return playerColors[0x6]!;
        }
    };

    for ( let i = 0; i < 8; i++ ) {
        const offset = 0xa1 + 0x24 * i;
        const type = buf.readUInt8( offset + 0x8 );
        players.push( {
            id: buf.readUInt32LE( offset ),
            isComputer: type === 1,
            isHuman: type === 2,
            isActive: type === 1 || type === 2,
            race: raceStr( buf.readUInt8( offset + 0x9 ) ),
            name: cstring( buf.slice( offset + 0xb, offset + 0xb + 0x19 ) ),
            team: buf.readUInt8( offset + 0xa ),
            color: getPlayerColor( buf.readUInt32LE( 0x251 + i * 4 ) ),
        } );
    }
    return {
        isBroodwar,
        gameName,
        mapName,
        gameType,
        gameSubtype,
        players,
        frameCount,
        randomSeed,
        ancillary: {
            campaignId,
            commandByte,
            playerBytes,
            unk1,
            playerName,
            gameFlags,
            mapWidth,
            mapHeight,
            activePlayerCount,
            slotCount,
            gameSpeed,
            gameState,
            unk2,
            tileset,
            replayAutoSave,
            computerPlayerCount,
            unk3,
            unk4,
            unk5,
            unk6,
            victoryCondition,
            resourceType,
            useStandardUnitStats,
            fogOfWarEnabled,
            createInitialUnits,
            useFixedPositions,
            restrictionFlags,
            alliesEnabled,
            teamsEnabled,
            cheatsEnabled,
            tournamentMode,
            victoryConditionValue,
            startingMinerals,
            startingGas,
            unk7,
        },
    };
};

export type ReplayHeader = ReturnType<typeof parseHeader>;
export default parseHeader;
