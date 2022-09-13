import { SoundChannels } from "@audio/sound-channels";
import { TilesBufferView } from "@buffer-view/tiles-buffer-view";
import { skipHandler } from "@openbw/skip-handler";
import { REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, SpeedDirection, speedHandler } from "@openbw/speed-handler";
import { buildSound } from "@utils/sound-utils";
import { OpenBW } from "common/types";
import { floor32 } from "common/utils/conversions";
import { SceneComposer } from "./scene-composer";
import { SurfaceComposer } from "./surface-composer";
import { MathUtils } from "three";
import { FogOfWar } from "../fogofwar";
import { createCompletedUpgradesHelper } from "@openbw/completed-upgrades";

export const createOpenBWComposer = (openBW: OpenBW, { pxToWorld, terrainExtra }: SceneComposer, { viewports }: SurfaceComposer, fogOfWar: FogOfWar, reset: () => void) => {
    let _currentFrame = 0;
    let _previousBwFrame = -1;


    //TODO: properly track and dispose audio?
    const soundChannels = new SoundChannels();

    //TODO move to sound buffer / iterator pattern
    const buildSounds = (elapsed: number) => {

        const soundsAddr = openBW.getSoundsAddress!();
        for (let i = 0; i < openBW.getSoundsCount!(); i++) {
            const addr = (soundsAddr >> 2) + (i << 2);
            const typeId = openBW.HEAP32[addr];
            const x = openBW.HEAP32[addr + 1];
            const y = openBW.HEAP32[addr + 2];
            const unitTypeId = openBW.HEAP32[addr + 3];

            if (fogOfWar.isVisible(floor32(x), floor32(y)) && typeId !== 0) {
                buildSound(elapsed, x, y, typeId, unitTypeId, pxToWorld, viewports.audio, viewports.primaryViewport.projectedView, soundChannels);
            }
        }

    };

    let _onUpgradeComplete: (typeId: number, level: number) => void = () => { };
    let _onTechComplete: (typeId: number, level: number) => void = () => { };

    const { resetCompletedUpgrades, updateCompletedUpgrades } = createCompletedUpgradesHelper(openBW, (typeId: number, level: number) => {
        _onUpgradeComplete(typeId, level);
        // plugins.nativePlugins.callHook(HOOK_ON_UPGRADE_COMPLETED, [typeId, level, assets.bwDat.upgrades[typeId]]);
    }, (typeId: number, level: number) => {
        _onTechComplete(typeId, level);
        // plugins.nativePlugins.callHook(HOOK_ON_TECH_COMPLETED, [typeId, level, assets.bwDat.tech[typeId]]);
    });

    //TOOD: get rid of creep generation and use openbw
    const _tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, openBW.HEAPU8);
    const buildCreep = (frame: number) => {
        _tiles.ptrIndex = openBW.getTilesPtr();
        _tiles.itemsCount = openBW.getTilesSize();
        terrainExtra.creep.generate(_tiles, frame);
    };

    let lastElapsed = 0;

    return {
        onUpgradeComplete(cb: (typeId: number, level: number) => void) {
            _onUpgradeComplete = cb;
        },
        onTechComplete(cb: (typeId: number, level: number) => void) {
            _onTechComplete = cb;
        },
        get currentFrame() {
            return _currentFrame;
        },
        get previousBwFrame() {
            return _previousBwFrame;
        },
        onFrameReset() {
            _currentFrame = openBW.getCurrentFrame();
            _previousBwFrame = -1;
            resetCompletedUpgrades(_currentFrame);
        },
        update(elapsed: number) {

            lastElapsed = elapsed;
            _currentFrame = openBW.nextFrame();

            if (_currentFrame !== _previousBwFrame) {

                if (_currentFrame % 24 === 0) {

                    updateCompletedUpgrades(_currentFrame);

                }

                buildSounds(_currentFrame);
                buildCreep(_currentFrame);
                // updateSelectionGraphics(viewports.primaryViewport.camera, sprites, completedUpgrades, selectedUnits.values());

                _previousBwFrame = _currentFrame;

                return true;

            }

            return false;

        },
        openBWGameTimeApi: {
            get currentFrame() {
                return _currentFrame;
            },
            skipForward: skipHandler(openBW, 1, reset),
            skipBackward: skipHandler(openBW, -1, reset),
            speedUp: () => speedHandler(SpeedDirection.Up, openBW),
            speedDown: () => speedHandler(SpeedDirection.Down, openBW),
            togglePause: (setPaused?: boolean) => {
                openBW.setPaused(setPaused ?? !openBW.isPaused());
                return openBW.isPaused();
            },
            get gameSpeed() {
                return openBW.getGameSpeed();
            },
            setGameSpeed(value: number) {
                openBW.setGameSpeed(MathUtils.clamp(value, REPLAY_MIN_SPEED, REPLAY_MAX_SPEED));
            },

            gotoFrame: (frame: number) => {
                openBW.setCurrentFrame(frame);
                reset();
            },
            playSound: (typeId: number, volumeOrX?: number, y?: number, unitTypeId = -1) => {
                if (y !== undefined && volumeOrX !== undefined) {
                    buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, pxToWorld, viewports.audio, viewports.primaryViewport.projectedView, soundChannels);
                } else {
                    soundChannels.playGlobal(typeId, volumeOrX);
                }
            }
        }
    }
}