import React from "react";
import Visible from "../../utils/visible";

const Progress = ({ progress }) => {
  return <div>progress</div>;
};

export default ({ replay, visible = true }) => {
  return (
    <Visible visible={visible}>
      <div>
        <div>toggle</div>
        <section>
          <Progress progress={replay.progress} />
          <p>Speed: Fastest</p>
        </section>
      </div>
    </Visible>
  );
};
