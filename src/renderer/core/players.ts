import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { Player } from "common/types";
import { Color  } from "three";

const makeColor = ( color: string ) => new Color().setStyle( color );
const makeColors = ( players: Pick<BasePlayer, "color">[] ) =>
    players.map( ( { color } ) => makeColor( color ) );

/**
 * @public
 */
export interface BasePlayer {
    id: number;
    name: string;
    color: string;
    race: string;
}

export type PlayerName = Pick<BasePlayer, "id" | "name">;

export class Players extends Array<Player> {
    #playersById: Record<number, Player> = {};
    #originalColors: readonly string[];
    originalNames: readonly PlayerName[];

    #visionFlags = 0;

    constructor( players: BasePlayer[] ) {
        super();

        this.#originalColors = Object.freeze( players.map( ( player ) => player.color ) );
        this.originalNames = Object.freeze(
            players.map( ( player ) =>
                Object.freeze( {
                    id: player.id,
                    name: player.name,
                } )
            )
        );

        const colors = makeColors( players );
        const visionChanged = () => this.#visionChanged();

        this.push(
            ...players.map( ( player, i ) => ( {
                color: colors[i],
                id: player.id,
                name: player.name,
                race: player.race,
                startLocation: undefined,
                _vision: true,
                get vision() {
                    return this._vision;
                },
                set vision( vision ) {
                    this._vision = vision;
                    visionChanged();
                },
            } ) )
        );

        for ( const player of this ) {
            this.#playersById[player.id] = player;
        }

        visionChanged();
    }

    get( id: number ): Player | undefined {
        return this.#playersById[id];
    }

    static override get [Symbol.species]() {
        return Array;
    }

    #visionChanged() {
        this.#visionFlags = 0;
        for ( const player of this ) {
            if ( player.vision ) {
                this.#visionFlags |= 1 << player.id;
            }
        }
    }

    togglePlayerVision( id: number ) {
        const player = this.get( id );
        if ( player ) {
            player.vision = !player.vision;
        }
    }

    getVisionFlag() {
        return this.#visionFlags;
    }

    setColors = ( colors: readonly string[] ) => {
        const replay = useReplayAndMapStore.getState().replay;
        if ( replay ) {
            for ( let i = 0; i < this.length; i++ ) {
                replay.header.players[i].color = colors[i];
                this[i].color = makeColor( colors[i] );
            }
            useReplayAndMapStore.setState( { replay: { ...replay } } );
        }
    };

    resetColors() {
        this.setColors( this.#originalColors );
    }

    setNames( players: PlayerName[] ) {
        const replay = useReplayAndMapStore.getState().replay;

        if ( replay ) {
            for ( const player of players ) {
                const replayPlayer = replay.header.players.find(
                    ( p ) => p.id === player.id
                );
                if ( replayPlayer ) {
                    replayPlayer.name = player.name;
                    this.get( player.id )!.name = player.name;
                }
            }
            useReplayAndMapStore.setState( { replay: { ...replay } } );
        }
    }
}
