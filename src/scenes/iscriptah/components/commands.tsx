import { useState, useRef, useEffect } from "react";
import shallow from "zustand/shallow";
import { iscriptHeaders } from "common/enums";
import { interactiveOpCodes } from "../utils/framesets";
import useDirectionalFrame from "../utils/useDirectionalFrame";
import { useIscriptStore, setBaseFrame } from "../stores";
import { useGameStore } from "@stores/game-store";
import { Block } from "common/types";

export const Commands = ( { selectedBlock }: { selectedBlock: Block } ) => {
    const bwDat = useGameStore( ( state ) => state.assets!.bwDat );

    const { blockFrameCount } = useIscriptStore(
        ( store ) => ( {
            blockFrameCount: store.blockFrameCount,
            selectedBlock: store.block,
            frame: store.frame,
        } ),
        shallow
    );

    const [showOnlyPlayFrame, setShowOnlyPlayFrame] = useState( true );
    const [clickEl, setClickEl] = useState<number | null>( null );
    const elToClick = useRef<HTMLLIElement>();

    const { offset, header } = selectedBlock;
    const animationBlocks = bwDat.iscript.animations;
    const cmds = animationBlocks[offset];
    const headerLabel = iscriptHeaders[header];
    //TODO: set to main camera direction :()
    const cameraDirection = 0;
    const [getDirectionalFrame, areFrameSetsEnabled] = useDirectionalFrame(
        cmds,
        !!selectedBlock.image.gfxTurns,
        blockFrameCount,
        cameraDirection
    );

    useEffect( () => {
        elToClick.current && elToClick.current.click();
        elToClick.current && elToClick.current.focus();
        setClickEl( null );
    }, [clickEl] );

    const clickNext = ( prevIndex: number ) => {
        if ( !cmds.find( ( [op] ) => interactiveOpCodes.includes( op ) ) ) {
            return;
        }

        let index = prevIndex + 1;
        if ( index > cmds.length - 1 ) {
            index = 0;
        }
        if ( !interactiveOpCodes.includes( cmds[index][0] ) ) {
            clickNext( index );
        } else {
            setClickEl( index );
        }
    };

    const clickPrev = ( prevIndex: number ) => {
        if ( !cmds.find( ( [op] ) => interactiveOpCodes.includes( op ) ) ) {
            return;
        }

        let index = prevIndex - 1;
        if ( index < 0 ) {
            index = cmds.length - 1;
        }
        // find next element
        if ( !interactiveOpCodes.includes( cmds[index][0] ) ) {
            clickPrev( index );
        } else {
            setClickEl( index );
        }
    };

    return (
        <aside
            className="bg-gray-100 flex-0 flex flex-col max-h-screen overflow-y-scroll px-2  pb-10"
            style={{
                background: "var(--gray-1)",
                // flex: 0,
                display: "flex",
                flexDirection: "column",
                maxHeight: "100%",
                overflowY: "scroll",
                paddingInline: "var(--space-2)",
                paddingBottom: "var(--space-10)",
                minWidth: "15rem",
            }}>
            <header style={{ padding: "var(--size-2)" }}>
                <p style={{ fontSize: "var(--font-size-1)", fontStyle: "italic" }}>
                    IScript Animation
                </p>
                <p
                    style={{ fontSize: "var(--font-size-2)", color: "var(--blue-8)" }}
                    aria-label={`using ${offset}`}
                    data-balloon-pos="down">
                    {headerLabel}
                </p>

                <div>
                    <label>
                        show only playfram{" "}
                        <input
                            type="checkbox"
                            checked={showOnlyPlayFrame}
                            onChange={() => setShowOnlyPlayFrame( !showOnlyPlayFrame )}
                        />
                    </label>
                </div>
            </header>
            <section className="p-2">
                <ul>
                    {cmds &&
                        cmds
                            .map( ( cmd, i: number ) => [cmd, i] )
                            //@ts-expect-error
                            .filter( ( [[op]] ) =>
                                showOnlyPlayFrame
                                    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                      interactiveOpCodes.includes( op )
                                    : true
                            )
                            .map( ( cmd, i: number ) => {
                                return (
                                    <li
                                        tabIndex={0}
                                        onKeyDown={( evt ) => {
                                            evt.preventDefault();
                                            if ( evt.key === "ArrowDown" ) {
                                                clickNext( i );
                                            } else if ( evt.key === "ArrowUp" ) {
                                                clickPrev( i );
                                            }
                                        }}
                                        ref={( el ) => {
                                            if ( clickEl === i && el ) {
                                                elToClick.current = el;
                                            }
                                        }}
                                        onClick={() => {
                                            //@ts-expect-error
                                            if ( !interactiveOpCodes.includes( cmd[0] ) )
                                                return;
                                            if ( areFrameSetsEnabled( cmd ) ) {
                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                                const [frame, flip] =
                                                    getDirectionalFrame( cmd );
                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                                setBaseFrame( frame, flip );
                                            } else {
                                                //@ts-expect-error
                                                setBaseFrame( cmd[1] );
                                            }
                                        }}
                                        style={{
                                            padding: "var(--size-2)",
                                            borderRadius: "var(--border-size-1)",
                                            userSelect: "none",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            //@ts-expect-error
                                            cursor: interactiveOpCodes.includes( cmd[0] )
                                                ? "pointer"
                                                : "default",
                                            background: interactiveOpCodes.includes(
                                                // @ts-expect-error
                                                cmd[0]
                                            )
                                                ? "var(--green-1)"
                                                : "inherit",
                                        }}
                                        // ${
                                        //   frame !== null &&
                                        //   getDirectionalFrame(cmd) !== null &&
                                        //   getDirectionalFrame(cmd)[0] === frame
                                        //     ? "bg-green-200"
                                        //     : ""
                                        // }`}
                                        key={i}>
                                        <span>
                                            {cmd[0]} {cmd.slice( 1 ).join( " " )}
                                        </span>
                                        {areFrameSetsEnabled( cmd ) && (
                                            <span
                                                style={{
                                                    borderRadius:
                                                        "var(--border-size-1)",
                                                    background: "var(--gray-4)",
                                                    marginLeft: "var(--size-2)",
                                                    marginRight: "var(--size-1)",
                                                    fontSize: "var(--font-size-1)",
                                                }}
                                                aria-label="`/w direction"
                                                data-balloon-pos="down">
                                                {getDirectionalFrame( cmd )[0]}
                                            </span>
                                        )}
                                    </li>
                                );
                            } )}
                </ul>
            </section>
        </aside>
    );
};
