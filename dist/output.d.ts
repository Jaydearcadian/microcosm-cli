export type CommandResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
};
export declare const ok: (stdout?: string) => CommandResult;
export declare const fail: (stderr: string, exitCode?: number) => CommandResult;
export declare const json: (value: unknown) => string;
export declare const table: (rows: Array<[string, string]>) => string;
export declare const cyan: (text: string) => string;
export declare const green: (text: string) => string;
export declare const yellow: (text: string) => string;
export declare const red: (text: string) => string;
export declare const dim: (text: string) => string;
export declare const bold: (text: string) => string;
export declare const truncate: (value: string, length?: number) => string;
export declare const badge: (label: string, tone?: "success" | "warning" | "danger" | "info") => string;
export declare const panel: (title: string, lines: string[], width?: number) => string;
