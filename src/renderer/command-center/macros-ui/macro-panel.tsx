import { useEffect, useRef, useState } from "react";
import {
    PluginMetaData,
    MacroDTO,
    Operator,
    ConditionComparator,
    MacroActionSequence,
} from "common/types";
import { ActionablePanel } from "./actionable-panel/actionable-panel";
import { CreateMacroConditionOrAction } from "./create-macro-condition-or-action";

import { useMacroStore } from "./use-macros-store";
import { MathUtils } from "three";
import { ConfigureTrigger } from "./configure-trigger";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { spaceOutCapitalLetters } from "@utils/string-utils";
import usePrevious from "@utils/react/use-previous";
import { PreviewContext } from "./PreviewContext";

import groupBy from "lodash.groupby";
import { ActionableGroupPanel } from "./actionable-panel/actionable-group-panel";

export const MacroPanel = ( {
    macro,
    pluginsMetadata,
}: {
    macro: MacroDTO;
    pluginsMetadata: PluginMetaData[];
} ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateMacro, createActionable, deleteMacro, macros } = useMacroStore();
    const [ activePreview, setActivePreview ] = useState( false );

    const renameMacro = ( name: string | null ) => {
        if ( name !== null && name.trim() !== "" ) {
            if ( nameRef.current ) {
                nameRef.current.innerText = name;
            }
            updateMacro( { ...macro, name } );
        }
    };

    const changeMacroDescription = ( description: string | null ) => {
        if ( description !== null && description.trim() !== "" ) {
            if ( descriptionRef.current ) {
                descriptionRef.current.innerText = description;
            }
            updateMacro( { ...macro, description } );
        }
    };

    const nameRef = useRef<HTMLSpanElement>( null );
    const descriptionRef = useRef<HTMLSpanElement>( null );

    useEffect( () => {
        if ( nameRef.current ) {
            nameRef.current.innerText = macro.name.split( ":" ).slice( -1 )[0];
        }
    }, [ macro.name ] );

    useEffect( () => {
        if ( descriptionRef.current ) {
            descriptionRef.current.innerText =
                macro.description ?? "Write a description for this macro";
        }
    }, [ macro.description ] );

    const prevActivePreview = usePrevious( activePreview );

    useEffect( () => {
        if ( activePreview && macro.actionSequence === MacroActionSequence.AllSync ) {
            sendWindow( InvokeBrowserTarget.Game, {
                type: SendWindowActionType.ManualMacroTrigger,
                payload: macro.id,
            } );
        } else if ( !activePreview && activePreview !== prevActivePreview ) {
            sendWindow( InvokeBrowserTarget.Game, {
                type: SendWindowActionType.ResetMacroActions,
                payload: macro.id,
            } );
        }
    }, [
        activePreview,
        macros.revision,
        prevActivePreview,
        macro.id,
        macro.actionSequence,
    ] );

    return (
        <div
            style={{
                padding: "var(--size-4)",
                borderRadius: "var(--size-4)",
                boxShadow: "2px 2px 10px -6px",
            }}>
            <span
                style={{
                    display: "flex",
                    gap: "var(--size-3)",
                    padding: "var(--size-3)",
                    alignItems: "center",
                    justifyContent: "start",
                    marginBottom: "var(--size-5)",
                    flexWrap: "wrap"
                }}>
                <div>
                    <h4
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                        <span
                            ref={nameRef}
                            contentEditable
                            onFocus={() => {
                                nameRef.current!.innerText = macro.name;
                            }}
                            onKeyDown={( e ) => {
                                if ( e.code === "Enter" ) {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                            }}
                            onBlur={( e ) => {
                                renameMacro( e.target.textContent );
                                nameRef.current!.innerText = e.target
                                    .textContent!.split( ":" )
                                    .slice( -1 )[0];
                            }}></span>
                    </h4>
                    <div
                        style={{
                            paddingBlock: "var(--size-3)",
                        }}>
                        <span
                            ref={descriptionRef}
                            contentEditable
                            style={{
                                display: "inline-block",
                                width: "50ch"
                            }}
                            onFocus={() => {
                                descriptionRef.current!.innerText =
                                    macro.description ?? "";
                            }}
                            onKeyDown={( e ) => {
                                if ( e.code === "Enter" ) {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                            }}
                            onBlur={( e ) => {
                                changeMacroDescription( e.target.textContent );
                                descriptionRef.current!.innerText =
                                    e.target.textContent!;
                            }}></span>
                    </div>
                </div>

                <span>
                    <label>
                        Sequence{" "}
                        <select
                            onChange={( evt ) => {
                                updateMacro( {
                                    ...macro,
                                    actionSequence:
                                        MacroActionSequence[
                                            evt.target
                                                .value as keyof typeof MacroActionSequence
                                        ],
                                } );
                            }}
                            value={macro.actionSequence}>
                            {Object.keys( MacroActionSequence ).map( ( key ) => (
                                <option key={key} value={key}>
                                    {spaceOutCapitalLetters( key )}
                                </option>
                            ) )}
                        </select>
                    </label>
                </span>

                <div
                    style={{
                        display: "flex",
                        justifySelf: "end",
                        alignItems: "center",
                        gap: "var(--size-4)",
                        marginLeft: "auto",
                    }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={macro.enabled}
                            onChange={( e ) =>
                                updateMacro( { ...macro, enabled: e.target.checked } )
                            }
                        />
                        Enabled
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={activePreview}
                            onChange={( e ) => setActivePreview( e.target.checked )}
                        />{" "}
                        Active Preview{" "}
                        {macro.actionSequence !== MacroActionSequence.AllSync && (
                            <>(On Edit)</>
                        )}
                    </label>

                    <button
                        onClick={() => {
                            sendWindow( InvokeBrowserTarget.Game, {
                                type: SendWindowActionType.ManualMacroTrigger,
                                payload: macro.id,
                            } );
                        }}>
                        Run
                    </button>

                    <button
                        onClick={() => {
                            sendWindow( InvokeBrowserTarget.Game, {
                                type: SendWindowActionType.ResetMacroActions,
                                payload: macro.id,
                            } );
                        }}>
                        Reset Preview
                    </button>

                    <button
                        style={{
                            color: "var(--red-6)",
                            padding: "var(--size-2)",
                        }}
                        onClick={() => deleteMacro( macro.id )}>
                        <i
                            className="material-icons"
                            style={{
                                fontSize: "var(--font-size-4)",
                            }}>
                            delete
                        </i>
                    </button>
                </div>
            </span>

            {macro.error && <p style={{ color: "var(--red-6)" }}>{macro.error}</p>}

            <ConfigureTrigger macro={macro} />

            <div
                style={{
                    display: "flex",
                    gap: "var(--size-2)",
                    paddingBlock: "var(--size-4)",
                }}>
                <CreateMacroConditionOrAction
                    label="Condition"
                    onCreate={() => {
                        createActionable( macro, {
                            type: "condition",
                            id: MathUtils.generateUUID(),
                            path: [ ":app" ],
                            comparator: ConditionComparator.Equals,
                        } );
                    }}
                    pluginsMetadata={pluginsMetadata}
                />
                <CreateMacroConditionOrAction
                    label="Action"
                    onCreate={() => {
                        createActionable( macro, {
                            type: "action",
                            id: MathUtils.generateUUID(),
                            path: [ ":app" ],
                            operator: Operator.Set,
                        } );
                    }}
                    pluginsMetadata={pluginsMetadata}
                />
            </div>
            <div>
                <PreviewContext.Provider
                    value={
                        activePreview &&
                        macro.actionSequence !== MacroActionSequence.AllSync
                    }>
                    {macro.conditions.length > 0 && (
                        <p
                            style={{
                                fontStyle: "italic",
                                marginBlock: "var(--size-8)",
                            }}>
                            Conditions
                        </p>
                    )}
                    {macro.conditions.map( ( condition, index ) => (
                        <ActionablePanel
                            key={condition.id}
                            index={index}
                            macro={macro}
                            action={condition}
                            pluginsMetadata={pluginsMetadata}
                        />
                    ) )}
                    {macro.actions.length > 0 && (
                        <p
                            style={{
                                fontStyle: "italic",
                                marginBlock: "var(--size-8)",
                            }}>
                            Actions
                        </p>
                    )}
                    {Object.entries( groupBy( macro.actions, ( action ) => action.group ) )
                        .sort( ( a, b ) => Number( a[0] ) - Number( b[0] ) )
                        .map( ( [ groupId, actions ], index ) => (
                            <ActionableGroupPanel
                                key={groupId}
                                index={index}
                                groupId={groupId}
                                macro={macro}
                                actions={actions}
                                pluginsMetadata={pluginsMetadata}
                            />
                        ) )}
                </PreviewContext.Provider>
            </div>
        </div>
    );
};
