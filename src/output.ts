export type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export const ok = (stdout = ""): CommandResult => ({ exitCode: 0, stdout, stderr: "" });
export const fail = (stderr: string, exitCode = 1): CommandResult => ({ exitCode, stdout: "", stderr });

export const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const table = (rows: Array<[string, string]>): string =>
  rows.map(([key, value]) => `${key.padEnd(14)} ${value}`).join("\n") + "\n";
