import React, { useEffect, useRef, memo } from "react";

const WrappedElement = ({ domElement, ...props }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(domElement);
    return () => domElement.remove();
  }, []);
  return <div ref={canvasRef} {...props}></div>;
};

export default memo(WrappedElement);
