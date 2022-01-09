
import {
    sidegradeReplay,
    parseReplay,
    Version,
    CommandsStream,
    ChkDowngrader,
} from "downgrade-replay";
import fs from "fs";
import path from "path";

import Chk from "bw-chk";
import {
    ImageHD
} from "./core";
import { EmptyFunc } from "../common/types";
import { MainMixer, SoundChannels, Music} from "./audio";
import OpenBwWasmReader from "./integration/openbw-wasm/openbw-reader";
import { openFile } from "./ipc";
import * as log from "./ipc/log";
import { Scene } from "./render";
import loadTerrain from "./assets/load-terrain";
import {
    disposeGame,
    getAssets,
    getSettings,
    setGame,
    startLoadingProcess,
    updateIndeterminateLoadingProcess,
    completeLoadingProcess,
    initScreen,
    updateScreen,
    completeScreen,
    ReplayScreen,
} from "./stores";
import TitanReactorGame from "./view-replay";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import Janitor from "./utils/janitor";
import { openBw } from "./openbw";
import { strict as assert } from "assert";
import { SoundStruct } from "./integration/data-transfer";
import { pxToMapMeter } from "../common/utils/conversions";

export default async (filepath: string) => {
    log.info(`loading replay ${filepath}`);

startLoadingProcess({
        id: "replay",
        label: getFunString(),
        priority: 1,
    });

    disposeGame();

    const janitor = new Janitor();
    const settings = getSettings();

    // validate before showing any loading progress
    let repBin = await openFile(filepath);
    let rep = await parseReplay(repBin);

    document.title = "Titan Reactor - Loading";

    initScreen({
        type: "replay",
        filename: filepath,
    } as ReplayScreen);

    log.verbose("parsing replay");
    let repFile = filepath;
    const outFile = path.join(settings.directories.temp, "replay.out");

    // @todo change this to generics
    // @ts-ignore
    updateScreen({ header: rep.header } as ReplayScreen);

    if (rep.version !== Version.titanReactor) {
        const chkDowngrader = new ChkDowngrader();
        repBin = await sidegradeReplay(rep, chkDowngrader);
        repFile = path.join(settings.directories.temp, "replay.rep");
        //@todo use fsPromises, bail on error
        await new Promise((res: EmptyFunc) =>
            fs.writeFile(repFile, repBin, (err) => {
                if (err) {
                    log.error(err.message);
                    return;
                }
                res();
            })
        );
        rep = await parseReplay(repBin);
    }

    log.verbose("loading chk");
    const chk = new Chk(rep.chk);
    updateScreen({ chkTitle: chk.title } as ReplayScreen);

    log.verbose("building terrain");
    const terrainInfo = await loadTerrain(chk, pxToMapMeter(chk.size[0], chk.size[1]));
    const scene = new Scene(terrainInfo);
    janitor.object3d(scene);

    await waitForAssets();

    updateIndeterminateLoadingProcess("replay", "Connecting to the hivemind");

    assert(openBw.api)
    const gameStateReader = new OpenBwWasmReader(
        openBw.api
    );
    janitor.disposable(gameStateReader);

    try {
        gameStateReader.loadReplay(repBin);
    } catch (e: unknown) {
        log.error(e);
    }
    gameStateReader.next();


    const races = ["terran", "zerg", "protoss"];
    // const races = settings.musicAllTypes
    //     ? ["terran", "zerg", "protoss"]
    //     : uniq(rep.header.players.map(({ race }: { race: string }) => race)) as string[];

    const assets = getAssets();
    if (!assets || !assets.bwDat) {
        throw new Error("assets not loaded");
    }

    log.verbose("initializing audio");
    
    const mixer = new MainMixer();
    const soundChannels = new SoundChannels(mixer, assets.loadAudioFile.bind(assets));
    const music = new Music(races);
    //@todo refactor music outside of three Audio
    //@ts-ignore
    music.setListener(mixer as unknown as AudioListener);
    janitor.disposable(music);

    mixer.musicVolume = settings.audio.music;
    mixer.soundVolume = settings.audio.sound;
    mixer.masterVolume = settings.audio.global;

    log.verbose("starting gameloop");
    updateIndeterminateLoadingProcess("replay", getFunString());
    ImageHD.useDepth = false;
    const game = await TitanReactorGame(
        scene,
        terrainInfo,
        chk.units,
        rep,
        new CommandsStream(rep.rawCmds),
        gameStateReader,
        assets.bwDat,
        mixer,
        music,
        soundChannels,
        janitor
    );

    setGame(game);
    completeScreen();

    log.verbose("starting replay");
    document.title = `Titan Reactor - ${path.basename(filepath)} - ${rep.header.players.map(({ name }) => name).join(", ")}`;
    game.start();
    completeLoadingProcess("replay");
};