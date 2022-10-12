import { OpenBW } from "common/types";

export const skipHandler = (_openBW: WeakRef<OpenBW>, dir: number, onChange: WeakRef<(frame: number) => void>) => (gameSeconds = 1) => {
    const openBW = _openBW.deref()!;
    const currentFrame = openBW.getCurrentFrame();
    openBW.setCurrentFrame(currentFrame + gameSeconds * 42 * dir);
    const frame = openBW.getCurrentFrame();
    onChange.deref()!(frame);
    return frame;
}