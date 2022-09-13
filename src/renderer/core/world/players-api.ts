import { FogOfWar } from "@core/fogofwar";
import { BasePlayer, Players } from "@core/players";
import { Color } from "three";

export const createPlayersGameTimeApi = (players: Players, basePlayers: BasePlayer[], fogOfWar: FogOfWar) => {

    return {
        setPlayerColors(colors: string[]) {
            players.setPlayerColors(colors);
        },
        getPlayerColor: (id: number) => {
            return players.get(id)?.color ?? new Color(1, 1, 1);
        },
        getOriginalColors() {
            return players.originalColors;
        },
        setPlayerNames(...args: Parameters<Players["setPlayerNames"]>) {
            players.setPlayerNames(...args);
        },
        getOriginalNames() {
            return players.originalNames;
        },
        getPlayers: () => [...basePlayers.map(p => ({ ...p }))],
        toggleFogOfWarByPlayerId(playerId: number) {
            if (players.toggleFogOfWarByPlayerId(playerId)) {
                fogOfWar.forceInstantUpdate = true;
            }
        },
    }
}