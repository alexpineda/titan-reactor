import Stream from "stream";
import StreamGameStateReader from "../StreamGameStateReader";
import ReadState from "../ReadState";
import FrameBW from "../../../game/state/FrameBW";

const FRAME_HEADER_SIZE = 4 + 36 + 8 * 10;
const writeU32 = (val, totalSize = 4) => {
  const buf = Buffer.alloc(totalSize);
  buf.writeInt32LE(val);
  return buf;
};
jest.useFakeTimers();
describe("StreamGameStateReader", () => {
  describe("processing frames", () => {
    it("should max if ReadState ended", () => {
      expect.assertions(3);

      const MAX_FRAMES = 1;
      const reader = new StreamGameStateReader(MAX_FRAMES);

      // mimic reaching last game frame
      reader._state.maxFrame = 10;
      reader._state.currentFrame = 10;

      expect(reader.isMaxed).toBe(true);

      reader.processFrames();

      expect(reader.isMaxed).toBe(true);
      return expect(reader.waitForMaxed).resolves.toBeUndefined();
    });

    it("should max if marked frames are maxed", () => {
      const reader = new StreamGameStateReader(0);

      reader.processFrames();
      expect(reader.isMaxed).toBe(true);
    });

    it("should not process anything if there is no new data", () => {
      const reader = new StreamGameStateReader(1);

      reader.stream = new Stream.Readable({
        read() {},
      });

      reader.emit = jest.fn();

      expect(reader.isMaxed).toBe(false);

      reader.processFrames();

      expect(reader._bytesRead).toBe(0);
      expect(reader.isMaxed).toBe(false);
      expect(reader.peekAvailableFrames()).toHaveLength(0);
      expect(reader.emit).toHaveBeenLastCalledWith("frames", []);
    });

    it("should process existing buffer before reading more from stream", () => {
      const reader = new StreamGameStateReader(1);

      reader.stream = {
        read: jest.fn(() => Buffer.alloc(1)),
      };

      reader.emit = jest.fn();

      reader._processBuffer = jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(reader.isMaxed).toBe(false);

      reader.processFrames();

      expect(reader.isMaxed).toBe(false);
      expect(reader._processBuffer).toHaveBeenCalledTimes(1);
      expect(reader.stream.read).toHaveBeenCalledTimes(0);
    });

    //
    it("should process from stream if data is available", () => {
      const reader = new StreamGameStateReader(1);

      reader.stream = {
        read: jest.fn(() => Buffer.alloc(1)),
      };

      reader.emit = jest.fn();

      reader._processBuffer = jest
        .fn()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      expect(reader.isMaxed).toBe(false);

      reader.processFrames();

      expect(reader.isMaxed).toBe(false);
      expect(reader._processBuffer).toHaveBeenCalledTimes(2);
      expect(reader.stream.read).toHaveBeenCalledTimes(1);
    });

    it("should add new frames if ReadState.process returns true and is mode FrameComplete", () => {
      const reader = new StreamGameStateReader(10);

      reader.stream = {
        read: jest.fn().mockReturnValue(null).mockReturnValueOnce(writeU32(1)),
      };

      reader.emit = jest.fn();

      reader._state.mode = ReadState.FrameComplete;
      reader._state.process = jest
        .fn()
        .mockReturnValue(false)
        .mockReturnValueOnce(true);

      expect(reader.isMaxed).toBe(false);

      reader.processFrames();

      // should be maxed but we mocked out ReadState.process
      // expect(reader.isMaxed).toBe(true);
      expect(reader.stream.read).toHaveBeenCalledTimes(2);
      expect(reader._state.process).toHaveBeenCalledTimes(3);
      expect(reader.emit).toHaveBeenLastCalledWith("frames", [new FrameBW()]);
    });

    // should be maxed if too many frames
    it("should process frames upto maxFrames", () => {
      const reader = new StreamGameStateReader(1);

      reader.stream = {
        read: jest.fn().mockReturnValue(null).mockReturnValueOnce(writeU32(1)),
      };

      reader.emit = jest.fn();

      reader._state.mode = ReadState.FrameComplete;
      reader._state.process = jest
        .fn()
        .mockReturnValue(false)
        .mockReturnValueOnce(true);

      expect(reader.isMaxed).toBe(false);

      reader.processFrames();

      expect(reader.isMaxed).toBe(true);
      expect(reader.stream.read).toHaveBeenCalledTimes(0);
      expect(reader._state.process).toHaveBeenCalledTimes(1);
      expect(reader.emit).toHaveBeenCalledWith("frames", [new FrameBW()]);
      expect(reader.emit).toHaveBeenLastCalledWith("maxed");
    });
  });
});
