import { useProcessStore } from "@stores/process-store";
import { useLayoutEffect, useRef } from "react";
import { Color } from "three";

interface LoadBarProps {
    color: string;
    thickness: number;
    style?: object;
}

export const LoadBar = ( { color, thickness, style }: LoadBarProps ) => {
    const divRef = useRef<HTMLDivElement>( null );

    useLayoutEffect( () => {
        if ( divRef.current ) {
            divRef.current.style.transform = "scaleX(0)";
        }

        return useProcessStore.subscribe( ( store ) => {
            if ( !divRef.current ) return;
            divRef.current.style.transform = `scaleX(${store.getTotalProgress()})`;
        } );
    }, [] );

    const c1 = new Color( color );
    const hsl = {
        h: 0,
        s: 0,
        l: 0,
    };
    c1.getHSL( hsl );
    hsl.l -= 0.75;
    c1.setHSL( hsl.h, hsl.s, hsl.l );

    hsl.h += 0.1;
    hsl.l -= 0.1;
    const c2 = new Color().setHSL( hsl.h, hsl.s, hsl.l );
    const gradient = c2.getHexString();

    return (
        <div
            style={{
                background: `linear-gradient(-45deg, ${color}, #${gradient})`,
                backgroundSize: "400% 400%",
                animation: "gradient 15s ease infinite",
                height: `${thickness}px`,
                width: "100%",
                position: "relative",
                ...style,
            }}>
            <div
                ref={divRef}
                style={{
                    position: "absolute",
                    background: color,
                    height: `${thickness}px`,
                    width: "100%",
                }}></div>
        </div>
    );
};
