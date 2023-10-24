import { capitalizeFirstLetters } from "@utils/string-utils";
import { getSessionSettingsInLevaFormat } from "common/get-app-settings-leva-config";
import { FieldDefinition } from "common/types";
import React from "react";
import { useSettingsStore } from "@stores/settings-store";

interface Props {
    onChange: ( evt: React.ChangeEvent<HTMLSelectElement> ) => void;
    value: string;
    disabled?: boolean;
    onlyConditional?: boolean;
}
export const SessionSettingsDropDown = ( {
    onChange,
    value,
    disabled,
    onlyConditional,
}: Props ) => {
    const settings = useSettingsStore.getState();
    const config = getSessionSettingsInLevaFormat(
        settings.data,
        settings.activatedPlugins
    );

    return (
        <select onChange={onChange} value={value} disabled={disabled}>
            {Object.keys( config ).map( ( key ) => {
                const field = config[key as keyof typeof config] as FieldDefinition & {
                    conditionOnly?: boolean;
                };
                if ( field.conditionOnly && !onlyConditional ) {
                    return null;
                }
                return (
                    <option key={key} value={key}>
                        {capitalizeFirstLetters( key.split( "." )[0] )} &gt;{" "}
                        {field.label!.replace( "(Default)", "" )}
                    </option>
                );
            } )}
        </select>
    );
};
