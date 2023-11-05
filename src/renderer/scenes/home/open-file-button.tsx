import { globalEvents } from "@core/global-events";
import { openFile } from "@ipc/files";
import { SVGProps, useRef } from "react";

export const OpenFileButton = (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
    const inputRef = useRef<HTMLInputElement>( null );
    const append = useRef( true );

    return (
        <>
            <svg
                style={{
                    width: "48px",
                    color: "#ecedad66",
                    cursor: "pointer",
                }}
                {...props}
                onClick={( evt ) => {
                    if ( inputRef.current ) {
                        append.current = !evt.shiftKey;
                        inputRef.current.click();
                    }
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                />
            </svg>

            <input
                ref={inputRef}
                type="file"
                id="theFile"
                style={{ position: "absolute", left: "-10000px" }}
                multiple
                accept=".rep,.scm,.scx"
                onChange={async ( evt ) => {
                    evt.preventDefault();
                    if ( evt.target.files ) {
                        const files = [];
                        for ( const file of evt.target.files ) {
                            files.push({
                                name: file.name,
                                buffer: await openFile(file),
                            })
                        }
                        globalEvents.emit( "queue-files", {
                            files,
                        } );
                    }
                }}
            />
        </>
    );
};
