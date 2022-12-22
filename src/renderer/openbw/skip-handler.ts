import { OpenBW } from "@openbw/openbw";

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
