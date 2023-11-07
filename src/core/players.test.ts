import { describe, it, jest } from "@jest/globals";
import { BasePlayer, Players } from "./players";
import * as replayMapStore from "@stores/replay-and-map-store";

jest.mock( "@stores/replay-and-map-store" );

describe( "Players", () => {
    it( "should initialize structs in constructor", () => {
        const fixture: BasePlayer[] = [
            {
                color: "red",
                id: 3,
                name: "Foo",
                race: "zerg",
            },
        ];
        const players = new Players( fixture );

        expect( players.originalNames ).toEqual( [ { id: 3, name: "Foo" } ] );
        expect( players.get( 3 ) ).toBe( players[0] );
        expect( players.get( 3 )!.name ).toBe( "Foo" );
    } );

    it( "should update vision flag if changed on a player", () => {
        const fixture: BasePlayer[] = [
            {
                color: "red",
                id: 0,
                name: "Player 2",
                race: "zerg",
            },
            {
                color: "red",
                id: 3,
                name: "Player 1",
                race: "zerg",
            },
        ];
        const players = new Players( fixture );

        expect( players.getVisionFlag() ).toBe( 9 );
        players.togglePlayerVision( 3 );
        expect( players.getVisionFlag() ).toBe( 1 );
    } );

    it( "should set replay header colors with setPlayerColors", () => {
        const fixture: BasePlayer[] = [
            {
                color: "#ff0000",
                id: 0,
                name: "Player 2",
                race: "zerg",
            },
        ];
        const players = new Players( fixture );

        ( replayMapStore.useReplayAndMapStore.getState as jest.Mock ).mockReturnValue( {
            replay: {
                header: {
                    players: fixture.slice( 0 ),
                },
            },
        } );

        players.setColors( [ "#0000ff" ] );
        expect( players[0].color.getHexString() ).toBe( "0000ff" );
        expect( replayMapStore.useReplayAndMapStore.setState ).toHaveBeenCalledWith( {
            replay: {
                header: {
                    players: [
                        {
                            ...fixture[0],
                            color: "#0000ff",
                        },
                    ],
                },
            },
        } );
    } );

    it( "should set replay player names with setPlayerNames", () => {
        const fixture: BasePlayer[] = [
            {
                color: "#ff0000",
                id: 0,
                name: "Foo",
                race: "zerg",
            },
        ];
        const players = new Players( fixture );

        ( replayMapStore.useReplayAndMapStore.getState as jest.Mock ).mockReturnValue( {
            replay: {
                header: {
                    players: fixture.slice( 0 ),
                },
            },
        } );

        players.setNames( [
            {
                id: 0,
                name: "Bar",
            },
        ] );
        expect( players[0].name ).toBe( "Bar" );
        expect( replayMapStore.useReplayAndMapStore.setState ).toHaveBeenCalledWith( {
            replay: {
                header: {
                    players: [
                        {
                            ...fixture[0],
                            name: "Bar",
                        },
                    ],
                },
            },
        } );
    } );
} );
