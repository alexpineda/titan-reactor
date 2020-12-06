import React from "react";
import { MenuItem } from "../components/MenuItem";

export default ({
  lang,
  isReplay,
  hasNextReplay,
  onClose,
  onNextReplay,
  onBackToMainMenu,
}) => {
  return (
    <div
      className="w-full bg-modal text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center z-20"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      <ul>
        {isReplay ? (
          <MenuItem label={lang["MENU_RETURN_TO_GAME"]} onClick={onClose} />
        ) : (
          <MenuItem label={lang["MENU_RETURN_TO_MAP"]} onClick={onClose} />
        )}

        <MenuItem label={lang["MENU_OPTIONS"]} onClick={onClose} />

        {isReplay && (
          <MenuItem
            label={lang["MENU_NEXT_REPLAY"]}
            onClick={onNextReplay}
            disabled={!hasNextReplay}
          />
        )}

        <MenuItem
          label={lang["MENU_BACK_TO_MAIN_MENU"]}
          onClick={onBackToMainMenu}
        />
      </ul>
    </div>
  );
};
