import { OpenBW } from "common/types";

export enum SpeedDirection {
    Up,
    Down,
}

export const REPLAY_MIN_SPEED = 0.25;
export const REPLAY_MAX_SPEED = 16;
export const speedHandler = ( direction: SpeedDirection, _openBW: WeakRef<OpenBW> ) => {
    const openBW = _openBW.deref()!;
    const currentSpeed = openBW.getGameSpeed();
    let newSpeed = 0;

    // smaller increments/decrements between 1 & 2
    if ( direction === SpeedDirection.Up && currentSpeed >= 1 && currentSpeed < 2 ) {
        newSpeed = currentSpeed + REPLAY_MIN_SPEED;
    } else if (
        direction === SpeedDirection.Down &&
        currentSpeed <= 2 &&
        currentSpeed > 1
    ) {
        newSpeed = currentSpeed - REPLAY_MIN_SPEED;
    } else {
        newSpeed = Math.max(
            REPLAY_MIN_SPEED,
            Math.min(
                REPLAY_MAX_SPEED,
                currentSpeed * ( SpeedDirection.Up === direction ? 2 : 0.5 )
            )
        );
    }

    openBW.setGameSpeed( newSpeed );
    return openBW.getGameSpeed();
};
