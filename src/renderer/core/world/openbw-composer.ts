import { SoundChannels } from "@audio/sound-channels";
import { TilesBufferView } from "@buffer-view/tiles-buffer-view";
import { skipHandler } from "@openbw/skip-handler";
import { REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, SpeedDirection, speedHandler } from "@openbw/speed-handler";
import { buildSound } from "@utils/sound-utils";
import { floor32 } from "common/utils/conversions";
import { SceneComposer } from "./scene-composer";
import { MathUtils } from "three";
import { createCompletedUpgradesHelper } from "@openbw/completed-upgrades";
import { ViewComposer } from "@core/world/view-composer";
import { World } from "./world";

export const createOpenBWComposer = ({ events, openBW, reset, fogOfWar }: World, { pxToWorld, terrainExtra }: SceneComposer, viewportsComposer: ViewComposer) => {
    let _currentFrame = 0;
    let _previousBwFrame = -1;

    const soundChannels = new SoundChannels();

    const buildSounds = (elapsed: number) => {

        const soundsAddr = openBW.getSoundsAddress!();
        for (let i = 0; i < openBW.getSoundsCount!(); i++) {
            const addr = (soundsAddr >> 2) + (i << 2);
            const typeId = openBW.HEAP32[addr];
            const x = openBW.HEAP32[addr + 1];
            const y = openBW.HEAP32[addr + 2];
            const unitTypeId = openBW.HEAP32[addr + 3];

            if (fogOfWar.isVisible(floor32(x), floor32(y)) && typeId !== 0) {
                buildSound(elapsed, x, y, typeId, unitTypeId, pxToWorld, viewportsComposer.audio, viewportsComposer.primaryViewport!.projectedView, soundChannels);
            }
        }

    };

    events.on("settings-changed", ({ rhs }) => {
        if (rhs.input?.sandBoxMode !== undefined) {
            if (openBW.setSandboxMode(rhs.input.sandBoxMode) === undefined) {
                return false;
            }
        }
    })

    const { resetCompletedUpgrades, updateCompletedUpgrades } = createCompletedUpgradesHelper(openBW, (owner: number, typeId: number, level: number) => {
        events.emit("completed-upgrade", { owner, typeId, level });
    }, (owner: number, typeId: number) => {
        events.emit("completed-upgrade", { owner, typeId });
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
            _currentFrame = openBW.tryCatch(openBW.nextFrame);

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
                    buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, pxToWorld, viewportsComposer.audio, viewportsComposer.primaryViewport!.projectedView, soundChannels);
                } else {
                    soundChannels.playGlobal(typeId, volumeOrX);
                }
            }
        }
    }
}