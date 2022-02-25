import React from "react";
import { useScreenStore } from "../stores";
import LogDisplay from "./log-display";
import { ScreenStatus, ScreenType } from "../../common/types";

const App = () => {
  const screen = useScreenStore();

  return (
    <React.StrictMode>
      <>
        {!(
          (screen.type === ScreenType.Map ||
            screen.type === ScreenType.Replay) &&
          screen.status === ScreenStatus.Ready
        ) && <LogDisplay />}
      </>
    </React.StrictMode>
  );
};

export default App;
