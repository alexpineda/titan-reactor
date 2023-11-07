import React, { useEffect, useState, useCallback } from 'react';

type VRButtonProps = {
  renderer: any; // replace 'any' with the actual type of renderer
};

const VRButton: React.FC<VRButtonProps> = ({ renderer }) => {
  const [buttonText, setButtonText] = useState('ENTER VR');
  const [currentSession, setCurrentSession] = useState<XRSession|null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const onSessionStarted = useCallback(
    async (session: XRSession) => {
      session.addEventListener('end', onSessionEnded);
      await renderer.xr.setSession(session);
      setButtonText('EXIT VR');
      setCurrentSession(session);
    },
    [renderer.xr]
  );

  const onSessionEnded = useCallback(
    () => {
      if (currentSession) {
        currentSession.removeEventListener('end', onSessionEnded);
      }
      setButtonText('ENTER VR');
      setCurrentSession(null);
    },
    [currentSession]
  );

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr!.isSessionSupported('immersive-vr').then((supported) => {
        setIsSupported(supported);
        if (supported) {
          // additional logic if needed
        }
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

  const buttonStyle = {
    display: isSupported ? '' : 'none',
    cursor: 'pointer',
    left: 'calc(50% - 50px)',
    width: '100px',
    opacity: '0.5',
    // ... other styles
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={() => (buttonStyle.opacity = '1.0')}
      onMouseLeave={() => (buttonStyle.opacity = '0.5')}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};

export default VRButton;