export type Id<T> = {} & { [P in keyof T]: T[P] };
export type RecursiveId<T> = T extends object ? {} & { [P in keyof T]: RecursiveId<T[P]> } : T;