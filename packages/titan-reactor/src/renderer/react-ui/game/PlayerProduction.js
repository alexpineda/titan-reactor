import React from "react";
import { connect } from "react-redux";

const PlayerProduction = ({ cmdIcons, esportsHud }) => {
  return <td></td>;
};

export default connect((state) => {
  return {
    esportsHud: state.settings.data.esportsHud,
  };
})(PlayerProduction);
