type F = ( ...args: any[] ) => any;
export type Resolve<T> = T extends F ? T : { [K in keyof T]: T[K] };
