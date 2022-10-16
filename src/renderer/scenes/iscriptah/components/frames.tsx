import { useState, useRef, useEffect } from "react";
import shallow from "zustand/shallow";
import range from "common/utils/range";
import { useIscriptStore, setFrame, setBaseFrame } from "../stores";

export const Frames = ( { numFrames }: { numFrames: number } ) => {
    const [focusElement, setFocusElement] = useState( false );
    const [showOnlyFramesets, setShowOnlyFramesets] = useState( false );

    const elementToFocus = useRef<HTMLLIElement>();
    const looseFrames = numFrames % 17;

    const { blockFrameCount, selectedBaseFrame, selectedFrame } = useIscriptStore(
        ( store ) => ( {
            blockFrameCount: store.blockFrameCount,
            selectedBaseFrame: store.baseFrame,
            selectedFrame: store.frame,
        } ),
        shallow
    );

    useEffect( () => {
        if ( focusElement && elementToFocus.current ) {
            elementToFocus.current.focus();
            setFocusElement( false );
        }
    }, [focusElement] );

    return (
        <aside
            style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "100vh",
                overflowY: "scroll",
                paddingBottom: "var(--size-10)",
                userSelect: "none",
                minWidth: "8rem",
            }}>
            <header style={{ padding: "var(--size-2)" }}>
                <p style={{ fontStyle: "italic", marginBottom: "var(--size-4)" }}>
                    <p>{numFrames} All Frames</p>
                    <p>{Math.floor( numFrames / 17 )} Framesets</p>
                    <p>{numFrames % 17} Loose Frames</p>
                </p>
                <label>
                    <input
                        type="checkbox"
                        checked={showOnlyFramesets}
                        onChange={( evt ) => {
                            setShowOnlyFramesets(
                                ( evt.target as HTMLInputElement ).checked
                            );
                        }}
                    />
                    Show only framesets
                </label>
            </header>
            <section style={{ padding: "var(--size-2)", position: "relative" }}>
                <ul>
                    {range( 0, numFrames ).map( ( _, i: number ) => {
                        const isBaseFrame =
                            selectedBaseFrame === null
                                ? 0
                                : Math.floor( i / 17 ) * 17 + ( selectedBaseFrame % 17 );
                        const grey = Math.floor( i / 17 ) % 2;

                        return !showOnlyFramesets ||
                            ( showOnlyFramesets &&
                                ( isBaseFrame === i || i >= numFrames - looseFrames ) ) ? (
                            <li
                                key={i}
                                tabIndex={0}
                                ref={( el ) => {
                                    if ( selectedFrame === i && el ) {
                                        elementToFocus.current = el;
                                    }
                                }}
                                style={{
                                    cursor: "pointer",
                                    paddingLeft: "var(--size-2)",
                                    paddingRight: "var(--size-1)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    background:
                                        !showOnlyFramesets &&
                                        isBaseFrame === i &&
                                        i < numFrames - looseFrames
                                            ? "var(--yellow-1)"
                                            : grey
                                            ? "var(--gray-2)"
                                            : "white",
                                }}
                                onKeyDown={( evt ) => {
                                    if (
                                        selectedFrame === null ||
                                        selectedBaseFrame === null
                                    ) {
                                        return;
                                    }

                                    evt.preventDefault();
                                    if ( evt.key === "ArrowDown" ) {
                                        if ( i >= numFrames - looseFrames ) {
                                            setFrame( selectedFrame + 1 );
                                        } else {
                                            setBaseFrame( selectedFrame + 1 );
                                        }
                                    } else if ( evt.key === "ArrowUp" ) {
                                        if ( i >= numFrames - looseFrames ) {
                                            setFrame( selectedFrame - 1 );
                                        } else {
                                            setBaseFrame( selectedFrame - 1 );
                                        }
                                    } else if ( evt.key === "PageUp" ) {
                                        const f = selectedFrame - 17;
                                        if ( f < 0 ) {
                                            if (
                                                Math.floor( numFrames / 17 ) * 17 +
                                                    ( selectedBaseFrame % 17 ) >
                                                numFrames
                                            ) {
                                                setFrame(
                                                    Math.floor( numFrames / 17 ) * 16 +
                                                        ( selectedBaseFrame % 17 )
                                                );
                                            } else {
                                                setFrame(
                                                    Math.floor( numFrames / 17 ) * 17 +
                                                        ( selectedBaseFrame % 17 )
                                                );
                                            }
                                            // setFrame(selectedBaseFrame);
                                        } else {
                                            setFrame( f );
                                        }
                                    } else if ( evt.key === "PageDown" ) {
                                        const f = selectedFrame + 17;
                                        if ( f > blockFrameCount ) {
                                            setFrame( selectedBaseFrame % 17 );
                                        } else {
                                            setFrame( f );
                                        }
                                    }
                                    setFocusElement( true );
                                }}
                                onClick={() => {
                                    if ( i >= numFrames - looseFrames ) {
                                        setFrame( i );
                                    } else {
                                        setBaseFrame( i );
                                    }
                                }}>
                                <span>{i}</span> <span>{i % 17}</span>
                            </li>
                        ) : null;
                    } )}
                </ul>
            </section>
        </aside>
    );
};
