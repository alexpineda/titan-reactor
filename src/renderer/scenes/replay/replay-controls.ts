import { OpenBW } from "common/types";

export enum ReplayChangeSpeedDirection {
    Up,
    Down
}

export const REPLAY_MIN_SPEED = 0.25;
export const REPLAY_MAX_SPEED = 16;
export const speedHandler = (direction: ReplayChangeSpeedDirection, openBW: OpenBW) => {
    const currentSpeed = openBW.getGameSpeed();
    let newSpeed = 0;

    // smaller increments/decrements between 1 & 2
    if (direction === ReplayChangeSpeedDirection.Up && currentSpeed >= 1 && currentSpeed < 2) {
        newSpeed = currentSpeed + REPLAY_MIN_SPEED;
    } else if (direction === ReplayChangeSpeedDirection.Down && currentSpeed <= 2 && currentSpeed > 1) {
        newSpeed = currentSpeed - REPLAY_MIN_SPEED;
    } else {
        newSpeed = Math.max(REPLAY_MIN_SPEED, Math.min(REPLAY_MAX_SPEED, currentSpeed * (ReplayChangeSpeedDirection.Up === direction ? 2 : 0.5)));
    }

    openBW.setGameSpeed(newSpeed);
    return openBW.getGameSpeed();
}