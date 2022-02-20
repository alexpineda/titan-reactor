import { Unit } from ".";
import {
  Player,
  PlayerColor,
  ReplayPlayer,
  StartLocation,
  PlayerPOVI,
  POVSelectionI,
} from "../../common/types";

class POVSelection implements POVSelectionI {
  lastIssuedCommand?: any;
  unit: Unit;
  constructor(unit: Unit) {
    this.unit = unit;
  }
}

class PlayerPOV implements PlayerPOVI {
  selections: POVSelection[] = [];
  active = false;
}

const _pVision = (p: Player) => {
  return p.vision;
}

const _gFlags = (flags: number, { id }: Pick<Player, "id">) => {
  return (flags |= 1 << id);
}

export class Players extends Array<Player> {
  activePovs = 0;
  playersById: Record<number, Player> = {};

  constructor(
    players: ReplayPlayer[],
    startLocations: StartLocation[],
    colors: PlayerColor[]
  ) {
    super();
    this.activePovs = 0;

    this.push(
      ...players.map((player, i) => ({
        color: colors[i],
        originalColor: colors[i],
        id: player.id,
        name: player.name,
        race: player.race,
        vision: true,
        startLocation: startLocations.find((u) => u.player == player.id),
        pov: new PlayerPOV(),
      }))
    );

    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  //  @todo update pov selections based on command
  // update(cmds) {

  // }
  static override get [Symbol.species]() {
    return Array;
  }


  getVisionFlag() {
    return this.filter(_pVision)
      .reduce(_gFlags, 0);
  }
}
