import React, { useEffect, useRef } from "react";

const WrappedElement = ({ domElement, className = "", style = {} }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(domElement);
  }, []);
  return <div className={className} ref={canvasRef} style={style}></div>;
};

export default WrappedElement;
