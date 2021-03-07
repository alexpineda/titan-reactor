import React, { useState } from "react";
import { connect } from "react-redux";
import { setRemoteSettings } from "../../utils/settingsReducer";
import { MenuItem } from "../components/MenuItem";
import Options from "../home/Options";

const Menu = ({
  phrases,
  settings,
  errors,
  saveSettings,
  onClose,
  onBackToMainMenu,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      className="w-full bg-modal text-white px-6 pt-3 pb-1 flex flex-col items-center justify-center z-20"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      {!showOptions && (
        <ul>
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
          <p onClick={() => setShowOptions(false)}>Back</p>
          <Options
            phrases={phrases}
            settings={settings}
            errors={errors}
            saveSettings={saveSettings}
            inGame={true}
            className="bg-gray-900 w-3/4 px-6 pt-3 pb-1"
            style={{ minHeight: "30vh" }}
          />
        </>
      )}
    </div>
  );
};

export default connect(
  (state) => {
    return {
      settings: state.settings.data,
      phrases: state.settings.phrases,
      errors: state.settings.errors,
    };
  },
  (dispatch) => ({
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
  })
)(Menu);
