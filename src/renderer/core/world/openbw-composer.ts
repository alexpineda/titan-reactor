import { SoundChannels } from "@audio/sound-channels";
import { TilesBufferView } from "@buffer-view/tiles-buffer-view";
import { skipHandler } from "@openbw/skip-handler";
import { REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, SpeedDirection, speedHandler } from "@openbw/speed-handler";
import { buildSound } from "@utils/sound-utils";
import { floor32 } from "common/utils/conversions";
import { SceneComposer } from "./scene-composer";
import { MathUtils } from "three";
import { createCompletedUpgradesHelper } from "@openbw/completed-upgrades";
import { ViewInputComposer } from "@core/world/view-composer";
import { World } from "./world";
import { Borrowed } from "@utils/object-utils";
import { mixer } from "@core/global";
import { Timer } from "@utils/timer";

export const createOpenBWComposer = (world: Borrowed<World>, scene: Borrowed<Pick<SceneComposer, "pxToWorld" | "terrainExtra">>, viewInput: Borrowed<ViewInputComposer>) => {
    let _currentFrame = 0;
    let _previousBwFrame = -1;

    const soundChannels = new SoundChannels(mixer);

    const buildSounds = (elapsed: number) => {

        const soundsAddr = world.openBW!.getSoundsAddress!();
        for (let i = 0; i < world.openBW!.getSoundsCount!(); i++) {
            const addr = (soundsAddr >> 2) + (i << 2);
            const typeId = world.openBW!.HEAP32[addr];
            const x = world.openBW!.HEAP32[addr + 1];
            const y = world.openBW!.HEAP32[addr + 2];
            const unitTypeId = world.openBW!.HEAP32[addr + 3];

            if (world.fogOfWar!.isVisible(floor32(x), floor32(y)) && typeId !== 0) {
                buildSound(elapsed, x, y, typeId, unitTypeId, scene.pxToWorld!, viewInput.audio!, viewInput.primaryViewport!.projectedView, soundChannels);
            }
        }

    };

    world.events!.on("settings-changed", ({ rhs }) => {
        if (rhs?.session?.sandbox !== undefined) {
            if (world.openBW!.setSandboxMode(rhs?.session?.sandbox) === undefined) {
                return false;
            }
        }
    })

    const { resetCompletedUpgrades, updateCompletedUpgrades, completedUpgrades } = createCompletedUpgradesHelper(world.openBW!, (owner: number, typeId: number, level: number) => {
        world.events!.emit("completed-upgrade", { owner, typeId, level });
    }, (owner: number, typeId: number) => {
        world.events!.emit("completed-upgrade", { owner, typeId });
    });

    world.events!.on("frame-reset", () => {

        _currentFrame = world.openBW!.getCurrentFrame();
        _previousBwFrame = -1;
        resetCompletedUpgrades(_currentFrame);

    });

    //TOOD: get rid of creep generation and use openbw
    const _tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, world.openBW!.HEAPU8);
    const buildCreep = (frame: number) => {
        _tiles.ptrIndex = world.openBW!.getTilesPtr();
        _tiles.itemsCount = world.openBW!.getTilesSize();
        scene.terrainExtra!.creep.generate(_tiles, frame);
    };

    let lastElapsed = 0;
    const pauseTimer = new Timer();

    return {
        completedUpgrades,
        get currentFrame() {
            return _currentFrame;
        },
        get previousBwFrame() {
            return _previousBwFrame;
        },
        update(elapsed: number) {

            lastElapsed = elapsed;
            _currentFrame = world.openBW!.nextFrame();
            // _currentFrame = world.openBW!.tryCatch(world.openBW!.nextFrame);
            pauseTimer.update();


            if (_currentFrame !== _previousBwFrame) {

                if (_currentFrame % 24 === 0) {

                    updateCompletedUpgrades(_currentFrame);

                }

                buildSounds(_currentFrame);
                buildCreep(_currentFrame);

                _previousBwFrame = _currentFrame;

                return true;

            } else if (world.openBW!.isPaused()) {
                if (pauseTimer.getElapsed() > 42) {
                    pauseTimer.resetElapsed();
                    return true;
                }
            }

            return false;

        },
        openBWGameTimeApi: {
            get currentFrame() {
                return _currentFrame;
            },
            skipForward: skipHandler(world.openBW!, 1, world.reset!),
            skipBackward: skipHandler(world.openBW!, -1, world.reset!),
            speedUp: () => speedHandler(SpeedDirection.Up, world.openBW!),
            speedDown: () => speedHandler(SpeedDirection.Down, world.openBW!),
            togglePause: (setPaused?: boolean) => {
                world.openBW!.setPaused(setPaused ?? !world.openBW!.isPaused());
                return world.openBW!.isPaused();
            },
            get gameSpeed() {
                return world.openBW!.getGameSpeed();
            },
            setGameSpeed(value: number) {
                world.openBW!.setGameSpeed(MathUtils.clamp(value, REPLAY_MIN_SPEED, REPLAY_MAX_SPEED));
            },

            gotoFrame: (frame: number) => {
                world.openBW!.setCurrentFrame(frame);
                world.reset!();
            },
            playSound: (typeId: number, volumeOrX?: number, y?: number, unitTypeId = -1) => {
                if (y !== undefined && volumeOrX !== undefined) {
                    buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, scene.pxToWorld!, viewInput.audio!, viewInput.primaryViewport!.projectedView, soundChannels);
                } else {
                    soundChannels.playGlobal(typeId, volumeOrX);
                }
            }
        }
    }
}