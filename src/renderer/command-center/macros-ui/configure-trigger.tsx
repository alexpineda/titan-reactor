import { KeyboardEvent } from "react";

import { KeyboardPreview } from "./keyboard-preview";
import { worldEventsList } from "@core/world/world-events";
import { MacroDTO, TriggerType } from "common/types";
import { useMacroStore } from "./use-macros-store";

import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { ManualTrigger } from "@macros/manual-trigger";

export const ConfigureTrigger = ({ macro }: { macro: MacroDTO }) => {
  const { updateMacro } = useMacroStore();

  const hotkeyTrigger =
    macro.trigger.type === TriggerType.Hotkey
      ? HotkeyTrigger.deserialize(macro.trigger.value)
      : null;

  const mouseTrigger =
    macro.trigger.type === TriggerType.Mouse
      ? MouseTrigger.deserialize(macro.trigger.value)
      : null;

  const eventTrigger =
    macro.trigger.type === TriggerType.WorldEvent
      ? WorldEventTrigger.deserialize(macro.trigger.value)
      : null;

  const updateTriggerValue = (value: any) => {
    updateMacro({
      ...macro,
      trigger: {
        ...macro.trigger,
        value,
      },
    });
  };

  const changeHotkeyTriggerKey = async (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = await hotkeyTrigger!.value.generateKeyComboFromEvent(e);
    if (key) {
      updateTriggerValue(hotkeyTrigger!.serialize());
    }
  };

  const changeMouseTriggerCode = async (e: MouseEvent) => {
    e.preventDefault();
    mouseTrigger!.copy(e);
    updateTriggerValue(mouseTrigger!.serialize());
  };

  {
    /* trigger configuration */
  }
  return (
    <>
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--size-2)" }}
      >
        <label>
          Trigger Type:&nbsp;
          <select
            onChange={(e) => {
              const type =
                TriggerType[e.target.value as keyof typeof TriggerType];
              let trigger;
              switch (type) {
                case TriggerType.Hotkey:
                  trigger = new HotkeyTrigger();
                  break;
                case TriggerType.Mouse:
                  trigger = new MouseTrigger();
                  break;
                case TriggerType.WorldEvent:
                  trigger = new WorldEventTrigger();
                  break;
                default:
                  trigger = new ManualTrigger();
              }
              updateMacro({
                ...macro,
                trigger: {
                  type: type,
                  value: trigger.serialize(),
                },
              });
            }}
            value={macro.trigger.type}
          >
            {Object.keys(TriggerType).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
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
                  onChange={(e) => {
                    hotkeyTrigger.onKeyUp = e.target.checked;
                    updateTriggerValue(hotkeyTrigger.serialize());
                  }}
                />
              </label>
            </div>
          )}
          {mouseTrigger && (
            <input
              value={mouseTrigger.stringify()}
              onMouseDown={(e) => changeMouseTriggerCode(e.nativeEvent)}
              readOnly={true}
            />
          )}
          {eventTrigger && (
            <select
              onChange={(e) => {
                eventTrigger.eventName = e.target.value;
                updateTriggerValue(eventTrigger.serialize());
              }}
              value={eventTrigger.eventName}
            >
              {worldEventsList.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {macro.trigger.type === TriggerType.Hotkey && (
        <KeyboardPreview
          previewKey={
            HotkeyTrigger.deserialize(macro.trigger.value).value.codes[0]
          }
          svgProps={{
            style: {
              // margin: "0 var(--size-3) 0 auto",
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
