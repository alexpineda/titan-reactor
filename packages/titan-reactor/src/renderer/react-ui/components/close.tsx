import React from "react";

export const Close = ({ onClose }: { onClose: () => void }) => (
  <div className="w-full flex justify-end">
    <div
      className="cursor-pointer hover:underline material-icons"
      onClick={onClose}
    >
      close
    </div>
  </div>
);
