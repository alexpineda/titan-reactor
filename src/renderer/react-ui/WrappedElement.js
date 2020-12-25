import React, { useEffect, useRef } from "react";

const WrappedElement = ({
  domElement,
  className = "",
  style = {},
  ...props
}) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(domElement);
  }, []);
  return (
    <div className={className} ref={canvasRef} style={style} {...props}></div>
  );
};

export default WrappedElement;
