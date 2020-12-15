import React, { useState } from "react";
import { MenuItem } from "../components/MenuItem";
import Options from "../home/Options";

export default ({ lang, settings, isReplay, onClose, onBackToMainMenu }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      className="w-full bg-modal text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center z-20"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      {!showOptions && (
        <ul>
          {isReplay ? (
            <MenuItem label={lang["MENU_RETURN_TO_GAME"]} onClick={onClose} />
          ) : (
            <MenuItem label={lang["MENU_RETURN_TO_MAP"]} onClick={onClose} />
          )}

          <MenuItem
            label={lang["MENU_OPTIONS"]}
            onClick={() => setShowOptions(true)}
          />

          <MenuItem
            label={lang["MENU_BACK_TO_MAIN_MENU"]}
            onClick={onBackToMainMenu}
          />
        </ul>
      )}
      {showOptions && (
        <>
          <p onClick={() => setShowOptions(false)}>Back</p>
          <Options
            lang={lang}
            settings={settings}
            inGame={true}
            className="bg-gray-900 w-3/4 px-6 pt-3 pb-1"
            style={{ minHeight: "30vh" }}
          />
        </>
      )}
    </div>
  );
};
