import React from "react";

const PathSelect = ({ prop, phrases, settings, errors, selectFolder }) => {
  return (
    <span className="flex items-center">
      {!settings[prop] && (
        <button
          className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
          onClick={() => selectFolder(prop)}
        >
          {phrases["BUTTON_SELECT"]}
        </button>
      )}
      {settings[prop] && (
        <p className="italic text-sm text-gray-300">
          {settings[prop]}{" "}
          <button className="text-blue-300" onClick={() => selectFolder(prop)}>
            ({phrases["BUTTON_CHANGE"]})
          </button>
        </p>
      )}
      {errors.includes(prop) && (
        <span
          className="material-icons text-yellow-700 select-none"
          title={`This directory either does not exist or contains invalid contents`}
          data-tip={`This directory either does not exist or contains invalid contents`}
        >
          error_outline
        </span>
      )}
    </span>
  );
};

export default PathSelect;
