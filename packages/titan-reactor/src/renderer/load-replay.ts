
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
import uniq from "../common/utils/uniq";
import { AudioMaster } from "./audio";
import OpenBwBridgeReader from "./integration/fixed-data/readers/openbw-bridge-reader";
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
    const repBin = await openFile(filepath);
    let rep = await parseReplay(repBin);

    document.title = "Titan Reactor - Loading";

    initScreen({
        type: "replay",
        filename: filepath,
    } as ReplayScreen);

    log.verbose("parsing replay");
    let repFile = filepath;
    const outFile = path.join(settings.directories.temp, "replay.out");

    updateScreen({ header: rep.header } as ReplayScreen);

    if (rep.version !== Version.titanReactor) {
        const chkDowngrader = new ChkDowngrader();
        const newrep = await sidegradeReplay(rep, chkDowngrader);
        repFile = path.join(settings.directories.temp, "replay.rep");
        //@todo use fsPromises, bail on error
        await new Promise((res: EmptyFunc) =>
            fs.writeFile(repFile, newrep, (err) => {
                if (err) {
                    log.error(err.message);
                    return;
                }
                res();
            })
        );
        rep = await parseReplay(newrep);
    }

    log.verbose("loading chk");
    const chk = new Chk(rep.chk);
    updateScreen({ chkTitle: chk.title } as ReplayScreen);

    log.verbose("building terrain");
    const terrainInfo = await loadTerrain(chk);
    const scene = new Scene(terrainInfo);
    janitor.object3d(scene);

    await waitForAssets();

    updateIndeterminateLoadingProcess("replay", "Connecting to the hivemind");

    log.verbose(`starting gamestate reader ${repFile} ${outFile}`);
    const gameStateReader = new OpenBwBridgeReader(
        settings.directories.starcraft,
        repFile,
        outFile
    );
    janitor.disposable(gameStateReader);

    await gameStateReader.start();
    await gameStateReader.waitForMaxed;

    const races = ["terran", "zerg", "protoss"];
    // const races = settings.musicAllTypes
    //     ? ["terran", "zerg", "protoss"]
    //     : uniq(rep.header.players.map(({ race }: { race: string }) => race)) as string[];

    const assets = getAssets();
    if (!assets || !assets.bwDat) {
        throw new Error("assets not loaded");
    }

    log.verbose("initializing audio");
    const audioMaster = new AudioMaster(
        assets.loadAudioFile.bind(assets),
        races
    );
    janitor.disposable(audioMaster)
    audioMaster.mixer.musicVolume = settings.audio.music;
    audioMaster.mixer.soundVolume = settings.audio.sound;
    audioMaster.mixer.masterVolume = settings.audio.global;

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
        audioMaster,
        janitor
    );

    setGame(game);
    completeScreen();

    log.verbose("starting replay");
    document.title = "Titan Reactor"
    game.start();
    completeLoadingProcess("replay");
};