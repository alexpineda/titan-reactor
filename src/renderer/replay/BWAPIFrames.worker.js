import { AllBWAPIFramesFromBuffer } from "./BWAPIFrames";

onmessage = function ({ data }) {
  const BWAPIFrames = AllBWAPIFramesFromBuffer(
    data.frames.buffer,
    (progress) => {
      postMessage({ progress });
    }
  );
  postMessage({ status: "completed", BWAPIFrames });
};
