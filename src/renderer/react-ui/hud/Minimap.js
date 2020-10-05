import React from "react";

export default ({
  timeLabel,
  textSize,
  onRevealMap,
  onShowHeatMap,
  onDropPings,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div className="minimap-parent flex-1 max-w-sm flex items-stretch select-none">
      <div
        className="rounded mb-2 pr-2 flex flex-1 border-2 border-yellow-900"
        style={{ backgroundColor: "#1a202c99" }}
      >
        <article className="minimap flex-1 relative">
          <p
            className={`text-gray-400 text-${textSize} bg-black inline-block absolute px-6 pt-1 pb-2 rounded-tl-full rounded-tr-full border-t-2 border-yellow-800`}
            style={{
              top: "-1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {timeLabel}
          </p>
          <canvas className="bg-black w-full h-full border-r border-yellow-800"></canvas>
        </article>

        <aside className="view-controls flex-0 flex flex-col space-y-2 ml-2 py-2">
          <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize }}
            title={`Reveal Entire Map`}
            data-tip={`Reveal Entire Map`}
            onClick={() => onRevealMap && onRevealMap()}
          >
            filter_hdr
          </i>

          <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize, marginTop: "auto" }}
            title={`Activity Heatmap`}
            data-tip={`Activity Heatmap`}
            onClick={() => onShowHeatMap && onShowHeatMap()}
          >
            bubble_chart
          </i>
          <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize }}
            title={`Drop Pings`}
            data-tip={`Drop Pings`}
            onClick={() => onDropPings && onDropPings()}
          >
            notifications_active
          </i>
        </aside>
      </div>
    </div>
  );
};
