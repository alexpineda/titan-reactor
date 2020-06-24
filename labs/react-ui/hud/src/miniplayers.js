import React from "react";
import SVGOverlay from "../OutputSVG/sctools.Starcraft.ASLMap";
import Visible from "../../utils/visible";

export default ({ visible = true }) => {
  return (
    <Visible visible={visible}>
      <SVGOverlay />
    </Visible>
  );
};
