/**
 * Reads the replays current frame, endframe and time as a nice label
 */
export const REPLAY_POSITION = "replay-position";
export default (frame: number, endFrame: number, time: string) => ({
  type: REPLAY_POSITION,
  data: {
    frame,
    endFrame,
    time,
  },
});
