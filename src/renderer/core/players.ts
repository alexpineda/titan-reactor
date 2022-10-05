import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import {
  Player,
} from "common/types";
import { Color } from "three";

const _pVision = (p: Player) => {
  return p.vision;
}

const _gFlags = (flags: number, { id }: Pick<Player, "id">) => {
  return (flags |= 1 << id);
}

const makeColor = (color: string) => new Color().setStyle(color);
const makeColors = (players: Pick<BasePlayer, "color">[]) => players.map(
  ({ color }) => makeColor(color)
);

export type BasePlayer = {
  id: number, name: string, color: string, race: string
}

export type PlayerName = Pick<BasePlayer, "id" | "name">

export class Players extends Array<Player> {
  playersById: Record<number, Player> = {};
  originalColors: readonly string[];
  originalNames: readonly PlayerName[];

  constructor(
    players: BasePlayer[]
  ) {
    super();

    this.originalColors = Object.freeze(players.map(player => player.color));
    this.originalNames = Object.freeze(players.map(player => Object.freeze({
      id: player.id,
      name: player.name
    })));

    const colors = makeColors(players);

    this.push(
      ...players.map((player, i) => ({
        color: colors[i],
        id: player.id,
        name: player.name,
        race: player.race,
        vision: true,
      }))
    );

    for (const player of this) {
      this.playersById[player.id] = player;
    }
  }

  get(id: number): Player | undefined {
    return this.playersById[id];
  }

  static override get [Symbol.species]() {
    return Array;
  }

  getVisionFlag() {
    return this.filter(_pVision)
      .reduce(_gFlags, 0);
  }

  setPlayerColors = (colors: string[]) => {
    const replay = useReplayAndMapStore.getState().replay;
    if (replay) {
      for (let i = 0; i < this.length; i++) {
        replay.header.players[i].color = colors[i];
        this[i].color = makeColor(colors[i]);
      }
      useReplayAndMapStore.setState({ replay: { ...replay } })
    }
  }

  setPlayerNames(players: PlayerName[]) {
    const replay = useReplayAndMapStore.getState().replay;

    if (replay) {
      for (const player of players) {
        const replayPlayer = replay.header.players.find(p => p.id === player.id);
        if (replayPlayer) {
          replayPlayer.name = player.name;
        }
      }
      useReplayAndMapStore.setState({ replay: { ...replay } })
    }
  }

  toggleFogOfWarByPlayerId(playerId: number) {
    const player = this.find(p => p.id === playerId);
    if (player) {
      player.vision = !player.vision;
      return true;
    }
    return false;
  }
}
