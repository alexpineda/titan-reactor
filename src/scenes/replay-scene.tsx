import { TRScene, TRSceneID } from "./scene";

import { CommandsStream } from "process-replay";

import Chk from "bw-chk";

import { OpenBW } from "@openbw/openbw";

import { GameTypes } from "common/enums";
import { log } from "@ipc/log";
import { settingsStore } from "@stores/settings-store";
import processStore from "@stores/process-store";
import { startOpenBWAndWorld } from "./start-openbw-and-world";
import { Janitor } from "three-janitor";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
// import { cleanMapTitles  } from "@utils/chk-utils";
import { preloadMapUnitsAndSpriteFiles } from "@utils/preload-map-units-and-sprites";
import gameStore from "@stores/game-store";
import { globalEvents } from "@core/global-events";
import debounce from "lodash.debounce";
import { music } from "@audio/music";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { pluginsStore } from "@stores/plugins-store";
import { ValidatedReplay } from "./load-and-validate-replay";
import { GameScene } from "./game-scene/game-scene";
import { getWraithSurface } from "./home/space-scene";
import { MatchDisplay } from "./home/match-display";

export class ReplayScene implements TRScene {
    id: TRSceneID = "@replay";
    hideCursor = true;

    replay: ValidatedReplay;
    
    constructor(replay: ValidatedReplay) {
        this.replay = replay;
    }

    async preload(scene: TRScene | null) {
        if (scene && (scene.id === "@replay" || scene.id === "@map")) {
            // by returning a scene state, we dispose the previous scene before loading another one
            return {
                surface: getWraithSurface().canvas,
                component: <MatchDisplay />,
                key: "preload"
            };
        }
        return null;
    }

    async load() {
        processStore().clearCompleted();

        log.info(`@replay-scene-loader/init: ${this.replay.header.gameName}`);

        await gameStore().assets?.openCascStorage();
        //todo: can we keep images?
        // gameStore().assets?.resetImagesCache();

        const janitor = new Janitor("ReplaySceneLoader");

        document.title = "Titan Reactor";

        const map = new Chk(this.replay.chk as Buffer);

        cleanMapTitles(map);

        const gameTitle = `${map.title} - ${this.replay.header.players
            .map(({ name }) => name)
            .join(", ")}`;

        log.info(`@replay-scene-loader/game: ${gameTitle}`);
        log.info(
            `@replay-scene-loader/game-type: ${GameTypes[this.replay.header.gameType]!}`
        );

        useReplayAndMapStore.setState({
            replay: this.replay,
            map,
            mapImage: await createMapImage(map),
        });
        useReplayAndMapStore.setState({ replay: this.replay, map });
        settingsStore().initSessionData("replay");
        pluginsStore().setSessionPlugins("replay");
        globalEvents.emit("replay-ready", { replay: this.replay, map });

        janitor.mop(
            () => useReplayAndMapStore.getState().reset(),
            "reset replay and map store"
        );

        // if (settingsStore().data.graphics.preloadMapSprites) {
        //     const preloadCommandUnits = new Set<number>();
        //     const postLoad = new Set<number>();

        //     const preloadCommands = new CommandsStream(
        //         this.replay.rawCmds,
        //         this.replay.stormPlayerToGamePlayer
        //     );
        //     const preloadCommandTypes = [
        //         CMDS.TRAIN.id,
        //         CMDS.UNIT_MORPH.id,
        //         CMDS.BUILDING_MORPH.id,
        //         CMDS.BUILD.id,
        //     ];

        //     let preOrPost = 0;

        //     for (const command of preloadCommands.generate()) {
        //         if (typeof command !== "number") {
        //             if (preloadCommandTypes.includes(command.id)) {
        //                 for (const imageId of calculateImagesFromUnitsIscript(
        //                     gameStore().assets!.bwDat,
        //                     [command.unitTypeId!]
        //                 )) {
        //                     if (preOrPost === 0) {
        //                         preloadCommandUnits.add(imageId);
        //                     } else {
        //                         postLoad.add(imageId);
        //                     }
        //                 }
        //             }
        //         } else {
        //             // preload up to 1 minute of commands
        //             if (command > 1 * 24 * 60) {
        //                 preOrPost = 1;
        //             }
        //         }
        //     }

        //     await preloadMapUnitsAndSpriteFiles(gameStore().assets!, map, [
        //         ...preloadCommandUnits,
        //     ]);

        // }

        const commands = new CommandsStream(
            this.replay.rawCmds as Buffer,
            this.replay.stormPlayerToGamePlayer
        );
        const worldComposer = await startOpenBWAndWorld(
            janitor,
            commands,
            (openBW: OpenBW) => {
                openBW.setUnitLimits(this.replay.limits.units);
                openBW.loadReplay(this.replay.buffer);

                const mapPlayers = this.replay.header.players.map((player) => ({
                    id: player.id,
                    name: player.name,
                    color: player.color,
                    race: player.race,
                }));

                return mapPlayers;
            },
            async (worldComposer) => {
                const openBW = worldComposer.world.openBW;

                openBW.setGameSpeed(64);

                openBW.setReplayFrameListener( () => {
                    worldComposer.preRunFrame();
                })

                const preloadImages = new Set<number>();
                if (settingsStore().data.graphics.preloadMapSprites) {
                    let i = 0;
                    while (openBW.nextFrameSafe() < this.replay.header.frameCount ) {
                        // worldComposer.preRunFrame();
                        i = i  + 1;
                        if ( i > 20) {
                            break;
                        }
                        for (const sprite of openBW.iterators.sprites) {
                            for ( const imgAddr of sprite.images.reverse() ) {
                                const imageStruct = openBW.structs.image.get( imgAddr );
                                preloadImages.add(imageStruct.typeId);
                            }
                        }
                    }
                }

                await preloadMapUnitsAndSpriteFiles(gameStore().assets!, map, [
                    ...preloadImages,
                ]);

                const emitComplete = debounce(() => {
                    openBW.setReplayFrameListener(() => {});
                    console.log("GG WP");
                    globalEvents.emit("replay-complete", this.replay);
                }, 1000);

                openBW.setReplayFrameListener(() => {
                    if (
                        openBW.getCurrentReplayFrame() >
                        this.replay.header.frameCount - 1000
                    ) {
                        emitComplete();
                    }
                });
                openBW.setCurrentReplayFrame( 0 );

                // worldComposer.preRunComplete();
            }
        );

        document.title = `Titan Reactor - ${gameTitle}`;

        janitor.mop(await music.playGame());
        worldComposer.surfaceComposer.gameSurface.show();
        worldComposer.apiSession.ui.show();

        return  {
            component: <GameScene />,
            surface: worldComposer.surfaceComposer.gameSurface.canvas,
            dispose: () => {
                janitor.dispose()
            }
        }
    }
}
