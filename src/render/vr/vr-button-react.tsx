import React, { useEffect, useState, useCallback } from 'react';
import { InGameMenuButton } from '../../scenes/game-scene/ingame-menu-button';

type VRButtonProps = {
  renderer: any; // replace 'any' with the actual type of renderer
};

const VRButtonReact: React.FC<VRButtonProps> = ({ renderer }) => {
  const [currentSession, setCurrentSession] = useState<XRSession|null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const onSessionStarted = useCallback(
    async (session: XRSession) => {
      await renderer.xr.setSession(session);
      setCurrentSession(session);
    },
    [renderer.xr]
  );

  const onSessionEnded = useCallback(
    () => {
      setCurrentSession(null);
    },
    [currentSession]
  );

  useEffect(() => {
    if (currentSession) {
      currentSession.addEventListener('end', onSessionEnded);
    }
    return () => {
      if (currentSession) {
        currentSession.removeEventListener('end', onSessionEnded);
      }
    }
  }, [currentSession]);

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr!.isSessionSupported('immersive-vr').then((supported) => {
        setIsSupported(supported);
      });
    }
  }, []);

  const handleClick = () => {
    if (currentSession === null) {
      const sessionInit = {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
      };
      navigator.xr!.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
    } else {
      currentSession.end();
    }
  };

  const buttonText = isSupported ? (currentSession ? "EXIT VR" : "ENTER VR") : 'VR NOT SUPPORTED';

  return (
    <InGameMenuButton onClick={handleClick} background={isSupported ? "var(--blue-5)" : "var(--gray-5)"}
    color="var(--gray-9)">
      <svg viewBox='0 0 36 36' style={{width: "24px", height: "24px"}}>
      <path d="M31.6 6.8H4.4C2 6.8 0 8.7 0 11.2v13.6c0 2.5 2 4.4 4.4 4.4h6.5c1.2 0 2.3-.5 3.1-1.3l2.3-2.3c.4-.4 1-.7 1.6-.7s1.2.2 1.7.7l2.3 2.3c.8.8 2 1.3 3.1 1.3h6.5c2.4 0 4.4-2 4.4-4.4V11.2c.1-2.5-1.9-4.4-4.3-4.4zM10.1 22.4c-2.5 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4c2.5 0 4.4 2 4.4 4.4s-2 4.4-4.4 4.4zm15.8 0c-2.5 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4c2.5 0 4.4 2 4.4 4.4s-1.9 4.4-4.4 4.4z" fill="currentColor"></path></svg>
      {buttonText}
    </InGameMenuButton>
  );
};

export default VRButtonReact;