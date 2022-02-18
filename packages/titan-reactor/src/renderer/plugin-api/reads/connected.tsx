import { ScreenStatus, ScreenType } from "../../../common/types";

export const CONNECTED = "connected";
export default (screenType: ScreenType, screenStatus: ScreenStatus) => ({
  type: CONNECTED,
  data: `${ScreenType[screenType]}:${ScreenStatus[screenStatus]}`,
});
