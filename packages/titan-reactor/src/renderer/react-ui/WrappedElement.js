import React, { useEffect, useRef, memo } from "react";

const eventNames = [
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
  "onPointerCancel",
  "onGotPointerCapture",
  "onLostPointerCapture",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
  "onClick",
  "onDoubleClick",
  "onDrag",
  "onDragEnd",
  "onDragEnter",
  "onDragExit",
  "onDragLeave",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  "onWheel",
  "onKeyDown",
  "onKeyPress",
  "onKeyUp",
];
const disableEvent = (e) => {
  e.stopPropagation();
};
const eventProps = eventNames.reduce(
  (memo, propName) => ({ ...memo, [propName]: disableEvent }),
  {}
);

const WrappedElement = ({ domElement, ...props }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(domElement);
    return () => domElement.remove();
  }, []);
  return <div ref={canvasRef} {...props} {...eventProps}></div>;
};

export default memo(WrappedElement);
