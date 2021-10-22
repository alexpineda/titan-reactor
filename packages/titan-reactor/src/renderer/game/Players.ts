import { Player } from "../../common/types/player";
import { PlayerColor } from "../../common/types/colors";
import { StartLocation } from "../../common/types/chk";
import { ReplayPlayer } from "../../common/types/replay";

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
        showActions: false,
        showPov: false,
        vision: true,
        startLocation: startLocations.find((u) => u.player == player.id),
      }))
    );

    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  static override get [Symbol.species]() {
    return Array;
  }
}
