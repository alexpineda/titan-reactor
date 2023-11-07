import { settingsStore } from "@stores/settings-store";
import { initializeAssets } from "@image/assets";
import { preloadIntro } from "../home/space-scene";
import { PreHomeScene } from "./pre-home-scene";
import { waitForTruthy } from "@utils/wait-for";
import { Filter, mixer } from "@audio";
import { SceneState } from "../scene";
import gameStore, { useGameStore } from "@stores/game-store";
import { openCascStorageRemote } from "@ipc/casclib";
import { pluginsStore } from "@stores/plugins-store";
import { renderAppUI } from "../app";

export async function preHomeSceneLoader(): Promise<SceneState> {
    const urlParams = new URLSearchParams(window.location.search);
    const assetServerUrlParam = urlParams.get("assetServerUrl");
    const assetServerUrl =
        assetServerUrlParam ??
        localStorage.getItem("assetServerUrl") ??
        "http://localhost:8080";

    await settingsStore().init();

    renderAppUI({
        key: "@preload",
        scene: <PreHomeScene pluginsReady={false} assetServerReady={false} />,
    });

    await waitForTruthy(async () => {
        const assetServerReady = !!useGameStore.getState().assetServerUrl;
        if (!assetServerReady) {
            try {
                const ok = await openCascStorageRemote(assetServerUrl);
                console.log("assetServerUrl", assetServerUrl);
                if (ok) {
                    localStorage.setItem("assetServerUrl", assetServerUrl);
                    useGameStore.setState({ assetServerUrl });
                }
            } catch (err) {
                console.error(err);
            }
        }

        let pluginsReady = false;

        try {
            pluginsReady = await fetch(gameStore().runtimeUrl, { method: "HEAD" }).then(
                (res) => res.ok
            );
            for (const url of gameStore().pluginRepositoryUrls) {
                pluginsReady =
                    pluginsReady &&
                    (await fetch(url + "index.json", { method: "HEAD" }).then(
                        (res) => res.ok
                    ));
                console.log("pluginsReady", url);
            }
            console.log("runtimeReady", gameStore().runtimeUrl, pluginsReady);
        } catch (err) {
            pluginsReady = false;
            console.error(err);
        }

        renderAppUI({
            key: "@preload",
            scene: (
                <PreHomeScene
                    pluginsReady={pluginsReady}
                    assetServerReady={assetServerReady}
                />
            ),
        });

        return pluginsReady && assetServerReady;
    }, 5000);

    await pluginsStore().init();

    await initializeAssets();

    await preloadIntro();

    mixer.setVolumes(settingsStore().data.audio);

    const dropYourSocks = mixer.context.createBufferSource();
    dropYourSocks.buffer = await mixer.loadAudioBuffer(
        __static + "/three/drop-your-socks.mp3"
    );

    const _disconnect = mixer.connect(
        dropYourSocks,
        new Filter(mixer, "bandpass", 50).node,
        mixer.intro
    );

    dropYourSocks.onended = () => _disconnect();

    return {
        id: "@loading",
        start: () => {
            dropYourSocks.detune.setValueAtTime(-200, mixer.context.currentTime + 5);
            dropYourSocks.start();
        },
        dispose: () => {},
    };
}
