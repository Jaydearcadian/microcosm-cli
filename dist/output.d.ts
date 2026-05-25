export type CommandResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
};
export declare const ok: (stdout?: string) => CommandResult;
export declare const fail: (stderr: string, exitCode?: number) => CommandResult;
export declare const json: (value: unknown) => string;
export declare const table: (rows: Array<[string, string]>) => string;
