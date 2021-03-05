import React, { useEffect, useRef } from "react";

const WrappedElement = ({ domElement, ...props }) => {
  const canvasRef = useRef();
  useEffect(() => {
    canvasRef.current.appendChild(domElement);
    return () => canvasRef.current.remove(domElement);
  }, []);
  return <div ref={canvasRef} {...props}></div>;
};

export default WrappedElement;
