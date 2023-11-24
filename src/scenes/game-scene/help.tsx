import { HotkeyTrigger, HotkeyTriggerDTO } from "@macros/hotkey-trigger";
import { useMacroStore } from "@stores/settings-store";
import { TriggerType } from "common/types";

type HelpProps = {
    onClose: () => void;
};
export const Help = ({ onClose }: HelpProps) => {
    const macros = useMacroStore((store) => store.macros.macros).filter(
        (macro) => macro.enabled && macro.trigger.type === TriggerType.Hotkey
    );

    return (
        <div
            style={{
                color: "white",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "10px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
            }}>
            <div
            style={{
                "cursor": "pointer",
            }}
                onClick={(evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    onClose();
                }}>
                Back
            </div>
            <h1>Help</h1>
            <div>
                Visit{" "}
                <a
                    style={{ textDecoration: "underline" }}
                    target="_blank"
                    href="https://www.blacksheepwall.tv">
                    blacksheepwall.tv
                </a>{" "}
                for more information.
            </div>
            <div
                style={{
                    maxHeight: "60vh",
                    overflow: "scroll",
                    overflowX: "hidden",
                }}>
                <p>
                    Most of the controls are managed by Macros or Scene Controller
                    plugins. You can find these in the Control Panel.
                </p>
                <table style={{fontSize: "0.8em", marginTop: "2rem"}}>
                    <thead>
                        <th>Key</th>
                        <th>Macro</th>
                        <th>Description</th>
                    </thead>
                    {macros.map((macro) => {
                        const trigger = HotkeyTrigger.deserialize(
                            macro.trigger.value as HotkeyTriggerDTO
                        );
                        return (
                            <tr>
                                <td>{trigger.stringify()}</td>
                                <td>{macro.name}</td>
                                <td>{macro.description}</td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        </div>
    );
};
