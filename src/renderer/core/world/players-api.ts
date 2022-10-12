import { Players } from "@core/players";
import { Borrowed } from "@utils/object-utils";
import { Color } from "three";
import { World } from "./world";

export const createPlayersGameTimeApi = (_players: WeakRef<Players>, { players: basePlayers, fogOfWar }: Borrowed<World>) => {

    const players = () => _players.deref()!;

    return {
        setPlayerColors(colors: string[]) {
            players().setPlayerColors(colors);
        },
        getPlayerColor: (id: number) => {
            return players().get(id)?.color ?? new Color(1, 1, 1);
        },
        getOriginalColors() {
            return players().originalColors;
        },
        setPlayerNames(...args: Parameters<Players["setPlayerNames"]>) {
            players().setPlayerNames(...args);
        },
        getOriginalNames() {
            return players().originalNames;
        },
        getPlayers: () => [...basePlayers!.map(p => ({ ...p }))],
        toggleFogOfWarByPlayerId(playerId: number) {
            if (players().toggleFogOfWarByPlayerId(playerId)) {
                fogOfWar!.forceInstantUpdate = true;
            }
        },
    }
}