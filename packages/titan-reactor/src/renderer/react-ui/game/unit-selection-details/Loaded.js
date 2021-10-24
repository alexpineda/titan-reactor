import range from "../../../../common/utils/range";
import React, { forwardRef } from "react";
import SmallUnitItem from "./SmallUnitItem";

const Loaded = forwardRef(({ unit }, ref) => {
  return (
    <div className="flex pl-1 pt-1 hidden" ref={ref}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 2.5rem)",
          gridTemplateRows: "repeat(2, 2.5rem)",
          gridGap: ".25rem",
        }}
      >
        {range(0, 8).map((i) => (
          <SmallUnitItem key={i} index={i} unit={unit} showLoaded={true} />
        ))}
      </div>
    </div>
  );
});
export default Loaded;
