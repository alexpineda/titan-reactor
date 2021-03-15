import React, { useState } from "react";
import { MenuItem } from "../components/MenuItem";
import Options, { Tabs } from "../home/Options";
import useSettingsStore from "../../stores/settingsStore";

const Menu = ({ onClose, onBackToMainMenu }) => {
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
            defaultTab={Tabs.Game}
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
