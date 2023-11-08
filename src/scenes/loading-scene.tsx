import { settingsStore, useMacroStore } from "@stores/settings-store";
import { TRScene, TRSceneID } from "scenes/scene";
import { LoadingSceneUI } from "./pre-home-scene/loading-scene-ui";
import { initializeAssets } from "@image/assets";
import { preloadIntro } from "./home/space-scene";
import { waitForTruthy } from "@utils/wait-for";
import { Filter, mixer } from "@audio";
import gameStore, { useGameStore } from "@stores/game-store";
import { openCascStorageRemote } from "@ipc/casclib";
import { pluginsStore } from "@stores/plugins-store";
import create from "zustand";

export type LoadingSceneStore = {
    assetServerReady: boolean;
    pluginsReady: boolean;
}

export class LoadingScene implements TRScene {
    id: TRSceneID = "@loading";
    store = create<LoadingSceneStore>(() => ({
        assetServerReady: false,
        pluginsReady: false,
    }))

    async preload() {
        return {
            component: <LoadingSceneUI useStore={this.store} />
        }
    }

    async areServersReady() {
        const urlParams = new URLSearchParams(window.location.search);
        const assetServerUrlParam = urlParams.get("assetServerUrl");
        const assetServerUrl =
            assetServerUrlParam ??
            localStorage.getItem("assetServerUrl") ??
            "http://localhost:8080";

        if (!this.store.getState().assetServerReady) {
            try {
                const ok = await openCascStorageRemote(assetServerUrl);
                console.log("assetServerUrl", assetServerUrl);
                if (ok) {
                    localStorage.setItem("assetServerUrl", assetServerUrl);
                    useGameStore.setState({ assetServerUrl });
                    this.store.setState({ assetServerReady: true });
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
            this.store.setState({ pluginsReady });
        } catch (err) {
            pluginsReady = false;
            console.error(err);
        }
        return this.store.getState().pluginsReady && this.store.getState().assetServerReady;
    }
    
    async load() {
        

        await settingsStore().init();
        useMacroStore.getState().init();

        if (!await this.areServersReady()) {
            await waitForTruthy(async () => {
                return await this.areServersReady();
            }, 5000);
        }
        
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
        dropYourSocks.detune.setValueAtTime(-200, mixer.context.currentTime + 5);
        dropYourSocks.start();

        return {
            component: <LoadingSceneUI useStore={this.store} />,
        }
    }

}