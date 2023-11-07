// used for transitiong rendering types
// eg. fade out, at halfway mark scene is changed or something happens, then fade in
export const createTransition = (onStart: () => void, onProgress: (progress:number) => void, onComplete: () => void) => {

    const _transition = {
        enabled: false,
        callbackCalled: false,
        progress: 0,
        onHalfway: () => {}
    };

    return {
        start: ( fn: () => void ) => {
            if ( _transition.enabled ) {
                return;
            }
            _transition.progress = 0;
            _transition.onHalfway = fn;
            _transition.enabled = true;
            _transition.callbackCalled = false;

            onStart();
            
        },
        
        update: ( delta: number ) => {
            if ( !_transition.enabled ) {
                return;
            }
            _transition.progress += 0.005 * Math.min( delta, 16 );

            onProgress( _transition.progress / 2 );

            if ( _transition.progress > 2 ) {
                _transition.enabled = false;
                onComplete();
            } else if ( _transition.progress > 1 ) {
                if ( !_transition.callbackCalled ) {
                    _transition.onHalfway();
                    _transition.callbackCalled = true;
                }
            }
        }
    }

}