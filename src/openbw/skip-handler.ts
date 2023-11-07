import { OpenBW } from "@openbw/openbw";

// SkipHandler allows the user to skip forward or backward in the replay by a set number of seconds. The game speed is 42 frames per second, so the number of frames to skip ahead by is frame = gameSeconds * 42 * dir, where dir is 1 for forward and -1 for backward.

export const skipHandler =
    (
        _openBW: WeakRef<OpenBW>,
        dir: number,
        onChange: WeakRef<( frame: number ) => void>
    ) =>
    ( gameSeconds = 1 ) => {
        const openBW = _openBW.deref()!;
        const currentFrame = openBW.getCurrentReplayFrame();
        openBW.setCurrentReplayFrame( currentFrame + gameSeconds * 42 * dir );
        const frame = openBW.getCurrentReplayFrame();
        onChange.deref()!( frame );
        return frame;
    };
