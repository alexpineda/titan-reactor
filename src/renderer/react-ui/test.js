import React from "react";
import { render } from "react-dom";
import bwdat from "./bwdat.json";
import createUnitDetails from "./hud/unitDetails/createUnitDetails";

const Details = createUnitDetails(bwdat, 0);
const onClose = () => console.log("Closed");

render(<Details onClose={onClose} />, document.getElementById("app"));
