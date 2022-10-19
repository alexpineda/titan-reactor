import { KeyboardEvent } from "react";

import { KeyboardPreview } from "./keyboard-preview";
import { worldEventsList } from "@core/world/world-events";
import { MacroDTO, TriggerType } from "common/types";
import { useMacroStore } from "./use-macros-store";

import { HotkeyTrigger, HotkeyTriggerDTO } from "@macros/hotkey-trigger";
import { WorldEventTrigger, WorldEventTriggerDTO } from "@macros/world-event-trigger";
import { ManualTrigger } from "@macros/manual-trigger";

export const ConfigureTrigger = ( { macro }: { macro: MacroDTO } ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateMacro } = useMacroStore();

    const hotkeyTrigger =
        macro.trigger.type === TriggerType.Hotkey
            ? HotkeyTrigger.deserialize( macro.trigger.value as HotkeyTriggerDTO )
            : null;

    const eventTrigger =
        macro.trigger.type === TriggerType.WorldEvent
            ? WorldEventTrigger.deserialize( macro.trigger.value as WorldEventTriggerDTO )
            : null;

    const updateTriggerValue = ( value: unknown ) => {
        updateMacro( {
            ...macro,
            trigger: {
                ...macro.trigger,
                value,
            },
        } );
    };

    const changeHotkeyTriggerKey = async ( e: KeyboardEvent<HTMLInputElement> ) => {
        e.preventDefault();

        const key = await hotkeyTrigger!.value.generateKeyComboFromEvent( e );
        if ( key ) {
            updateTriggerValue( hotkeyTrigger!.serialize() );
        }
    };

    return (
        <>
            <div
                style={{ display: "flex", alignItems: "center", gap: "var(--size-2)" }}>
                <label>
                    Trigger Type:&nbsp;
                    <select
                        onChange={( e ) => {
                            const type =
                                TriggerType[e.target.value as keyof typeof TriggerType];
                            let trigger;
                            switch ( type ) {
                                case TriggerType.Hotkey:
                                    trigger = new HotkeyTrigger();
                                    break;
                                case TriggerType.WorldEvent:
                                    trigger = new WorldEventTrigger();
                                    break;
                                default:
                                    trigger = new ManualTrigger();
                            }
                            updateMacro( {
                                ...macro,
                                trigger: {
                                    type: type,
                                    value: trigger.serialize(),
                                },
                            } );
                        }}
                        value={macro.trigger.type}>
                        {Object.keys( TriggerType ).map( ( key ) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ) )}
                    </select>
                </label>
                <div>
                    {hotkeyTrigger && (
                        <div>
                            <input
                                value={hotkeyTrigger.stringify()}
                                onKeyDown={changeHotkeyTriggerKey}
                                readOnly={true}
                            />
                            <label>
                                On KeyUp&nbsp;
                                <input
                                    type="checkbox"
                                    checked={hotkeyTrigger.onKeyUp}
                                    onChange={( e ) => {
                                        hotkeyTrigger.onKeyUp = e.target.checked;
                                        updateTriggerValue( hotkeyTrigger.serialize() );
                                    }}
                                />
                            </label>
                        </div>
                    )}
                    {eventTrigger && (
                        <select
                            onChange={( e ) => {
                                eventTrigger.eventName = e.target.value;
                                updateTriggerValue( eventTrigger.serialize() );
                            }}
                            value={eventTrigger.eventName}>
                            {worldEventsList.map( ( event ) => (
                                <option key={event} value={event}>
                                    {event}
                                </option>
                            ) )}
                        </select>
                    )}
                </div>
            </div>
            {macro.trigger.type === TriggerType.Hotkey && (
                <KeyboardPreview
                    previewKey={
                        HotkeyTrigger.deserialize(
                            macro.trigger.value as HotkeyTriggerDTO
                        ).value.codes[0]
                    }
                    svgProps={{
                        style: {
                            width: "var(--size-11)",
                            filter: "brightness(1) saturate(0.3) hue-rotate(133deg)",
                            position: "absolute",
                            right: "var(--size-6)",
                            top: "var(--size-12)",
                        },
                    }}
                />
            )}
        </>
    );
};
