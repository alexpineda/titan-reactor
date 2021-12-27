import React, { useState } from "react";
import { MenuItem } from "../components/menu-item";
import Options, { Tabs } from "../home/options";
import { useSettingsStore } from "../../stores";

interface Props {
  onClose: () => void;
  onBackToMainMenu: () => void;
  onOpenReplay: () => void;
  onOpenMap: () => void;
}
const Menu = ({
  onClose,
  onBackToMainMenu,
  onOpenReplay,
  onOpenMap,
}: Props) => {
  const [showOptions, setShowOptions] = useState(false);
  const phrases = useSettingsStore((state) => state.phrases);

  return (
    <div
      className="w-full bg-modal text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center z-20"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      {!showOptions && (
        <ul style={{ marginTop: "-20vh" }}>
          <MenuItem label={phrases["MENU_RETURN_TO_GAME"]} onClick={onClose} />
          <MenuItem label={phrases["OPEN_REPLAY"]} onClick={onOpenReplay} />
          <MenuItem label={phrases["OPEN_MAP"]} onClick={onOpenMap} />

          <MenuItem
            label={phrases["MENU_OPTIONS"]}
            onClick={() => setShowOptions(true)}
          />

          <MenuItem
            label={phrases["MENU_BACK_TO_MAIN_MENU"]}
            onClick={onBackToMainMenu}
          />
        </ul>
      )}
      {showOptions && (
        <>
          <p
            className="m-6 px-2 py-1 bg-blue-500 rounded"
            onClick={() => setShowOptions(false)}
          >
            Back
          </p>
          <Options
            defaultTab={Tabs.Layout}
            inGame={true}
            className="bg-gray-900 w-1/2 px-6 pt-6 pb-1 rounded-lg"
            style={{ minHeight: "65vh" }}
          />
        </>
      )}
    </div>
  );
};

export default Menu;
