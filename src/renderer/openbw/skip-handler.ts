import { OpenBW } from "common/types";

export const skipHandler = (openBW: OpenBW, dir: number, onChange: (frame: number) => void) => (gameSeconds = 1) => {
    const currentFrame = openBW.getCurrentFrame();
    openBW.setCurrentFrame(currentFrame + gameSeconds * 42 * dir);
    const frame = openBW.getCurrentFrame();
    onChange(frame);
    return frame;
}