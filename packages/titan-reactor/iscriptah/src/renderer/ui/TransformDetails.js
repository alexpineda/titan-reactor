import React from "react";
import { connect } from "react-redux";
import {
  transformEnabledX,
  transformEnabledY,
  transformEnabledZ,
} from "../appReducer";

const TransformDetails = ({
  property,
  transformEnabled,
  transformEnabledX,
  transformEnabledY,
  transformEnabledZ,
}) => (
  <table className="table text-gray-400">
    <tbody>
      <tr>
        <td>
          <div
            className={`rounded bg-gray-700  w-4 h-4 text-center leading-none cursor-pointer ${
              transformEnabled.x ? "text-red-300" : "text-gray-300"
            }`}
            onClick={() => transformEnabledX(!transformEnabled.x)}
            style={{ lineHeight: "0.8" }}
          >
            x
          </div>
        </td>
        <td>{property.x.toFixed(5)}</td>
      </tr>
      <tr>
        <td>
          <div
            className={`rounded bg-gray-700  w-4 h-4 text-center leading-none cursor-pointer ${
              transformEnabled.y ? "text-green-400" : "text-gray-300"
            }`}
            onClick={() => transformEnabledY(!transformEnabled.y)}
            style={{ lineHeight: "0.8" }}
          >
            y
          </div>
        </td>
        <td>{property.y.toFixed(5)}</td>
      </tr>
      <tr>
        <td>
          <div
            className={`rounded bg-gray-700  w-4 h-4 text-center leading-none cursor-pointer ${
              transformEnabled.z ? "text-blue-300" : "text-gray-300"
            }`}
            style={{ lineHeight: "0.8" }}
            onClick={() => transformEnabledZ(!transformEnabled.z)}
          >
            z
          </div>
        </td>
        <td>{property.z.toFixed(5)}</td>
      </tr>
    </tbody>
  </table>
);

export default connect(
  (state) => ({
    transformEnabled: state.app.transformEnabled,
    gameTick: state.app.gameTick,
  }),
  {
    transformEnabledX,
    transformEnabledY,
    transformEnabledZ,
  }
)(TransformDetails);
