import { ReactNode } from "react";
import CommanderImage from "./marine.png";

export const GlobalErrorState = ( {
    error,
    action,
}: {
    error: Error;
    action: ReactNode;
} ) => {
    return (
        <div
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "wait",
                color: "#ffeedd",
                fontFamily: "Conthrax",
            }}>
            <img
                style={{
                    filter: "sepia(0.5) hue-rotate(101deg) saturate(6.5) blur(1px)",
                    borderRadius: "var(--radius-6)",
                }}
                src={CommanderImage}
            />
            <p
                style={{
                    marginBlock: "3rem",
                    color: "var(--blue-2)",
                    fontFamily: "Conthrax",
                }}>
                Commander. We have a problem.
            </p>
            <p
                style={{
                    color: "var(--yellow-2)",
                    fontFamily: "Inter, sans-serif",
                }}>
                {error.message}
                {import.meta.env.DEV && error.stack}
            </p>
            {action}
        </div>
    );
};
