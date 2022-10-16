type SetGetType =
    | "i8"
    | "i16"
    | "i32"
    | "i64"
    | "float"
    | "double"
    | "i8*"
    | "i16*"
    | "i32*"
    | "i64*"
    | "float*"
    | "double*"
    | "*";

export interface EmscriptenPreamble extends EmscriptenHeap {
    UTF8ToString: ( ptr: number ) => string | undefined;
    stringToUTF8( str: string, outPtr: number, maxBytesToWrite: number ): void;
    UTF16ToString( ptr: number ): string | undefined;
    stringToUTF16( str: string, outPtr: number, maxBytesToWrite: number ): void;
    UTF32ToString( ptr: number ): string | undefined;
    stringToUTF32( str: string, outPtr: number, maxBytesToWrite: number ): void;
    AsciiToString( ptr: number ): string | undefined;
    intArrayFromString( stringy: string, dontAddNull: boolean, length: number ): number[];
    intArrayToString( array: number[] ): string;
    writeArrayToMemory( array: number[], buffer: number ): void;
    writeAsciiToMemory( str: string, buffer: number, dontAddNull: boolean ): void;

    ccall(
        ident: string,
        returnType: "number" | "string" | "boolean" | null,
        argTypes?: ( "number" | "string" | "array" | "boolean" )[],
        args?: ( number | number[] | string | string[] | boolean | boolean[] )[],
        opts?: { async: boolean }
    ): unknown;
    cwrap(
        ident: string,
        returnType: "number" | "string" | "array" | null,
        argTypes?: "number" | "string" | "boolean",
        opts?: { async: boolean }
    ): unknown;
    setValue( ptr: number, value: number, type: SetGetType ): void;
    getValue( ptr: number, type: SetGetType ): number;
    stackTrace(): string;
}

export interface EmscriptenHeap {
    HEAP8: Int8Array;
    HEAPU8: Uint8Array;
    HEAP16: Int16Array;
    HEAPU16: Uint16Array;
    HEAP32: Int32Array;
    HEAPU32: Uint32Array;
    allocate: ( buffer: ArrayBuffer, flags: number ) => number;
    _free: ( buffer: number ) => void;
    ALLOC_NORMAL: number;
}
