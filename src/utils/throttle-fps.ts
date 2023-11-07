// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

export const createFPSThrottle = ( fps: number ) => {
    const fpsInterval = 1000 / fps;
    let then: number, now: number;
    then = now = Date.now();

    return ( elapsed: number ) => {
        // calc elapsed time since last loop

        now = Date.now();
        elapsed = now - then;

        // if enough time has elapsed, draw the next frame

        if ( elapsed > fpsInterval ) {
            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - ( elapsed % fpsInterval );

            // Put your drawing code here
            return true;
        }
        return false;
    };
};
